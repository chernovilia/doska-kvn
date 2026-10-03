'use client';

// Яндекс.Метрика. Номер счётчика и Вебвизор задаются в админке (Настройки → «Яндекс.Метрика»),
// сюда приходят через GET /site → analytics. Номер 0 — счётчик не подключается вообще.
// Цели — «JavaScript-событие» с этими идентификаторами (их нужно создать в кабинете Метрики):
//   login, ad_published, message_sent, phone_shown,
//   install_prompt_shown, install_clicked, install_accepted, banner_clicked, push_prompt_shown, push_enabled
let counterId = 0;

export function metrikaId() {
  return counterId;
}

// Адрес страницы для Метрики. Номер переписки в адресе — лишнее: шлём просто /messages.
function pageUrl() {
  const { origin, pathname, search } = window.location;
  return pathname.startsWith('/messages') ? origin + pathname : origin + pathname + search;
}

export function initMetrika({ id, webvisor = false }) {
  if (typeof window === 'undefined' || !id || counterId) return;
  counterId = id;
  // Стандартный загрузчик Метрики
  window.ym =
    window.ym ||
    function () {
      (window.ym.a = window.ym.a || []).push(arguments);
    };
  window.ym.l = Date.now();
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://mc.yandex.ru/metrika/tag.js';
  document.head.appendChild(s);
  window.ym(id, 'init', {
    defer: true, // просмотры страниц шлём сами: сайт не перезагружается при переходах
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: !!webvisor
  });
  hit();
}

let lastHit = '';
export function hit() {
  if (!counterId || typeof window === 'undefined') return;
  const url = pageUrl();
  if (url === lastHit) return;
  const referer = lastHit || document.referrer;
  lastHit = url;
  window.ym(counterId, 'hit', url, { title: document.title, referer });
}

export function goal(name) {
  if (!counterId || typeof window === 'undefined' || !window.ym) return;
  try {
    window.ym(counterId, 'reachGoal', name);
  } catch {}
}
