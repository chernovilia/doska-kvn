// Сборка рекламных картинок: node marketing/src/build.js [часть имени]
// Из HTML-шаблона через установленный Chrome (без окна) получаются PNG в marketing/creatives.
// Общие сюжеты — в creatives/, варианты под город — в creatives/<город>/.
// Ролики собирает соседний video.js из этого же шаблона.
// Цвета и манера — как на сайте (documents/DESIGN.md): белый фон, мягкий оранжевый, кнопки с обводкой.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'creatives');
const TMP = path.join(ROOT, 'src', '.tmp');
const ICONS = JSON.parse(fs.readFileSync(path.join(__dirname, 'icons.json'), 'utf8'));

const icon = (name, color) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

// Плитки разделов — те же цвета, что на сайте
const TILES = {
  car: ['Авто', '#fef3c7', '#92400e'],
  realty: ['Недвижимость', '#e0f2fe', '#075985'],
  jobs: ['Работа', '#d1fae5', '#065f46'],
  services: ['Услуги', '#ffedd5', '#9a3412'],
  phone: ['Техника', '#dbeafe', '#1e40af'],
  home: ['Дом и дача', '#ecfccb', '#3f6212'],
  clothes: ['Одежда', '#fce7f3', '#9d174d'],
  kids: ['Детское', '#fef9c3', '#854d0e'],
  pets: ['Животные', '#ccfbf1', '#115e59'],
  hobby: ['Хобби', '#cffafe', '#155e75'],
  food: ['Продукты', '#dcfce7', '#166534'],
  lost: ['Находки', '#e7e5e4', '#292524'],
  gift: ['Даром', '#fee2e2', '#b91c1c']
};

const FORMATS = {
  square: [1080, 1080], // пост и объявление ВК
  vertical: [1080, 1350], // пост 4:5 — занимает больше места в ленте
  story: [1080, 1920], // истории и клипы
  wide: [1080, 607] // широкий баннер VK Рекламы, сниппет ссылки
};

// Города: папка, родительный падеж («объявления Выксы»), «из Выксы»
const CITIES = {
  vyksa: { gen: 'Выксы', from: 'из&nbsp;Выксы' },
  kulebaki: { gen: 'Кулебак', from: 'из&nbsp;Кулебак' },
  navashino: { gen: 'Навашино', from: 'из&nbsp;Навашино' }
};

const CONCEPTS = {
  launch: {
    title: 'Объявления Кулебак, Выксы и&nbsp;Навашино&nbsp;— в&nbsp;одном месте',
    sub: 'Купить, продать, найти работу, жильё и&nbsp;мастера рядом с&nbsp;домом',
    tiles: ['car', 'realty', 'jobs', 'services', 'phone', 'home', 'pets', 'food']
  },
  sell: {
    title: 'Продайте ненужное соседям',
    sub: 'Объявление&nbsp;— за&nbsp;пару минут, покупатели&nbsp;— из&nbsp;вашего города',
    points: [
      ['phone', 'Фото, цена, пара слов&nbsp;— и&nbsp;готово'],
      ['chat', 'Покупатель пишет прямо на&nbsp;сайте'],
      ['bell', 'Ответ приходит уведомлением на&nbsp;телефон']
    ]
  },
  lost: {
    title: 'Потеряли или&nbsp;нашли?',
    sub: 'Бюро находок Кулебак, Выксы и&nbsp;Навашино: ключи, документы, телефоны, питомцы',
    tiles: ['lost', 'pets', 'gift']
  },
  jobs: {
    title: 'Работа и&nbsp;подработка рядом с&nbsp;домом',
    sub: 'Вакансии и&nbsp;резюме Кулебак, Выксы и&nbsp;Навашино. Без&nbsp;посредников.',
    tiles: ['jobs', 'services', 'car', 'home']
  }
};

// Сюжет с упором на один город (launch и sell)
function conceptFor(name, city) {
  const c = CONCEPTS[name];
  if (!city) return c;
  const { gen, from } = CITIES[city];
  if (name === 'launch') return { ...c, title: `Объявления ${gen}&nbsp;— в&nbsp;одном&nbsp;месте` };
  if (name === 'sell') return { ...c, sub: `Объявление&nbsp;— за&nbsp;пару минут, покупатели&nbsp;— ${from}` };
  return c;
}

