// Снимки экранов сайта для роликов: node marketing/src/shots.js
// Chrome без окна открывает страницы в размере телефона и сохраняет PNG в marketing/src/screens.
// Лента снимается с настоящего сайта (страница открыта всем). Подача объявления и переписка —
// с локальной копии с примерами: чужие имена и переписку в рекламу не берём.
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { CHROME } = require('./build');

const OUT = path.join(__dirname, 'screens');
const PORT = 9378;
const W = 390;
const H = 844;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

// Список снимков приходит из файла-сценария: [{ name, url, cookie?, height?, wait?, js? }]
async function main() {
  const plan = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  fs.mkdirSync(OUT, { recursive: true });
  const profile = fs.mkdtempSync(path.join(require('os').tmpdir(), 'shots-'));
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'], {
    stdio: 'ignore'
  });
  try {
    let target;
    for (let i = 0; i < 50 && !target; i++) {
      await sleep(200);
      try {
        target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page');
      } catch {}
    }
    if (!target) throw new Error('Chrome не запустился');
    const cdp = await connect(target.webSocketDebuggerUrl);
    await cdp.send('Page.enable');
    await cdp.send('Network.enable');
    await cdp.send('Emulation.setUserAgentOverride', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
    });
    // Без баннера установки, окна установки и полосы про cookie — они закрывают сам интерфейс
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `try { const now = String(Date.now()); localStorage.setItem('app.bannerDismissedAt', now); localStorage.setItem('app.installDismissedAt', now); localStorage.setItem('app.pushAskedAt', now); localStorage.setItem('cookie.noticeOk', '1'); sessionStorage.setItem('app.pushHintHidden', '1'); } catch {}`
    });
    for (const s of plan) {
      const height = s.height || H;
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: W, height, deviceScaleFactor: 2, mobile: true });
      if (s.cookie) await cdp.send('Network.setCookie', { name: 'access_token', value: s.cookie, url: s.url });
      await cdp.send('Page.navigate', { url: s.url });
      await sleep(s.wait || 3500);
      if (s.js) {
        const r = await cdp.send('Runtime.evaluate', { expression: s.js, awaitPromise: true, returnByValue: true });
        if (r.exceptionDetails) console.log(s.name, 'js error:', r.exceptionDetails.exception?.description?.slice(0, 200));
        await sleep(s.after || 800);
      }
      // transparent — снимок без фона страницы (для нижнего меню, которое накладывается поверх ленты)
      await cdp.send('Emulation.setDefaultBackgroundColorOverride', s.transparent ? { color: { r: 0, g: 0, b: 0, a: 0 } } : {});
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(OUT, `${s.name}.png`), Buffer.from(data, 'base64'));
      console.log(s.name);
    }
    cdp.close();
  } finally {
    chrome.kill();
    await sleep(300);
    fs.rmSync(profile, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
