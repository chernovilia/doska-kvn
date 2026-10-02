// Форматирование для UI: цены, относительные даты, даты событий.
// Ничего не знает про мок-данные — работает с чистыми примитивами.

// Русские склонения — общий помощник.
export function pluralRu(n, forms) {
  // forms = ['минуту', 'минуты', 'минут'] — для 1 / 2-4 / 5+
  const abs = Math.abs(n);
  const n10 = abs % 10;
  const n100 = abs % 100;
  if (n100 >= 11 && n100 <= 14) return forms[2];
  if (n10 === 1) return forms[0];
  if (n10 >= 2 && n10 <= 4) return forms[1];
  return forms[2];
}

// "сентября 2026" — месяц в родительном падеже, для «На Доске с …».
export function formatMonthYear(iso) {
  const d = new Date(iso);
  const month = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })
    .formatToParts(d)
    .find((p) => p.type === 'month')?.value;
  return `${month} ${d.getFullYear()}`;
}

// "2 дн 5 ч", "7 ч", "40 мин" — сколько осталось до момента в будущем.
export function formatTimeLeft(iso, now = new Date()) {
  const ms = new Date(iso).getTime() - now.getTime();
  if (ms <= 0) return '';
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 24) {
    const d = Math.floor(hours / 24);
    const h = hours % 24;
    return h ? `${d} дн ${h} ч` : `${d} дн`;
  }
  if (hours >= 1) return `${hours} ч`;
  return `${Math.max(1, Math.ceil(ms / 60_000))} мин`;
}

// "10 мин назад", "3 часа назад", "вчера", "5 дней назад", "3 нед назад"
// Принимает ISO-строку или Date.
export function formatRelative(iso, now = new Date()) {
  if (!iso) return '';
  const d = iso instanceof Date ? iso : new Date(iso);
  if (isNaN(d.getTime())) return '';

  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'только что';
  if (diffMin < 60) return `${diffMin} мин назад`;
  if (diffHr < 24) return `${diffHr} ${pluralRu(diffHr, ['час', 'часа', 'часов'])} назад`;
  if (diffDay === 1) return 'вчера';
  if (diffDay < 7) return `${diffDay} ${pluralRu(diffDay, ['день', 'дня', 'дней'])} назад`;
  if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    return `${weeks} ${pluralRu(weeks, ['неделю', 'недели', 'недель'])} назад`;
  }
  const months = Math.floor(diffDay / 30);
  if (diffDay < 365)
    return `${months} ${pluralRu(months, ['месяц', 'месяца', 'месяцев'])} назад`;
  return d.toLocaleDateString('ru-RU');
}

// Все события — в КВН, поэтому время всегда по Москве, где бы ни был зритель и сервер.
export const EVENT_TZ = 'Europe/Moscow';

// "сб, 24 окт · 19:00" — для карточек афиши.
export function formatEventDate(iso) {
  if (!iso) return '';
  const d = iso instanceof Date ? iso : new Date(iso);
  if (isNaN(d.getTime())) return '';
  const tz = { timeZone: EVENT_TZ };
  const weekday = d.toLocaleDateString('ru-RU', { ...tz, weekday: 'short' });
  const day = d.toLocaleDateString('ru-RU', { ...tz, day: 'numeric' });
  const month = d.toLocaleDateString('ru-RU', { ...tz, month: 'short' }).replace('.', '');
  const time = d.toLocaleTimeString('ru-RU', { ...tz, hour: '2-digit', minute: '2-digit' });
  return `${weekday}, ${day} ${month} · ${time}`;
}

// Разделы, где цена 0 значит «отдам даром» ('market' — старый общий раздел).
const GIVEAWAY_SECTIONS = ['electronics', 'home', 'clothes', 'kids', 'pets', 'hobby', 'auto', 'market'];

// Цена объявления: суффикс (₽/мес, ₽/сутки), вилка зарплаты, «даром» и «договорная».
// compact — для карточки: вилка «40–60 тыс. ₽/мес», иначе не влезает в узкую колонку.
export function formatPrice(ad, { compact = false } = {}) {
  if (!ad) return '';
  const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n);
  const thousands = (n) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(n / 1000);
  // Неразрывный пробел: «₽/мес» не должен уезжать на новую строку отдельно от числа.
  const suffix = '\u00A0' + (ad.priceSuffix || '₽');
  const from = ad.price || 0;
  const to = ad.priceTo || 0;

  if (to && from && to > from) {
    if (compact && from >= 1000) return `${thousands(from)}–${thousands(to)}\u00A0тыс.${suffix}`;
    return `${fmt(from)} – ${fmt(to)}${suffix}`;
  }
  if (to && !from) return `до ${fmt(to)}${suffix}`;
  if (!from) {
    if (ad.section === 'events') return 'Бесплатно';
    if (GIVEAWAY_SECTIONS.includes(ad.section)) return 'Даром';
    return 'Договорная';
  }
  // У вакансии без верхней границы зарплата — «от».
  if (ad.section === 'jobs' && ad.categoryGroup === 'Вакансии') return `от ${fmt(from)}${suffix}`;
  return `${fmt(from)}${suffix}`;
}

// Ссылка на Авито из старых объявлений: только https://avito.ru. Строку из базы не
// подставляем в href как есть — «javascript:…» выполнился бы по клику (XSS).
export function safeAvitoUrl(url) {
  return typeof url === 'string' && /^https:\/\/(www\.|m\.)?avito\.ru\//i.test(url) ? url : null;
}

// Миниатюра 480×480 для карточек (API кладёт её рядом с фото: …/uuid-t.webp).
// У фото, загруженных до миниатюр, её нет — компонент откатывается на полное фото по onError.
export function thumbUrl(url) {
  return typeof url === 'string' && /\/ads\/.+\.webp$/.test(url) && !url.endsWith('-t.webp')
    ? url.replace(/\.webp$/, '-t.webp')
    : url;
}

// onError для <img src={thumbUrl(full)}>: нет миниатюры — один раз переключаемся на полное фото.
export function fallbackToFull(full) {
  return (e) => {
    if (full && e.currentTarget.src !== full) e.currentTarget.src = full;
  };
}

// "6 октября" — для сроков показа и удаления объявления.
export function formatDayMonth(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

// Ссылка на объявление с коротким id: /ad/670a4944 вместо полного UUID (полные тоже работают).
export function adPath(id) {
  const s = String(id || '');
  return `/ad/${s.length === 36 ? s.slice(0, 8) : s}`;
}
