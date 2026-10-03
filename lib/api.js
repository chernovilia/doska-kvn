/**
 * Единая точка входа для всех данных приложения.
 *
 * Динамические данные (объявления, регионы) — реальный API doska-kvn-api.
 * Профиль, чаты, отзывы, уведомления — пока моки, до реализации на бэке.
 * Справочники (SECTIONS, CATEGORY_GROUPS) — статические, в бандле (data/categories.js).
 *
 * URL API берётся из NEXT_PUBLIC_API_URL или фолбэк на Amvera-домен.
 * Позже сменим на api.доска-квн.рф после настройки Cloudflare.
 */

import {
  SECTIONS,
  FEED_SECTIONS,
  FREE_SECTION,
  CATEGORY_GROUPS,
  getCategoryGroups,
  getSection
} from '@/data/categories';
import {
  CITIES,
  REGIONS,
  DEFAULT_REGION_ID,
  getRegion,
  getCity,
  getCitiesOfRegion,
  cityName as cityNameSync,
  resolvePlace
} from '@/data/regions';

const API_URL =
  (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL) ||
  'https://doska-kvn-api-chernovilia.amvera.io/v1';

// ── Синхронные справочники ─────────────────────────────────────────

export {
  CITIES,
  SECTIONS,
  FEED_SECTIONS,
  FREE_SECTION,
  CATEGORY_GROUPS,
  getCategoryGroups,
  getSection,
  REGIONS,
  DEFAULT_REGION_ID,
  getRegion,
  getCity,
  getCitiesOfRegion,
  resolvePlace
};

export function cityName(id) {
  return cityNameSync(id);
}

// ── Сессия: тихое обновление access-токена ─────────────────────────
// Access-токен живёт 15 минут, страница открыта часами. Раньше после 15 минут любое
// действие (публикация, админка, чат) падало с «No access token» до перезагрузки.
// Теперь на 401 один раз обновляем сессию через refresh-cookie и повторяем запрос.
// Одновременные запросы ждут одно обновление, а не шлют по своему.
let _refreshing = null;

export function refreshSession() {
  if (!_refreshing) {
    _refreshing = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' }
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        setTimeout(() => {
          _refreshing = null;
        }, 0);
      });
  }
  return _refreshing;
}

async function authFetch(url, opts = {}) {
  const run = () => fetch(url, { ...opts, credentials: 'include' });
  const res = await run();
  if (res.status === 401 && (await refreshSession())) return run();
  return res;
}

// ── HTTP-помощник + memory-кеш ─────────────────────────────────────
// Кешируем ответы в памяти клиента с TTL под каждый тип endpoint-а.
// Регионы редко меняются → 5 мин. Счётчики, объявления → 30 сек.
// Кеш чистится сам по TTL, никаких invalidation-хуков не нужно.

const _cache = new Map();

function buildKey(path, params) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) {
    if (v != null && v !== '') search.set(k, String(v));
  }
  return `${path}?${search.toString()}`;
}

