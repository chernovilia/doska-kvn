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

import { ADS, SECTIONS } from '@/data/mock';
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
import {
  MOCK_USER,
  MY_AD_IDS,
  MOCK_CHATS,
  MOCK_MESSAGES,
  MOCK_REVIEWS,
  MOCK_NOTIFICATIONS
} from '@/data/profile';

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
// getMe — реальный API (нужны cookies auth).
// Остальные (chats, reviews, notifications) пока моки — сделаем на этапе 4.

const mock = (data) => Promise.resolve(data);

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

export async function getMyAds() {
  const list = MY_AD_IDS.map((id) => ADS.find((a) => a.id === id)).filter(Boolean);
  return mock(list);
}

export async function getChats() {
  return mock(
    MOCK_CHATS.slice().sort(
      (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
    )
  );
}

export async function getMessages(chatId) {
  return mock(MOCK_MESSAGES[chatId] || []);
}

export async function sendMessage(chatId, text) {
  return mock({
    id: `msg-${Date.now()}`,
    chatId,
    from: 'me',
    text,
    at: new Date().toISOString()
  });
}

export async function getReviews() {
  return mock(
    MOCK_REVIEWS.slice().sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  );
}

export async function getNotifications() {
  return mock(
    MOCK_NOTIFICATIONS.slice().sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
    )
  );
}

/**
 * Публичный бизнес-профиль по slug — задел под GET /v1/business/:slug.
 * Пока мок: возвращает демо-профиль Ильи для slug === 'ilya-master'.
 */
export async function getBusinessBySlug(slug) {
  if (slug !== MOCK_USER.businessProfile?.slug && slug !== 'ilya-master') {
    return mock(null);
  }
  return mock({
    ...MOCK_USER.businessProfile,
    userId: MOCK_USER.id,
    userName: MOCK_USER.name,
    userAvatar: MOCK_USER.avatar,
    userRating: MOCK_USER.rating,
    userReviewsCount: MOCK_USER.reviewsCount,
    userDealsCount: MOCK_USER.dealsCount,
    userType: MOCK_USER.type,
    userVerified: MOCK_USER.verified
  });
}

/**
 * Объявления автора. На бэке — будет /v1/ads?authorId=xxx.
 * Пока используем реальный API с фильтром по region+section+chip = null,
 * потом клиентом фильтруем по authorId в snapshot.
 */
export async function getAdsByAuthor(authorId, limit = 20) {
  const data = await apiGet('/ads', { place: 'kvn', limit: 200 }, { ttlMs: 30_000 });
  return (data.items || [])
    .filter((a) => a.authorId === authorId)
    .slice(0, limit)
    .map(normalizeAd);
}

export async function createAd(payload) {
  // Позже: POST /v1/ads с JWT. Сейчас моковая заглушка.
  return mock({
    ...payload,
    id: `ad-new-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'moderation'
  });
}
