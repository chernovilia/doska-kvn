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

// "сб, 24 окт · 19:00" — для карточек афиши.
export function formatEventDate(iso) {
  if (!iso) return '';
  const d = iso instanceof Date ? iso : new Date(iso);
  if (isNaN(d.getTime())) return '';
  const weekday = d.toLocaleDateString('ru-RU', { weekday: 'short' });
  const day = d.getDate();
  const month = d.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '');
  const time = d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${weekday}, ${day} ${month} · ${time}`;
}

// Цена объявления с суффиксом (₽/мес, ₽/час и т.д.) и особыми случаями.
export function formatPrice(ad) {
  if (!ad) return '';
  if (ad.price === 0 || ad.price == null) {
    return ad.priceSuffix ? ad.priceSuffix : 'Бесплатно';
  }
  const num = new Intl.NumberFormat('ru-RU').format(ad.price);
  const suffix = ad.priceSuffix || '₽';
  return `${num} ${suffix}`;
}

// Красивое написание диапазона километров/цены. Задел на будущее.
export function formatRange(min, max, suffix = '') {
  const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n);
  if (min != null && max != null) return `${fmt(min)}–${fmt(max)} ${suffix}`.trim();
  if (min != null) return `от ${fmt(min)} ${suffix}`.trim();
  if (max != null) return `до ${fmt(max)} ${suffix}`.trim();
  return '';
}