async function apiGet(path, params = {}, { ttlMs = 30_000 } = {}) {
  const key = buildKey(path, params);

  const hit = _cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.data;

  const url = new URL(`${API_URL}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  }
  // no-store: иначе Next кеширует серверные fetch до следующего деплоя, и /ad/[id]
  // показывает удалённые и отклонённые объявления. Кешируем сами — в _cache выше.
  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(`API ${path} → HTTP ${res.status}`);
  const data = await res.json();

  _cache.set(key, { data, expires: Date.now() + ttlMs });
  return data;
}

// Ручной сброс кеша по необходимости (например, после публикации объявления)
export function invalidateAdsCache() {
  for (const key of _cache.keys()) {
    if (key.startsWith('/ads')) _cache.delete(key);
  }
}

// ── Адаптер: сервер → формат, к которому привыкли компоненты ───────
// Бэк отдаёт cityId + photos[], фронт исторически ждёт city + image + gallery.
// Тут единый normalizer, чтобы компоненты не переписывать.
function normalizeAd(apiAd) {
  if (!apiAd) return null;
  const ad = {
    ...apiAd,
    city: apiAd.cityId || apiAd.city,
    image: apiAd.photos?.[0]?.url || apiAd.image || null,
    gallery: apiAd.photos?.map((p) => p.url) || apiAd.gallery || []
  };
  if (typeof window !== 'undefined' && ad.id) {
    _seenAds.set(ad.id, ad);
    _seenAds.set(String(ad.id).slice(0, 8), ad); // страница может быть открыта по короткой ссылке
  }
  return ad;
}

// Объявления, уже пришедшие в браузер (лента, похожие, мои). Экран загрузки /ad/[id]
// показывает из них фото, заголовок и цену мгновенно, пока сервер отдаёт страницу.
const _seenAds = new Map();

export function peekAd(id) {
  return _seenAds.get(id) || null;
}

// Публичные настройки из админки: соседние города, контакты подвала, правила окон приложения. Кеш 5 минут.
export async function getSiteSettings() {
  try {
    const data = await apiGet('/site', {}, { ttlMs: 300_000 });
    return {
      neighbors: data.neighbors || {},
      contacts: data.contacts || {},
      app: data.app || {},
      features: data.features || {},
      analytics: data.analytics || {}
    };
  } catch {
    return { neighbors: {}, contacts: {}, app: {}, features: {}, analytics: {} };
  }
}

// ── Объявления ─────────────────────────────────────────────────────

// Сколько объявлений в одной странице ленты; дальше — «Показать ещё». Делится на 2, 3 и 4 колонки.
export const FEED_PAGE = 60;

// Фильтры ленты: section (в т.ч. виртуальный 'free'), group — подгруппа раздела,
// search — строка поиска, sort — top|recent|cheap|expensive, priceMin/priceMax — ₽,
// attr — JSON фильтров по характеристикам ({"rooms":"2","area":{"gte":40}}).
export async function getAds({
  place = DEFAULT_REGION_ID,
  section = null,
  group = null,
  search = null,
  sort = null,
  priceMin = null,
  priceMax = null,
  attr = null, // JSON-строка фильтров по характеристикам
  limit = FEED_PAGE,
  includeNearby = false
} = {}) {
  const filters = { section, group, search, sort, priceMin, priceMax, attr };
  const params = { place, ...filters, limit };
  const p = includeNearby ? resolvePlace(place) : null;
  const wantsNearby = includeNearby && p?.kind === 'city';

  // Все запросы параллельно — primary + регион + соседи одновременно.
  const primaryPromise = apiGet('/ads', params, { ttlMs: 15_000 });
  // Соседи города: если в админке задан список — берём его, иначе остальные города региона
  // и запущенные соседние регионы (data/regions.js).
  const custom = wantsNearby ? (await getSiteSettings()).neighbors[p.id] : undefined;
  const nearbyPromise = !wantsNearby
    ? Promise.resolve([])
    : Array.isArray(custom)
      ? Promise.all(
          custom.map((cityId) =>
            apiGet('/ads', { place: cityId, ...filters, limit: 6 }, { ttlMs: 30_000 })
              .then((r) => r.items || [])
              .catch(() => [])
          )
        ).then((lists) => lists.flat())
      : Promise.all([
          apiGet('/ads', { place: p.region.id, ...filters, limit: 12 }, { ttlMs: 30_000 })
            .then((r) => (r.items || []).filter((a) => a.cityId !== p.id))
            .catch(() => []),
          // Только запущенные регионы: у остальных объявлений нет, а каждый запрос
          // из дальней сети — лишняя секунда ожидания.
          ...(p.region.neighbors || [])
            .filter((rid) => getRegion(rid)?.launched)
            .map((rid) =>
              apiGet('/ads', { place: rid, ...filters, limit: 6 }, { ttlMs: 30_000 })
                .then((r) => r.items || [])
                .catch(() => [])
            )
        ]).then((lists) => lists.flat());

  const [primaryRaw, nearbyRaw] = await Promise.all([primaryPromise, nearbyPromise]);

  const primary = (primaryRaw.items || []).map(normalizeAd);
  const hasMore = !!primaryRaw.hasMore;
  if (!wantsNearby) return { primary, nearby: [], hasMore };

  const nearby = nearbyRaw.map(normalizeAd).slice(0, 12);
  return { primary, nearby, hasMore };
}

// «Показать ещё»: следующая страница той же ленты. offset — сколько уже показано.
export async function getMoreAds({
  place = DEFAULT_REGION_ID,
  section = null,
  group = null,
  search = null,
  sort = null,
  priceMin = null,
  priceMax = null,
  attr = null,
  offset = 0
} = {}) {
  const raw = await apiGet(
    '/ads',
    { place, section, group, search, sort, priceMin, priceMax, attr, limit: FEED_PAGE, offset },
    { ttlMs: 15_000 }
  );
  return { items: (raw.items || []).map(normalizeAd), hasMore: !!raw.hasMore };
}

// cookie — строка Cookie входящего запроса (SSR): объявление на модерации или скрытое
// API отдаёт только автору и админам, поэтому серверный рендер идёт от их имени.
export async function getAd(id, { cookie } = {}) {
  try {
    if (cookie) {
      const res = await authFetch(`${API_URL}/ads/${id}`, {
        headers: { Accept: 'application/json', Cookie: cookie },
        cache: 'no-store'
      });
      if (!res.ok) return null;
      return normalizeAd(await res.json());
    }
    const data = await apiGet(`/ads/${id}`, {}, { ttlMs: 60_000 });
    return normalizeAd(data);
  } catch {
    return null;
  }
}

// Пока в API нет /similar — берём объявления того же региона и раздела.
export async function getSimilarAds(adOrId, limit = 6) {
  const src = typeof adOrId === 'string' ? await getAd(adOrId) : adOrId;
  if (!src) return [];
  const id = src.id;
  const data = await apiGet('/ads', {
    place: src.regionId || src.region?.id,
    section: src.section,
    limit: limit + 1
  });
  return (data.items || [])
    .filter((a) => a.id !== id)
    .slice(0, limit)
    .map(normalizeAd);
}

// ── Поиск с автокомплитом ──────────────────────────────────────────

export async function search(query) {
  const q = (query || '').trim();
  if (!q) return { sections: [], ads: [] };
  const sections = FEED_SECTIONS.filter((s) =>
    s.name.toLowerCase().includes(q.toLowerCase())
  );
  const data = await apiGet('/ads', { search: q, limit: 5 }).catch(() => ({ items: [] }));
  return {
    sections,
    ads: (data.items || []).map(normalizeAd)
  };
}

// ── Пользователь и связанные сущности ─────────────────────────────
// Всё через реальный API. Функции, для которых у бэка ещё нет эндпоинта
// (чаты, отзывы, уведомления), возвращают пустой список — UI покажет заглушки
// «скоро». Никаких MOCK_-данных не подмешиваем.

/**
 * Мои объявления. GET /v1/me/ads возвращает все статусы (approved/pending/rejected).
 */
export async function getMyAds() {
  try {
    // Не apiGet: тот не обновляет сессию, и на 401 профиль молча показал бы «нет объявлений»
    const data = await authRequest('/me/ads');
    return (data.items || []).map(normalizeAd);
  } catch {
    return [];
  }
}

// ── Чаты ──────────────────────────────────────────────────────────

// «Написать» по объявлению: находит или создаёт диалог, возвращает { id }.
export async function openConversation(adId) {
  return authRequest('/conversations', { method: 'POST', body: JSON.stringify({ adId }) });
}

export async function listConversations() {
  return authRequest('/conversations');
}

// after — ISO-время последнего полученного сообщения: для опроса только новые.
export async function getConversationMessages(id, after) {
  const qs = after ? `?after=${encodeURIComponent(after)}` : '';
  return authRequest(`/conversations/${id}/messages${qs}`);
}

export async function sendChatMessage(id, text) {
  return authRequest(`/conversations/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text })
  });
}

