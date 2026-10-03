// Длинный ролик для историй (21 секунда), три части:
//   1) общий «запуск» — заголовок и плитки разделов;
//   2) экраны сайта в рамке телефона — лента, подача объявления, переписка;
//   3) концовка — «всё бесплатно и без ограничений» и призыв установить приложение по ссылке.
// Экраны лежат в src/screens (снимаются скриптом shots.js с локальной копии сайта;
// объявления, имена и переписка на них — примеры, не настоящие пользователи). Собирает video.js.
const fs = require('fs');
const path = require('path');
const { html, conceptFor } = require('./build');

const W = 1080;
const SCREENS = path.join(__dirname, 'screens');
const ICONS = JSON.parse(fs.readFileSync(path.join(__dirname, 'icons.json'), 'utf8'));
const img = (name) => `file://${path.join(SCREENS, name)}`;
const icon = (name, color, width = 2.4) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

// Раскадровка, секунды
const T = {
  introOut: 5.8, // заголовок и плитки уходят
  phoneIn: 6.3, // телефон выезжает
  screens: [6.6, 9.5, 12.5], // начало показа каждого экрана
  phoneOut: 15.3, // телефон уходит
  outro: 15.8, // концовка
  end: 21
};
const SECONDS = T.end;

// Экран телефона: 390×844 точек, в ролике — 536 пикселей в ширину
const PHONE_W = 536;
const K = PHONE_W / 390;
const PHONE_H = Math.round(844 * K);

// Анимация на всю длину ролика: точки [секунда, свойства]; между точками — плавный переход
function timeline(name, points) {
  const frames = points
    .map(([t, props]) => `${((t / SECONDS) * 100).toFixed(3)}% { ${props}; animation-timing-function: cubic-bezier(0.3, 0.7, 0.2, 1); }`)
    .join(' ');
  return `@keyframes ${name} { ${frames} }`;
}
// Элемент появляется в момент from (всплывает снизу) и остаётся; до этого скрыт
const appear = (name, from, dur = 0.5, hidden = 'opacity: 0; transform: translateY(40px)') =>
  timeline(name, [[0, hidden], [from, hidden], [from + dur, 'opacity: 1; transform: none'], [SECONDS, 'opacity: 1; transform: none']]) +
  ` .${name} { animation: ${name} ${SECONDS}s linear both; }`;

// Подписи над телефоном
const CAPTIONS = ['Свежие объявления<br>вашего города', 'Подать своё&nbsp;—<br>пара минут', 'Переписка прямо<br>на&nbsp;сайте'];

// Концовка: что бесплатно и без ограничений
const PERKS = ['Объявлений&nbsp;— сколько угодно', 'Без платы и&nbsp;подписок', 'Без паролей: вход по&nbsp;почте'];

