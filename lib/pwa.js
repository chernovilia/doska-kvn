// Приложение (PWA): платформа и браузер, «открыто с иконки», установка, пуши.
// Всё только в браузере — на сервере функции возвращают безопасные значения.
import { deletePushSubscription, getPushKey, getSiteSettings, reportAppEvent, reportAppOpen, savePushSubscription } from './api';

// ── Правила показа окон — из админки (GET /site → app), здесь значения по умолчанию ──

export const APP_DEFAULTS = {
  'app.install.enabled': true,
  'app.install.after_publish': true,
  'app.install.every_nth_visit': 2,
  'app.install.visit_gap_min': 30,
  'app.install.delay_sec': 8,
  'app.install.dismiss_days': 14,
  'app.banner.enabled': true,
  'app.push.after_message': true,
  'app.push.after_publish': true,
  'app.push.ask_every_days': 14,
  texts: {}
};

let appConfig = APP_DEFAULTS;

export function getAppConfig() {
  return appConfig;
}

// Один раз при запуске; без сети — значения по умолчанию.
export async function loadAppConfig() {
  const s = await getSiteSettings();
  appConfig = { ...APP_DEFAULTS, ...(s.app || {}) };
  return appConfig;
}

// ── Платформа ─────────────────────────────────────────────────────

/**
 * os: ios | android | desktop
 * browser: safari | chrome | yandex | samsung | firefox | edge | vk | other
 * inApp: встроенный браузер приложения (ВК, Telegram, Instagram…) — установить оттуда обычно нельзя
 */
export function detectPlatform() {
  if (typeof navigator === 'undefined') return { os: 'desktop', browser: 'other', inApp: false };
  const ua = navigator.userAgent || '';
  const android = /Android/i.test(ua);
  // iPad с iPadOS притворяется Mac — узнаём по сенсорному экрану (но не Android на эмуляторе)
  const ios = !android && (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  const os = ios ? 'ios' : android ? 'android' : 'desktop';
  let browser = 'other';
  if (/vkclient|VKAndroidApp|com\.vkontakte|VKApp/i.test(ua)) browser = 'vk';
  else if (/YaBrowser|YaApp|YaSearchBrowser/i.test(ua)) browser = 'yandex';
  else if (/SamsungBrowser/i.test(ua)) browser = 'samsung';
  else if (/EdgiOS|EdgA|Edg\//i.test(ua)) browser = 'edge';
  else if (/FxiOS|Firefox/i.test(ua)) browser = 'firefox';
  else if (/CriOS|Chrome/i.test(ua)) browser = 'chrome';
  else if (ios && /Safari/i.test(ua)) browser = 'safari';
  const inApp = browser === 'vk' || /FBAN|FBAV|Instagram|Telegram|; wv\)/i.test(ua) || (ios && !/Safari/i.test(ua) && browser === 'other');
  return { os, browser, inApp };
}

// Открыто как приложение — с иконки на экране «Домой», без адресной строки.
export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// Случайный id устройства для метрик: у установленного приложения на iPhone своё хранилище,
// поэтому id в приложении и в Safari разные — это и нужно (считаем именно установки).
export function deviceId() {
  try {
    let id = localStorage.getItem('app.deviceId');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('app.deviceId', id);
    }
    return id;
  } catch {
    return null;
  }
}

export function trackAppOpen(source = 'standalone') {
  const id = deviceId();
  if (!id) return;
  const { os, browser } = detectPlatform();
  reportAppOpen({ deviceId: id, platform: os, browser, source });
}

export const trackAppEvent = reportAppEvent;

// ── Установка (Android, Chrome и Edge на компьютере) ──────────────
// beforeinstallprompt приходит один раз и рано — ловим при загрузке модуля.

let deferredPrompt = null;
const installListeners = new Set();
const emitInstall = () => installListeners.forEach((fn) => fn(!!deferredPrompt));

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // своё окно вместо мини-плашки браузера
    deferredPrompt = e;
    emitInstall();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    emitInstall();
    trackAppOpen('appinstalled');
  });
}

export function canPromptInstall() {
  return !!deferredPrompt;
}

export function onInstallAvailability(fn) {
  installListeners.add(fn);
  return () => installListeners.delete(fn);
}

// Системное окно установки. 'accepted' | 'dismissed' | 'unavailable'
export async function promptInstall() {
  if (!deferredPrompt) return 'unavailable';
  const e = deferredPrompt;
  deferredPrompt = null;
  emitInstall();
  e.prompt();
  const { outcome } = await e.userChoice;
  return outcome;
}

// ── Окно установки: когда показывать ─────────────────────────────

const DISMISS_KEY = 'app.installDismissedAt';
const VISITS_KEY = 'app.visits';

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

// Заход = новая сессия: больше 30 минут без активности. По вкладке считать нельзя — на Android
// Chrome и ВК не закрывают вкладки, и «новый заход» открывает ту же вкладку с тем же sessionStorage.
const LAST_SEEN_KEY = 'app.lastSeen';

// { visits, isNew }: isNew — этот вызов начал новый заход (счётчик увеличен).
export function countVisit() {
  const now = Date.now();
  const last = Number(read(LAST_SEEN_KEY) || 0);
  let visits = Number(read(VISITS_KEY) || 0);
  const isNew = !last || now - last > appConfig['app.install.visit_gap_min'] * 60_000;
  if (isNew) {
    visits += 1;
    write(VISITS_KEY, String(visits));
  }
  write(LAST_SEEN_KEY, String(now));
  return { visits, isNew };
}