export async function getUnreadCount() {
  return authRequest('/conversations/unread-count');
}

// ── Отзывы ────────────────────────────────────────────────────────

// Отзывы о пользователе, свежие сверху.
export async function getUserReviews(userId) {
  const data = await apiGet(`/users/${encodeURIComponent(userId)}/reviews`, {}, { ttlMs: 15_000 });
  return data.items || [];
}

// { eligible, reason: 'no_dialog' | 'too_early' | 'already' | null, review,
//   need: { messages, hours }, mine, theirs, readyAt } — для приглашения оценить в чате.
export async function getReviewEligibility(conversationId) {
  return authRequest(`/conversations/${conversationId}/review`);
}

export async function createReview({ conversationId, rating, text }) {
  const review = await authRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify({ conversationId, rating, text: text || undefined })
  });
  for (const key of _cache.keys()) if (key.startsWith('/users/')) _cache.delete(key);
  return review;
}

// ── Уведомления ───────────────────────────────────────────────────

export async function getNotifications() {
  const data = await authRequest('/notifications');
  return data.items || [];
}

export async function getNotificationsUnread() {
  return authRequest('/notifications/unread-count');
}

export async function markNotificationRead(id) {
  return authRequest(`/notifications/${id}/read`, { method: 'POST' });
}

export async function markAllNotificationsRead() {
  return authRequest('/notifications/read-all', { method: 'POST' });
}

