/**
 * Единая точка входа для всех данных приложения.
 *
 * Динамические данные (объявления, регионы) — реальный API doska-kvn-api.
 * Профиль, чаты, отзывы, уведомления — пока моки, до реализации на бэке.
 * Справочники (SECTIONS, CHIPS, CATEGORY_GROUPS) — статические, в бандле.
 *
 * URL API берётся из NEXT_PUBLIC_API_URL или фолбэк на Amvera-домен.
 * Позже сменим на api.доска-квн.рф после настройки Cloudflare.
 */

import { SECTIONS } from '@/data/mock';
import { CHIPS, CATEGORY_GROUPS, getCategoryGroups } from '@/data/categories';
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
  CHIPS,
  CATEGORY_GROUPS,
  getCategoryGroups,
  REGIONS,
  DEFAULT_REGION_ID,
  getRegion,
  getCity,
  getCitiesOfRegion,
  resolvePlace
};

export function getSection(id) {
  return SECTIONS.find((s) => s.id === id) || null;
}

export function getChipsForSection(sectionId) {
  return CHIPS[sectionId] || [];
}

export function cityName(id) {
  return cityNameSync(id);
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
  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    credentials: 'include'
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
  return {
    ...apiAd,
    city: apiAd.cityId || apiAd.city,
    image: apiAd.photos?.[0]?.url || apiAd.image || null,
    gallery: apiAd.photos?.map((p) => p.url) || apiAd.gallery || []
  };
}

// ── Объявления ─────────────────────────────────────────────────────

export async function getAds({
  place = DEFAULT_REGION_ID,
  section = null,
  chip = null,
  search = null,
  limit = 100,
  includeNearby = false
} = {}) {
  const params = { place, section, chip, search, limit };
  const p = includeNearby ? resolvePlace(place) : null;
  const wantsNearby = includeNearby && p?.kind === 'city';

  // Все запросы параллельно — primary + регион + соседи одновременно.
  const primaryPromise = apiGet('/ads', params, { ttlMs: 15_000 });
  const regionPromise = wantsNearby
    ? apiGet('/ads', { place: p.region.id, section, limit: 12 }, { ttlMs: 30_000 }).catch(
        () => ({ items: [] })
      )
    : Promise.resolve({ items: [] });
  const neighborsPromise = wantsNearby
    ? Promise.all(
        (p.region.neighbors || []).map((rid) =>
          apiGet('/ads', { place: rid, section, limit: 6 }, { ttlMs: 30_000 }).catch(() => ({
            items: []
          }))
        )
      )
    : Promise.resolve([]);

  const [primaryRaw, regionRaw, neighborsRaw] = await Promise.all([
    primaryPromise,
    regionPromise,
    neighborsPromise
  ]);

  const primary = (primaryRaw.items || []).map(normalizeAd);
  if (!includeNearby) return primary;
  if (!wantsNearby) return { primary, nearby: [] };

  const sameRegionOthers = (regionRaw.items || [])
    .filter((a) => a.cityId !== p.id)
    .map(normalizeAd);
  const neighborAds = neighborsRaw.flatMap((r) => r.items || []).map(normalizeAd);
  const nearby = [...sameRegionOthers, ...neighborAds].slice(0, 12);
  return { primary, nearby };
}

export async function getAd(id) {
  try {
    const data = await apiGet(`/ads/${id}`, {}, { ttlMs: 60_000 });
    return normalizeAd(data);
  } catch {
    return null;
  }
}

export async function getCountsBySection(place = DEFAULT_REGION_ID) {
  const data = await apiGet('/ads/counts', { place }, { ttlMs: 60_000 });
  const map = {};
  for (const s of SECTIONS) map[s.id] = data[s.id] || 0;
  return map;
}

export async function getSimilarAds(id, limit = 6) {
  // Пока API не имеет /similar — берём объявления того же региона/раздела.
  const src = await getAd(id);
  if (!src) return [];
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
  const sections = SECTIONS.filter((s) =>
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
 * Текущий юзер с бэка. Если не авторизован — возвращает null.
 */
export async function getMe() {
  try {
    return await apiGet('/me', {}, { ttlMs: 5_000 });
  } catch {
    return null;
  }
}

/**
 * Мои объявления. GET /v1/me/ads возвращает все статусы (approved/pending/rejected).
 */
export async function getMyAds() {
  try {
    const data = await apiGet('/me/ads', {}, { ttlMs: 10_000 });
    return (data.items || []).map(normalizeAd);
  } catch {
    return [];
  }
}

// Задел под этап 4 — чаты, отзывы, уведомления пока не реализованы на бэке.
// Возвращаем пустой список; UI показывает соответствующие empty-состояния.
export async function getChats() { return []; }
export async function getMessages() { return []; }
export async function sendMessage() { throw new Error('Чаты пока в разработке'); }
export async function getReviews() { return []; }
export async function getNotifications() { return []; }

// Публичный профиль по slug — эндпоинт ещё не готов.
export async function getBusinessBySlug() { return null; }

// Объявления автора — можно будет через ?authorId=xxx, эндпоинта пока нет.
export async function getAdsByAuthor() { return []; }

/**
 * Публикация объявления. Возвращает созданное объявление с id и status
 * (approved, если AD_AUTOAPPROVE не false).
 */
export async function createAd(payload) {
  const res = await fetch(`${API_URL}/ads`, {
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

// ── Админка ───────────────────────────────────────────────────────
// Все эндпоинты защищены AdminGuard на бэке; фронт добавляет credentials.

async function adminRequest(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, {
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

export async function adminStats() {
  return adminRequest('/admin/stats');
}

export async function adminListUsers({ limit = 100, offset = 0 } = {}) {
  return adminRequest(`/admin/users?limit=${limit}&offset=${offset}`);
}

export async function adminListAds({ limit = 100, offset = 0 } = {}) {
  return adminRequest(`/admin/ads?limit=${limit}&offset=${offset}`);
}

export async function adminDeleteUser(id) {
  return adminRequest(`/admin/users/${id}`, { method: 'DELETE' });
}

export async function adminDeleteAd(id) {
  return adminRequest(`/admin/ads/${id}`, { method: 'DELETE' });
}

export async function adminWipeAll() {
  return adminRequest('/admin/wipe?confirm=WIPE_ALL', { method: 'POST' });
}