// animated — для роликов: каждому слову заголовка, плитке и кнопке своя анимация появления
function html(c, format, { animated = false } = {}) {
  const [w, h] = FORMATS[format];
  const wide = format === 'wide';
  const tall = format === 'story';
  const square = format === 'square';
  // Всё в долях ширины, чтобы один шаблон подходил всем размерам
  const u = (n) => `${(n * w) / 1080}px`;
  // В вертикальном с двумя рядами плиток заголовок меньше, иначе не помещается
  const manyTiles = (c.tiles || []).length > 4;
  const titleSize = wide ? 64 : tall ? 112 : square || manyTiles ? 84 : 96;
  const tileSize = wide ? 104 : tall ? 210 : square ? 190 : manyTiles ? 156 : 190;
  const tiles = (c.tiles || [])
    .slice(0, wide || square ? 4 : 8)
    .map((k) => {
      const [label, bg, fg] = TILES[k];
      return `<div class="tile pop"><div class="tile-ico" style="background:${bg}">${icon(k, fg)}</div><div class="tile-label">${label}</div></div>`;
    })
    .join('');
  const points = (c.points || [])
    .map(([k, text]) => `<div class="point pop"><div class="point-ico">${icon(k, '#b35b22')}</div><div>${text}</div></div>`)
    .join('');
  const visual = points ? `<div class="points">${points}</div>` : `<div class="tiles">${tiles}</div>`;
  const title = animated
    ? c.title
        .split(' ')
        .map((word) => `<span class="word">${word}</span>`)
        .join(' ')
    : c.title;

  // Ролик: логотип → слова заголовка → подзаголовок → плитки по одной → адрес сайта, в конце кнопка «дышит»
  const motion = !animated
    ? ''
    : `
  @keyframes rise { from { opacity: 0; transform: translateY(${u(46)}); } to { opacity: 1; transform: none; } }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pop { 0% { opacity: 0; transform: scale(0.55); } 65% { opacity: 1; transform: scale(1.07); } 100% { opacity: 1; transform: none; } }
  @keyframes pulse { 0%, 100% { transform: none; } 50% { transform: scale(1.06); } }
  @keyframes drift1 { from { transform: translate(${u(60)}, ${u(-40)}) scale(0.92); } to { transform: translate(${u(-30)}, ${u(30)}) scale(1.05); } }
  @keyframes drift2 { from { transform: translate(${u(-40)}, ${u(50)}) scale(0.9); } to { transform: translate(${u(30)}, ${u(-20)}) scale(1.1); } }
  .b1 { animation: drift1 8s ease-in-out both; }
  .b2 { animation: drift2 8s ease-in-out both; }
  .logo { animation: fade 0.5s ease-out both; }
  .word { display: inline-block; animation: rise 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  ${Array.from({ length: 12 }, (_, i) => `.word:nth-child(${i + 1}) { animation-delay: ${(0.35 + i * 0.1).toFixed(2)}s; }`).join('\n  ')}
  .sub { animation: rise 0.6s ease-out 1.5s both; }
  .pop { animation: pop 0.5s cubic-bezier(0.3, 1.3, 0.5, 1) both; }
  ${Array.from({ length: 8 }, (_, i) => `.pop:nth-child(${i + 1}) { animation-delay: ${(2.2 + i * (points ? 0.55 : 0.22)).toFixed(2)}s; }`).join('\n  ')}
  .url { animation: pop 0.55s cubic-bezier(0.3, 1.3, 0.5, 1) 4.4s both, pulse 1.1s ease-in-out 5.4s 2; }
  .free { animation: fade 0.5s ease-out 4.8s both; }`;

  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: ${w}px; height: ${h}px; }
  body { font-family: -apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif; color: #0f172a; background: #fff; overflow: hidden; position: relative; -webkit-font-smoothing: antialiased; }
  .blob { position: absolute; border-radius: 50%; }
  .b1 { width: ${u(760)}; height: ${u(760)}; right: ${u(-300)}; top: ${u(-320)}; background: #ffefdf; }
  .b2 { width: ${u(420)}; height: ${u(420)}; left: ${u(-190)}; bottom: ${u(-210)}; background: #fff8f1; }
  .wrap { position: relative; height: 100%; display: flex; flex-direction: column; padding: ${u(wide ? 52 : 80)} ${u(wide ? 60 : 80)}; }
  .logo { flex: none; margin-bottom: ${u(wide ? 8 : 28)}; font-weight: 900; font-size: ${u(wide ? 40 : 56)}; letter-spacing: -0.03em; }
  .logo span { color: #ee8b45; }
  .main { flex: 1; min-height: 0; display: flex; ${wide ? 'flex-direction: row; align-items: center; gap: ' + u(48) + ';' : 'flex-direction: column; justify-content: center; gap: ' + u(tall ? 88 : square ? 40 : 56) + ';'} }
  .text { ${wide ? 'flex: 1.25;' : ''} }
  h1 { font-size: ${u(titleSize)}; line-height: 1.04; font-weight: 900; letter-spacing: -0.035em; }
  .sub { margin-top: ${u(wide ? 18 : 30)}; font-size: ${u(wide ? 28 : tall ? 46 : 40)}; line-height: 1.3; color: #475569; font-weight: 500; }
  .tiles { ${wide ? 'flex: 1; display: grid; grid-template-columns: repeat(2, 1fr); gap: ' + u(18) + ';' : 'display: grid; grid-template-columns: repeat(4, 1fr); gap: ' + u(tall ? 44 : 26) + ' ' + u(20) + ';'} }
  .tile { display: flex; flex-direction: column; align-items: center; gap: ${u(wide ? 8 : 14)}; }
  .tile-ico { width: ${u(tileSize)}; height: ${u(tileSize)}; border-radius: ${u(tileSize * 0.28)}; display: grid; place-items: center; }
  .tile-ico svg { width: ${u(tileSize * 0.46)}; height: ${u(tileSize * 0.46)}; }
  .tile-label { font-size: ${u(wide ? 20 : tall ? 34 : 30)}; font-weight: 700; color: #1e293b; text-align: center; white-space: nowrap; }
  .points { ${wide ? 'flex: 1;' : ''} display: flex; flex-direction: column; gap: ${u(wide ? 16 : tall ? 44 : square ? 22 : 30)}; }
  .point { display: flex; align-items: center; gap: ${u(wide ? 16 : 28)}; font-size: ${u(wide ? 24 : tall ? 44 : square ? 34 : 38)}; font-weight: 700; line-height: 1.2; color: #1e293b; }
  .point-ico { flex: none; width: ${u(wide ? 60 : 92)}; height: ${u(wide ? 60 : 92)}; border-radius: ${u(wide ? 18 : 28)}; background: #ffefdf; display: grid; place-items: center; }
  .point-ico svg { width: ${u(wide ? 30 : 44)}; height: ${u(wide ? 30 : 44)}; }
  .foot { flex: none; margin-top: ${u(wide ? 8 : 28)}; display: flex; align-items: center; justify-content: space-between; gap: ${u(20)}; }
  .url { font-size: ${u(wide ? 32 : 46)}; font-weight: 900; letter-spacing: -0.02em; color: #b35b22; border: ${u(wide ? 4 : 5)} solid #ee8b45; border-radius: ${u(999)}; padding: ${u(wide ? 10 : 18)} ${u(wide ? 28 : 44)}; background: #fff; }
  .free { font-size: ${u(wide ? 24 : 34)}; font-weight: 800; color: #475569; }
  ${motion}
  </style></head><body>
  <div class="blob b1"></div><div class="blob b2"></div>
  <div class="wrap">
    <div class="logo">Доска<span>/</span>КВН</div>
    <div class="main">
      <div class="text"><h1>${title}</h1><div class="sub">${c.sub}</div></div>
      ${visual}
    </div>
    <div class="foot"><div class="url">доска-квн.рф</div><div class="free">Бесплатно</div></div>
  </div></body></html>`;
}

function shot(file, out, [w, h]) {
  execFileSync(
    CHROME,
    ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=${w},${h}`, `--screenshot=${out}`, `file://${file}`],
    { stdio: 'ignore' }
  );
}

function main() {
  fs.mkdirSync(TMP, { recursive: true });
  const only = process.argv[2];
  // Общие сюжеты и варианты под город (под город — только launch и sell: в них меняется текст)
  const jobs = [];
  for (const concept of Object.keys(CONCEPTS)) for (const format of Object.keys(FORMATS)) jobs.push({ concept, format });
  for (const city of Object.keys(CITIES))
    for (const concept of ['launch', 'sell']) for (const format of Object.keys(FORMATS)) jobs.push({ concept, format, city });

  for (const { concept, format, city } of jobs) {
    const name = `${city ? city + '/' : ''}${concept}-${format}`;
    if (only && !name.includes(only)) continue;
    const dir = city ? path.join(OUT, city) : OUT;
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(TMP, `${name.replace('/', '-')}.html`);
    fs.writeFileSync(file, html(conceptFor(concept, city), format));
    shot(file, path.join(dir, `${concept}-${format}.png`), FORMATS[format]);
    console.log(name);
  }
  fs.rmSync(TMP, { recursive: true, force: true });
}

module.exports = { html, conceptFor, FORMATS, CITIES, CHROME, ROOT };
if (require.main === module) main();