// Публичный профиль по slug — эндпоинт ещё не готов.
export async function getBusinessBySlug() { return null; }

// Опубликованные объявления продавца — для его публичной страницы.
export async function getAdsByAuthor(authorId, limit = 60) {
  const data = await apiGet('/ads', { authorId, sort: 'recent', limit }, { ttlMs: 15_000 });
  return (data.items || []).map(normalizeAd);
}

// Публичный профиль продавца: имя, аватар, рейтинг, город, «на Доске с». null — нет такого.
export async function getPublicUser(id) {
  try {
    return await apiGet(`/users/${encodeURIComponent(id)}`, {}, { ttlMs: 30_000 });
  } catch {
    return null;
  }
}

// Страница по своему адресу /u/<username>.
export async function getUserByUsername(username) {
  try {
    return await apiGet(`/users/by-username/${encodeURIComponent(username)}`, {}, { ttlMs: 30_000 });
  } catch {
    return null;
  }
}

// { available, reason?, username? } — свободен ли адрес (свой текущий — свободен).
export async function checkUsername(u) {
  const res = await fetch(`${API_URL}/users/username-available?u=${encodeURIComponent(u)}`, { credentials: 'include' });
  return res.json();
}

// Ссылка на публичную страницу: красивый адрес, если задан.
export function userPath(u) {
  if (!u) return '/';
  return u.username ? `/u/${u.username}` : `/user/${u.id}`;
}

// ── Приложение и пуши ─────────────────────────────────────────────

export async function getPushKey() {
  try {
    const data = await apiGet('/push/key', {}, { ttlMs: 600_000 });
    return data.key || null;
  } catch {
    return null;
  }
}

export async function savePushSubscription(sub) {
  return authRequest('/push/subscribe', { method: 'POST', body: JSON.stringify(sub) });
}

// «Выйти на других устройствах»: { ok, closed } — сколько сессий закрыто.
export async function logoutOtherDevices() {
  // Запросы к /auth/* сами сессию не обновляют — обновляем заранее (access живёт 15 минут)
  await refreshSession();
  return authRequest('/auth/logout-others', { method: 'POST' });
}

export async function deletePushSubscription(endpoint) {
  return authRequest('/push/subscribe', { method: 'DELETE', body: JSON.stringify({ endpoint }) });
}

// Метрики приложения: без ответа и без ошибок — не должны мешать работе.
export function reportAppOpen(body) {
  return authFetch(`${API_URL}/app/open`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true
  }).catch(() => {});
}

export function reportAppEvent(name) {
  return fetch(`${API_URL}/app/event`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
    keepalive: true
  }).catch(() => {});
}

export async function adminAppStats() {
  return authRequest('/admin/app');
}

// Обнулить метрики приложения (тестовые установки и показы перед запуском).
export async function adminResetAppStats() {
  return authRequest('/admin/app', { method: 'DELETE' });
}

// Разместить объявление за пользователя: { email, name, phone?, contactMethod?, ad: {…как при подаче} }.
export async function adminCreateAdForUser(body) {
  const data = await authRequest('/admin/ads/for-user', { method: 'POST', body: JSON.stringify(body) });
  invalidateAdsCache();
  return data;
}

// ── Избранное ─────────────────────────────────────────────────────

export async function getFavoriteIds() {
  return authRequest('/favorites/ids');
}

export async function getFavorites() {
  const data = await authRequest('/favorites');
  return (data.items || []).map(normalizeAd);
}

export async function addFavorite(adId) {
  return authRequest(`/favorites/${adId}`, { method: 'POST' });
}

export async function removeFavorite(adId) {
  return authRequest(`/favorites/${adId}`, { method: 'DELETE' });
}

/**
 * Публикация объявления. Возвращает созданное объявление с id и status
 * (approved, если AD_AUTOAPPROVE не false).
 */
export async function createAd(payload) {
  const res = await authFetch(`${API_URL}/ads`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
    throw new Error(msg || `HTTP ${res.status}`);
  }
  invalidateAdsCache();
  return normalizeAd(data);
}

/**
 * Загрузка фото на S3 через наш API.
 * Возвращает { url } — URL готового для показа изображения.
 * onProgress(fraction 0..1) вызывается по мере загрузки.
 */
export async function uploadAdPhoto(file, opts = {}) {
  try {
    return await uploadAdPhotoOnce(file, opts);
  } catch (err) {
    if (err.status === 401 && (await refreshSession())) return uploadAdPhotoOnce(file, opts);
    throw err;
  }
}

