/**
 * Единая точка входа для всех данных приложения.
 *
 * Правила:
 * — Референсные данные (CITIES / SECTIONS / CHIPS) экспортируем синхронно:
 *   они всегда в бандле, никогда не приходят с бэкенда.
 * — Динамические данные (объявления, пользователи, чаты) отдаём через Promise-функции,
 *   даже если сейчас работаем с моками. Это позволит подменить реализацию на fetch
 *   без правок компонентов.
 *
 * Когда появится реальный API, тут же поменяем тело функций:
 *   return fetch(`${API_URL}/ads?${qs}`).then(r => r.json());
 * — интерфейс останется прежним, компоненты не тронем.
 */

import {
  ADS,
  CHIPS,
  CITIES,
  SECTIONS,
  cityName as cityNameSync,
  countBySection
} from '@/data/mock';
import {
  MOCK_USER,
  MY_AD_IDS,
  MOCK_CHATS,
  MOCK_MESSAGES,
  MOCK_REVIEWS,
  MOCK_NOTIFICATIONS
} from '@/data/profile';

// ── Синхронные референсные экспорты ────────────────────────────────

export { CITIES, SECTIONS, CHIPS };

export function getCity(id) {
  return CITIES.find((c) => c.id === id) || null;
}

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
// Одно место, откуда позже удалим `Promise.resolve` и подставим fetch.
const resolve = (data) => Promise.resolve(data);

// ── Объявления ─────────────────────────────────────────────────────

/**
 * Ленту объявлений отдаём с базовой фильтрацией — как это делал бы бэкенд:
 *   /ads?city=vyksa&section=services&chip=Электрик&search=розетка&limit=50
 */
export async function getAds({
  city = 'all',
  section = null,
  chip = null,
  search = null,
  limit = 100
} = {}) {
  const q = (search || '').trim().toLowerCase();
  let list = ADS;
  if (section) list = list.filter((a) => a.section === section);
  if (city !== 'all') list = list.filter((a) => a.city === city);
  if (chip) {
    // Простая эвристика: чипс "прилипает" к заголовку/описанию как ключевое слово.
    const c = chip.toLowerCase();
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(c) ||
        (a.description || '').toLowerCase().includes(c) ||
        (a.priceSuffix || '').toLowerCase().includes(c)
    );
  }
  if (q) {
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q) ||
        (a.address || '').toLowerCase().includes(q)
    );
  }
  list = list
    .slice()
    .sort((a, b) => {
      // TOP объявления вверх, потом свежие вверх.
      const top = (b.top ? 1 : 0) - (a.top ? 1 : 0);
      if (top !== 0) return top;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  return resolve(list.slice(0, limit));
}

export async function getAd(id) {
  return resolve(ADS.find((a) => a.id === id) || null);
}

export async function getCountsBySection(city = 'all') {
  return resolve(countBySection(city));
}

/**
 * Простейшая content-based рекомендация — под будущий рекомендер.
 * Пока: тот же раздел, тот же город, цена в ±40%. Сортировка по свежести.
 * Позже заменим на реальный движок (LightFM / GigaChat embeddings / собственный).
 */
export async function getSimilarAds(id, limit = 6) {
  const src = ADS.find((a) => a.id === id);
  if (!src) return resolve([]);
  const priceLow = src.price * 0.6;
  const priceHigh = src.price * 1.4;
  const list = ADS.filter(
    (a) =>
      a.id !== src.id &&
      a.section === src.section &&
      (a.city === src.city || src.city === 'all') &&
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
  // Пока моковая отправка — просто эхо для UI.
  const msg = {
    id: `msg-${Date.now()}`,
    chatId,
    from: 'me',
    text,
    at: new Date().toISOString()
  };
  return resolve(msg);
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
  // На бэке тут произойдёт валидация, модерация, запись в БД.
  // Пока просто возвращаем «созданный» объект с id.
  return resolve({
    ...payload,
    id: `ad-new-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'moderation'
  });
}
