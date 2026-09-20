/**
 * Единая точка входа для всех данных приложения.
 *
 * Правила:
 * — Справочники (CITIES / SECTIONS / CHIPS / REGIONS) экспортируем синхронно.
 * — Динамические данные (объявления, пользователи, чаты) отдаём через Promise-функции,
 *   даже если сейчас работаем с моками — это позволит подменить реализацию на fetch
 *   без правок компонентов.
 */

import { ADS, CHIPS, SECTIONS } from '@/data/mock';
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

// ── Синхронные справочники ─────────────────────────────────────────

export {
  CITIES,
  SECTIONS,
  CHIPS,
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

// ── Утилита для async-эмуляции ─────────────────────────────────────

const resolve = (data) => Promise.resolve(data);

// ── Внутренняя фильтрация по «месту» ───────────────────────────────

function filterByPlace(list, placeId) {
  const p = resolvePlace(placeId);
  if (!p) return list;
  if (p.kind === 'region') {
    const cityIds = new Set(p.cities.map((c) => c.id));
    return list.filter((a) => cityIds.has(a.city));
  }
  return list.filter((a) => a.city === p.id);
}

// ── Объявления ─────────────────────────────────────────────────────

/**
 * Основной фид объявлений.
 *   place может быть id региона (kvn) или id города (vyksa).
 *   При выборе города дополнительно можно получить «соседние» — объявления
 *   из других городов того же региона и соседних регионов, отдельно от primary.
 */
export async function getAds({
  place = DEFAULT_REGION_ID,
  section = null,
  chip = null,
  search = null,
  limit = 100,
  includeNearby = false
} = {}) {
  const q = (search || '').trim().toLowerCase();
  let list = ADS;
  if (section) list = list.filter((a) => a.section === section);
  const primary = filterByPlace(list, place).slice();

  const apply = (arr) => {
    let out = arr;
    if (chip) {
      const c = chip.toLowerCase();
      out = out.filter(
        (a) =>
          a.title.toLowerCase().includes(c) ||
          (a.description || '').toLowerCase().includes(c) ||
          (a.priceSuffix || '').toLowerCase().includes(c)
      );
    }
    if (q) {
      out = out.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description || '').toLowerCase().includes(q) ||
          (a.address || '').toLowerCase().includes(q)
      );
    }
    return out.sort((a, b) => {
      const top = (b.top ? 1 : 0) - (a.top ? 1 : 0);
      if (top !== 0) return top;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const primaryOut = apply(primary).slice(0, limit);

  if (!includeNearby) return resolve(primaryOut);

  // Соседние города — только когда выбран конкретный город.
  const p = resolvePlace(place);
  if (!p) return resolve({ primary: primaryOut, nearby: [] });

  let nearby = [];
  if (p.kind === 'city') {
    // 1) Другие города своего региона
    const sameRegionCities = getCitiesOfRegion(p.region.id)
      .map((c) => c.id)
      .filter((cid) => cid !== p.id);
    const sameRegionAds = list.filter((a) => sameRegionCities.includes(a.city));
    // 2) Города соседних регионов
    const neighborRegionIds = p.region.neighbors || [];
    const neighborCityIds = neighborRegionIds.flatMap((rid) =>
      getCitiesOfRegion(rid).map((c) => c.id)
    );
    const neighborAds = list.filter((a) => neighborCityIds.includes(a.city));
    nearby = apply([...sameRegionAds, ...neighborAds]).slice(0, 12);
  }
  return resolve({ primary: primaryOut, nearby });
}

export async function getAd(id) {
  return resolve(ADS.find((a) => a.id === id) || null);
}

/**
 * Счётчик по разделам с учётом текущего place.
 */
export async function getCountsBySection(place = DEFAULT_REGION_ID) {
  const list = filterByPlace(ADS, place);
  const map = {};
  for (const s of SECTIONS) map[s.id] = 0;
  for (const a of list) map[a.section] += 1;
  return resolve(map);
}

/**
 * Content-based рекомендации: тот же раздел, тот же или соседний город.
 */
export async function getSimilarAds(id, limit = 6) {
  const src = ADS.find((a) => a.id === id);
  if (!src) return resolve([]);
  const priceLow = src.price * 0.6;
  const priceHigh = src.price * 1.4;
  const region = REGIONS.find(
    (r) => r.id === (getCity(src.city)?.regionId || null)
  );
  const cityScope = new Set(
    region ? getCitiesOfRegion(region.id).map((c) => c.id) : [src.city]
  );
  const list = ADS.filter(
    (a) =>
      a.id !== src.id &&
      a.section === src.section &&
      cityScope.has(a.city) &&
      (src.price === 0 || (a.price >= priceLow && a.price <= priceHigh))
  )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
  return resolve(list);
}

// ── Поиск с автокомплитом ──────────────────────────────────────────

export async function search(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return resolve({ sections: [], ads: [] });
  const sections = SECTIONS.filter((s) => s.name.toLowerCase().includes(q));
  const ads = ADS.filter((a) => a.title.toLowerCase().includes(q)).slice(0, 5);
  return resolve({ sections, ads });
}

// ── Пользователь и связанные сущности ──────────────────────────────

export async function getMe() {
  return resolve(MOCK_USER);
}

export async function getMyAds() {
  const list = MY_AD_IDS.map((id) => ADS.find((a) => a.id === id)).filter(Boolean);
  return resolve(list);
}

export async function getChats() {
  return resolve(
    MOCK_CHATS.slice().sort(
      (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
    )
  );
}

export async function getMessages(chatId) {
  return resolve(MOCK_MESSAGES[chatId] || []);
}

export async function sendMessage(chatId, text) {
  return resolve({
    id: `msg-${Date.now()}`,
    chatId,
    from: 'me',
    text,
    at: new Date().toISOString()
  });
}

export async function getReviews() {
  return resolve(
    MOCK_REVIEWS.slice().sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  );
}

export async function getNotifications() {
  return resolve(
    MOCK_NOTIFICATIONS.slice().sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
    )
  );
}

// ── Заглушка под создание объявления ───────────────────────────────

export async function createAd(payload) {
  return resolve({
    ...payload,
    id: `ad-new-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'moderation'
  });
}