function uploadAdPhotoOnce(file, { onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/uploads/ad-photo`);
    xhr.withCredentials = true;
    // Зависшая загрузка не должна держать форму: через 2 минуты — ошибка, фото убирается.
    xhr.timeout = 120_000;
    xhr.ontimeout = () => reject(new Error('Фото грузится слишком долго — попробуйте ещё раз'));
    xhr.setRequestHeader('Accept', 'application/json');
    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(e.loaded / e.total);
      };
    }
    xhr.onload = () => {
      let data = null;
      try { data = JSON.parse(xhr.responseText); } catch {}
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
        const err = new Error(msg || `HTTP ${xhr.status}`);
        err.status = xhr.status;
        reject(err);
      }
    };
    xhr.onerror = () => reject(new Error('Нет связи — фото не загрузилось, попробуйте ещё раз'));
    xhr.send(form);
  });
}

// Просмотр страницы объявления. Сервер считает одного зрителя раз в сутки,
// гостя узнаёт по случайному id браузера. Возвращает { viewsCount }.
export async function registerView(id) {
  let sessionId;
  try {
    sessionId = localStorage.getItem('doska-kvn:sid');
    if (!sessionId) {
      sessionId = crypto.randomUUID().replace(/-/g, '');
      localStorage.setItem('doska-kvn:sid', sessionId);
    }
  } catch {
    sessionId = undefined; // приватный режим — сервер посчитает по IP
  }
  const res = await fetch(`${API_URL}/ads/${id}/view`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionId ? { sessionId } : {})
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Своё фото для аватара: API обрежет до квадрата 256×256. Возвращает { url } —
// сохраняется в профиль вместе с формой (PATCH /me { avatar }).
export async function uploadAvatar(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await authFetch(`${API_URL}/uploads/avatar`, { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return data;
}

// Телефон продавца: только для залогиненных и только если продавец выбрал связь по телефону.
export async function getAdContact(id) {
  const res = await authFetch(`${API_URL}/ads/${id}/contact`, {
    credentials: 'include',
    headers: { Accept: 'application/json' }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
}

// ── Поддержка ─────────────────────────────────────────────────────

export async function getMyTickets() {
  const data = await authRequest('/support');
  return data.items || [];
}

// topic — question | problem | complaint | idea.
export async function createTicket(topic, text) {
  return authRequest('/support', { method: 'POST', body: JSON.stringify({ topic, text }) });
}

export async function sendTicketMessage(id, text) {
  return authRequest(`/support/${id}/messages`, { method: 'POST', body: JSON.stringify({ text }) });
}

// Жалоба на объявление: reason — scam | spam | illegal | wrong-category | sold | other.
export async function reportAd(id, reason, comment) {
  return authRequest(`/ads/${id}/report`, {
    method: 'POST',
    body: JSON.stringify({ reason, comment: comment || undefined })
  });
}

// Бесплатный подъём своего объявления. При раннем повторе ошибка несёт nextBumpAt.
export async function bumpAd(id) {
  const res = await authFetch(`${API_URL}/ads/${id}/bump`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
    const err = new Error(msg || `HTTP ${res.status}`);
    err.nextBumpAt = data?.nextBumpAt || null;
    throw err;
  }
  invalidateAdsCache();
  return data;
}

// Удаление своего объявления. Бэк проверяет, что автор совпадает.
export async function deleteAd(id) {
  await authRequest(`/ads/${id}`, { method: 'DELETE' });
  invalidateAdsCache();
  return { ok: true };
}

// Правка своего объявления: те же поля, что при подаче. Модерация — как при подаче
// (отклонённое и скрытое — всегда на проверку). Возвращает объявление с новым статусом.
export async function updateAd(id, payload) {
  const data = await authRequest(`/ads/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  invalidateAdsCache();
  return normalizeAd(data);
}

// «Продано / неактуально» — в архив; вернуть можно через renewAd.
export async function archiveAd(id) {
  const data = await authRequest(`/ads/${id}/archive`, { method: 'POST' });
  invalidateAdsCache();
  return data;
}

// Продлить опубликованное или вернуть из архива в ленту — ещё на срок показа.
export async function renewAd(id) {
  const data = await authRequest(`/ads/${id}/renew`, { method: 'POST' });
  invalidateAdsCache();
  return data;
}

// Автоподнятие своего объявления: поднимается само, когда наступает срок подъёма.
export async function setAdAutoBump(id, enabled) {
  return authRequest(`/ads/${id}/auto-bump`, { method: 'POST', body: JSON.stringify({ enabled }) });
}

// Своё объявление в любом статусе — со сроками (expiresAt, deleteAt, canRenew) и nextBumpAt.
export async function getOwnAd(id) {
  return normalizeAd(await authRequest(`/ads/${id}`, { cache: 'no-store' }));
}

// ── Запросы от имени пользователя (cookies) — чаты и админка ──────

async function authRequest(path, opts = {}) {
  const res = await authFetch(`${API_URL}${path}`, {
    ...opts,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...(opts.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
    const err = new Error(msg || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Правила и политика: текст из админки ({ custom: false } — действует текст по умолчанию).
export async function adminGetLegal(doc) {
  return authRequest(`/legal/${doc}`);
}

export async function adminSetLegal(doc, { text, date }) {
  return authRequest(`/admin/legal/${doc}`, { method: 'PUT', body: JSON.stringify({ text, date }) });
}

export async function adminResetLegal(doc) {
  return authRequest(`/admin/legal/${doc}`, { method: 'DELETE' });
}

export async function adminStats() {
  return authRequest('/admin/stats');
}

function query(params) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v != null && v !== '') qs.set(k, String(v));
  return qs.toString();
}

export async function adminListUsers({ limit = 100, offset = 0, q = null, blocked = false } = {}) {
  return authRequest(`/admin/users?${query({ limit, offset, q, blocked: blocked ? 1 : null })}`);
}

// Блокировка: reason — видит только админ; разблокировка — blocked: false.
export async function adminBlockUser(id, blocked, reason) {
  return authRequest(`/admin/users/${id}/block`, {
    method: 'PATCH',
    body: JSON.stringify({ blocked, reason })
  });
}

export async function adminListAds({ limit = 100, offset = 0, status = null, q = null, authorId = null } = {}) {
  return authRequest(`/admin/ads?${query({ limit, offset, status, q, authorId })}`);
}

// note — причина (для отклонения), уходит автору в уведомлении.
export async function adminSetAdStatus(id, status, note) {
  return authRequest(`/admin/ads/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note })
  });
}

export async function adminGetAd(id) {
  return authRequest(`/admin/ads/${id}`);
}

export async function adminDeleteUser(id) {
  return authRequest(`/admin/users/${id}`, { method: 'DELETE' });
}

export async function adminDeleteAd(id, reason) {
  return authRequest(`/admin/ads/${id}?${query({ reason })}`, { method: 'DELETE' });
}

export async function adminListReports(status = 'pending') {
  return authRequest(`/admin/reports?${query({ status })}`);
}

// resolved — меры приняты, dismissed — жалоба не подтвердилась.
export async function adminResolveReport(id, status) {
  return authRequest(`/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

// Соседи города { cityId: [cityId…] } и контакты подвала — из админки.
export async function adminSetNeighbors(cityId, neighbors) {
  const data = await authRequest('/admin/neighbors', { method: 'PUT', body: JSON.stringify({ cityId, neighbors }) });
  _cache.clear();
  return data.neighbors;
}

export async function adminSetContacts(contacts) {
  const data = await authRequest('/admin/contacts', { method: 'PUT', body: JSON.stringify(contacts) });
  _cache.clear();
  return data.contacts;
}

// Тексты окна установки приложения; пустые — по умолчанию.
export async function adminSetAppTexts(texts) {
  const data = await authRequest('/admin/app-texts', { method: 'PUT', body: JSON.stringify(texts) });
  _cache.clear();
  return data.texts;
}

export async function adminGetSettings() {
  return authRequest('/admin/settings');
}

export async function adminSetSetting(key, value) {
  const data = await authRequest('/admin/settings', { method: 'PATCH', body: JSON.stringify({ key, value }) });
  _cache.clear(); // правила приложения читаются из /site — у админа сразу свежие
  return data;
}

export async function adminListSupport(status = 'open') {
  return authRequest(`/admin/support?${query({ status })}`);
}

export async function adminReplySupport(id, text) {
  return authRequest(`/admin/support/${id}/reply`, { method: 'POST', body: JSON.stringify({ text }) });
}

export async function adminSetSupportStatus(id, status) {
  return authRequest(`/admin/support/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export async function adminListReviews() {
  return authRequest('/admin/reviews');
}

export async function adminDeleteReview(id) {
  return authRequest(`/admin/reviews/${id}`, { method: 'DELETE' });
}

export async function adminWipeAll() {
  return authRequest('/admin/wipe?confirm=WIPE_ALL', { method: 'POST' });
}

