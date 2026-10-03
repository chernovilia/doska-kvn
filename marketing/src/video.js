// Сборка роликов: node marketing/src/video.js [часть имени]
// Тот же шаблон, что у картинок (build.js), но с анимацией появления. Chrome без окна снимает
// кадр за кадром (время анимации выставляется вручную — результат всегда одинаковый),
// ffmpeg склеивает кадры в MP4. Нужны установленные Chrome и ffmpeg.
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const { html, conceptFor, FORMATS, CHROME, ROOT } = require('./build');
const story = require('./story');

const OUT = path.join(ROOT, 'video');
// Временные кадры и профиль Chrome — в системной временной папке: рабочий стол синхронизируется
// с iCloud, и десятки тысяч мелких файлов там не нужны
const TMP = path.join(require('os').tmpdir(), 'doska-kvn-video');
const FPS = 30;
const SECONDS = 8;
const PORT = 9377;

// Какие ролики собирать: сюжет × формат (8 секунд) и длинный ролик для историй с экранами сайта
const VIDEOS = [
  ['launch', 'vertical'],
  ['launch', 'story'],
  ['launch', 'square'],
  ['sell', 'story'],
  ['sell', 'square'],
  ['lost', 'story'],
  ['lost', 'square']
]
  .map(([concept, format]) => ({ name: `${concept}-${format}`, format, seconds: SECONDS, page: () => html(conceptFor(concept), format, { animated: true }) }))
  .concat([{ name: 'launch-story-long', format: 'story', seconds: story.SECONDS, page: story.storyLongHtml }]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Минимальный клиент протокола отладки Chrome: команда → ответ
function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const waiting = new Map();
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && waiting.has(msg.id)) {
        const { ok, fail } = waiting.get(msg.id);
        waiting.delete(msg.id);
        msg.error ? fail(new Error(msg.error.message)) : ok(msg.result);
      }
    };
    ws.onerror = () => reject(new Error('Не удалось подключиться к Chrome'));
    ws.onopen = () =>
      resolve({
        send: (method, params = {}) =>
          new Promise((ok, fail) => {
            waiting.set(++id, { ok, fail });
            ws.send(JSON.stringify({ id, method, params }));
          }),
        close: () => ws.close()
      });
  });
}

async function main() {
  const only = process.argv[2];
  fs.mkdirSync(OUT, { recursive: true });
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });

  const chrome = spawn(
    CHROME,
    ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`, `--user-data-dir=${path.join(TMP, 'profile')}`, 'about:blank'],
    { stdio: 'ignore' }
  );
  try {
    let target;
    for (let i = 0; i < 50 && !target; i++) {
      await sleep(200);
      try {
        const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
        target = list.find((t) => t.type === 'page');
      } catch {}
    }
    if (!target) throw new Error('Chrome не запустился');
    const cdp = await connect(target.webSocketDebuggerUrl);
    await cdp.send('Page.enable');

    for (const { name, format, seconds, page: makePage } of VIDEOS) {
      // Точное имя — только этот ролик; иначе все, в чьём имени есть эта часть
      if (only && (VIDEOS.some((v) => v.name === only) ? name !== only : !name.includes(only))) continue;
      const [w, h] = FORMATS[format];
      const page = path.join(TMP, `${name}.html`);
      fs.writeFileSync(page, makePage());
      const frames = path.join(TMP, name);
      fs.mkdirSync(frames, { recursive: true });

      await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
      await cdp.send('Page.navigate', { url: `file://${page}` });
      await sleep(1200); // картинки экранов должны успеть загрузиться
      const total = FPS * seconds;
      for (let f = 0; f < total; f++) {
        const ms = (f / FPS) * 1000;
        // Все анимации ставим на паузу и выставляем им одно и то же время
        await cdp.send('Runtime.evaluate', {
          expression: `document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ${ms}; }); new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`,
          awaitPromise: true
        });
        const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(frames, `f${String(f).padStart(4, '0')}.png`), Buffer.from(data, 'base64'));
      }
      const out = path.join(OUT, `${name}.mp4`);
      execFileSync(
        'ffmpeg',
        ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, 'f%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', out],
        { stdio: 'inherit' }
      );
      console.log(name, `${(fs.statSync(out).size / 1024).toFixed(0)} КБ`);
    }
    cdp.close();
  } finally {
    chrome.kill();
    await sleep(300);
    fs.rmSync(TMP, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