function storyLongHtml() {
  // За основу — обычный анимированный «запуск» для историй; дописываем вторую и третью части
  const base = html(conceptFor('launch'), 'story', { animated: true });

  const captions = CAPTIONS.map((text, i) => {
    const from = T.screens[i] + 0.3;
    const to = i + 1 < T.screens.length ? T.screens[i + 1] - 0.1 : T.phoneOut;
    return {
      css:
        timeline(`cap${i}`, [
          [0, 'opacity: 0; transform: translateY(30px)'],
          [from, 'opacity: 0; transform: translateY(30px)'],
          [from + 0.5, 'opacity: 1; transform: none'],
          [to, 'opacity: 1; transform: none'],
          [to + 0.4, 'opacity: 0; transform: translateY(-24px)'],
          [SECONDS, 'opacity: 0; transform: translateY(-24px)']
        ]) + ` .cap${i} { animation: cap${i} ${SECONDS}s linear both; }`,
      html: `<div class="cap cap${i}">${text}</div>`
    };
  });

  const scroll = Math.round(300 * K); // лента прокручивается на 300 точек
  const off = 'transform: translateX(100%)';
  const extraCss = `
  .main { animation: introOut 0.6s ease-in ${T.introOut}s both; }
  @keyframes introOut { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(-60px); } }
  .b1 { animation: drift1 ${SECONDS}s ease-in-out both; }
  .b2 { animation: drift2 ${SECONDS}s ease-in-out both; }
  /* Адрес сайта: появляется в первой части, в концовке вырастает и пульсирует */
  .url { transform-origin: left center; animation: pop 0.55s cubic-bezier(0.3, 1.3, 0.5, 1) 4.4s both, urlGrow ${SECONDS}s linear both; }
  ${timeline('urlGrow', [[0, 'scale: 1'], [T.outro + 2.2, 'scale: 1'], [T.outro + 2.8, 'scale: 1.22'], [T.outro + 3.5, 'scale: 1.3'], [T.outro + 4.1, 'scale: 1.22'], [T.outro + 4.7, 'scale: 1.3'], [SECONDS, 'scale: 1.22']])}
  .free { animation: fade 0.5s ease-out 4.8s both, freeOut ${SECONDS}s linear both; }
  ${timeline('freeOut', [[0, 'opacity: 1'], [T.outro + 2.0, 'opacity: 1'], [T.outro + 2.4, 'opacity: 0'], [SECONDS, 'opacity: 0']])}

  .ui { position: absolute; left: 0; right: 0; top: 250px; display: flex; flex-direction: column; align-items: center; }
  .caps { position: relative; width: 100%; height: 170px; }
  .cap { position: absolute; left: 0; right: 0; text-align: center; font-size: 62px; line-height: 1.1; font-weight: 900; letter-spacing: -0.03em; color: #0f172a; }
  .phone { margin-top: 36px; width: ${PHONE_W + 28}px; height: ${PHONE_H + 28}px; border: 14px solid #0f172a; border-radius: 64px; background: #0f172a; overflow: hidden; box-shadow: 0 40px 80px rgba(15, 23, 42, 0.18); animation: phone ${SECONDS}s linear both; }
  ${timeline('phone', [
    [0, 'opacity: 0; transform: translateY(260px) scale(0.94)'],
    [T.phoneIn, 'opacity: 0; transform: translateY(260px) scale(0.94)'],
    [T.phoneIn + 0.75, 'opacity: 1; transform: none'],
    [T.phoneOut, 'opacity: 1; transform: none'],
    [T.phoneOut + 0.6, 'opacity: 0; transform: translateY(200px) scale(0.92)'],
    [SECONDS, 'opacity: 0; transform: translateY(200px) scale(0.92)']
  ])}
  .screen { position: relative; width: ${PHONE_W}px; height: ${PHONE_H}px; border-radius: 50px; overflow: hidden; background: #f8fafc; }
  .screen > div { position: absolute; inset: 0; overflow: hidden; background: #f8fafc; }
  .screen img { display: block; width: ${PHONE_W}px; }
  /* Лента медленно прокручивается под неподвижным нижним меню */
  .feed-scroll { animation: feedScroll ${SECONDS}s linear both; }
  ${timeline('feedScroll', [[0, 'transform: none'], [T.screens[0] + 0.9, 'transform: none'], [T.screens[1] - 0.2, `transform: translateY(-${scroll}px)`], [SECONDS, `transform: translateY(-${scroll}px)`]])}
  .feed-nav { position: absolute; left: 0; bottom: 0; }
  /* Следующие экраны въезжают справа */
  .s2 { animation: s2 ${SECONDS}s linear both; }
  ${timeline('s2', [[0, off], [T.screens[1], off], [T.screens[1] + 0.6, 'transform: none'], [SECONDS, 'transform: none']])}
  .s3 { animation: s3 ${SECONDS}s linear both; }
  ${timeline('s3', [[0, off], [T.screens[2], off], [T.screens[2] + 0.6, 'transform: none'], [SECONDS, 'transform: none']])}
  ${captions.map((c) => c.css).join('\n  ')}

  /* Концовка */
  .outro { position: absolute; left: 80px; right: 80px; top: 330px; }
  .big { font-size: 138px; line-height: 0.98; font-weight: 900; letter-spacing: -0.04em; color: #0f172a; }
  .big em { font-style: normal; color: #ee8b45; }
  .big2 { margin-top: 18px; font-size: 84px; line-height: 1.05; font-weight: 900; letter-spacing: -0.035em; color: #0f172a; }
  .perks { margin-top: 64px; display: flex; flex-direction: column; gap: 30px; }
  .perk { display: flex; align-items: center; gap: 28px; font-size: 48px; font-weight: 700; line-height: 1.15; color: #1e293b; }
  .perk-ico { flex: none; width: 84px; height: 84px; border-radius: 50%; background: #ffefdf; display: grid; place-items: center; }
  .perk-ico svg { width: 44px; height: 44px; }
  .cta { position: absolute; left: 80px; right: 80px; bottom: 300px; }
  .cta-text { font-size: 66px; line-height: 1.08; font-weight: 900; letter-spacing: -0.03em; color: #0f172a; }
  .cta-arrow { margin-top: 26px; width: 96px; height: 96px; animation: arrowIn ${SECONDS}s linear both, bounce 0.9s ease-in-out ${(T.outro + 2.9).toFixed(2)}s 3; }
  .cta-arrow svg { width: 96px; height: 96px; }
  @keyframes bounce { 0%, 100% { translate: 0 0; } 50% { translate: 0 26px; } }
  ${timeline('arrowIn', [[0, 'opacity: 0'], [T.outro + 2.5, 'opacity: 0'], [T.outro + 2.9, 'opacity: 1'], [SECONDS, 'opacity: 1']])}
  ${appear('o-big', T.outro)}
  ${appear('o-big2', T.outro + 0.25)}
  ${PERKS.map((_, i) => appear(`o-perk${i}`, T.outro + 0.9 + i * 0.4, 0.45, 'opacity: 0; transform: scale(0.6)')).join('\n  ')}
  ${appear('o-cta', T.outro + 2.3)}`;

  const ui = `<div class="ui">
    <div class="caps">${captions.map((c) => c.html).join('')}</div>
    <div class="phone"><div class="screen">
      <div class="s1"><img class="feed-scroll" src="${img('feed-content.png')}"><img class="feed-nav" src="${img('feed-nav.png')}"></div>
      <div class="s2"><img src="${img('post-form.png')}"></div>
      <div class="s3"><img src="${img('chat.png')}"></div>
    </div></div>
  </div>
  <div class="outro">
    <div class="big o-big">Всё <em>бесплатно</em></div>
    <div class="big2 o-big2">и&nbsp;без ограничений</div>
    <div class="perks">${PERKS.map((text, i) => `<div class="perk o-perk${i}" style="transform-origin: left center"><div class="perk-ico">${icon('check', '#b35b22', 3)}</div><div>${text}</div></div>`).join('')}</div>
  </div>
  <div class="cta o-cta">
    <div class="cta-text">Установите приложение по&nbsp;ссылке</div>
    <div class="cta-arrow">${icon('arrow', '#ee8b45', 2.6)}</div>
  </div>`;

  return base.replace('</style>', `${extraCss}\n  </style>`).replace('<div class="foot">', `${ui}\n    <div class="foot">`);
}

module.exports = { storyLongHtml, SECONDS, WIDTH: W };