// Человек на сайте — заход продолжается.
export function touchVisit() {
  write(LAST_SEEN_KEY, String(Date.now()));
}

// Пауза после «Не показывать» — до какого момента (0 — паузы нет).
export function installPausedUntil() {
  const at = Number(read(DISMISS_KEY) || 0);
  return at ? at + appConfig['app.install.dismiss_days'] * 86_400_000 : 0;
}

export function installDismissedRecently() {
  return installPausedUntil() > Date.now();
}

export function dismissInstall() {
  write(DISMISS_KEY, String(Date.now()));
}

// Баннер установки вверху страниц: свой крестик и своя пауза (срок тот же, что у окна).
const BANNER_KEY = 'app.bannerDismissedAt';

export function bannerPausedUntil() {
  const at = Number(read(BANNER_KEY) || 0);
  return at ? at + appConfig['app.install.dismiss_days'] * 86_400_000 : 0;
}

export function dismissBanner() {
  write(BANNER_KEY, String(Date.now()));
}

// Можно ли вообще установить с этого устройства (или хотя бы объяснить как).
export function installSupported() {
  if (isStandalone()) return false;
  const { os, browser } = detectPlatform();
  if (os === 'ios') return true; // Safari, Chrome, ВК — через «Поделиться»; остальным — открыть в Safari
  if (os === 'android') return true;
  return canPromptInstall() || browser === 'chrome' || browser === 'edge' || browser === 'yandex';
}

// ── Пуши ─────────────────────────────────────────────────────────

function b64ToUint8(base64) {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function browserSupportsPush() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Состояние пушей для интерфейса:
 * off — можно включить; on — включены; denied — запрещены в настройках браузера;
 * needs-install — iPhone в браузере: пуши только у установленного приложения;
 * unsupported — браузер не умеет или пуши выключены на сервере.
 */
export async function pushState() {
  if (typeof window === 'undefined') return 'unsupported';
  const { os } = detectPlatform();
  if (!browserSupportsPush()) return os === 'ios' && !isStandalone() ? 'needs-install' : 'unsupported';
  if (!(await getPushKey())) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  return sub && Notification.permission === 'granted' ? 'on' : 'off';
}

async function sendSubscription(sub) {
  const { os } = detectPlatform();
  await savePushSubscription({ ...sub.toJSON(), platform: os, deviceId: deviceId() });
}

// Включить: разрешение браузера → подписка → сохранить на сервере. Возвращает новое состояние.
export async function enablePush() {
  if (!browserSupportsPush()) return pushState();
  const key = await getPushKey();
  if (!key) return 'unsupported';
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'off';
  const reg = await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ||
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(key) }));
  await sendSubscription(sub);
  trackAppEvent('push_enabled');
  return 'on';
}

export async function disablePush() {
  const reg = await navigator.serviceWorker?.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await deletePushSubscription(sub.endpoint).catch(() => {});
    await sub.unsubscribe().catch(() => {});
  }
  return 'off';
}

// Выход из аккаунта: сервер перестаёт слать пуши на это устройство. Разрешение браузера и сама
// подписка остаются — при следующем входе resyncPush привяжет её к новому аккаунту.
export async function detachPush() {
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) await deletePushSubscription(sub.endpoint);
  } catch {}
}

// При каждом запуске: если пуши включены — напомнить серверу подписку (новый вход, сменился адрес).
export async function resyncPush() {
  if (!browserSupportsPush() || Notification.permission !== 'granted') return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) await sendSubscription(sub).catch(() => {});
}

// Предложение включить пуши — не чаще раза в 14 дней.
const PUSH_ASKED_KEY = 'app.pushAskedAt';
export function pushAskPausedUntil() {
  const at = Number(read(PUSH_ASKED_KEY) || 0);
  return at ? at + appConfig['app.push.ask_every_days'] * 86_400_000 : 0;
}

export function pushAskedRecently() {
  return pushAskPausedUntil() > Date.now();
}

// Диагностика (/app-status): что знает это устройство о заходах и паузах.
export function appLocalState() {
  return {
    visits: Number(read(VISITS_KEY) || 0),
    lastSeen: Number(read(LAST_SEEN_KEY) || 0),
    installPausedUntil: installPausedUntil(),
    bannerPausedUntil: bannerPausedUntil(),
    pushAskPausedUntil: pushAskPausedUntil(),
    deviceId: read('app.deviceId')
  };
}

// Сбросить показы на этом устройстве: заходы, паузы «Не показывать» (окно и баннер) и предложения уведомлений.
export function resetAppLocalState() {
  for (const k of [VISITS_KEY, LAST_SEEN_KEY, DISMISS_KEY, BANNER_KEY, PUSH_ASKED_KEY]) {
    try {
      localStorage.removeItem(k);
    } catch {}
  }
}
export function markPushAsked() {
  write(PUSH_ASKED_KEY, String(Date.now()));
}

// Счётчик непрочитанных на иконке установленного приложения.
export function setAppBadge(n) {
  if (typeof navigator === 'undefined' || !isStandalone()) return;
  try {
    if (n > 0) navigator.setAppBadge?.(n);
    else navigator.clearAppBadge?.();
  } catch {}
}
