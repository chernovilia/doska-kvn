// Punycode-форма доска-квн.рф — кириллический домен в URL ломает часть краулеров.
export const SITE_URL = 'https://xn----7sbhf4acwc1a.xn--p1ai';

// Браузер и location.origin отдают кириллический домен в закодированном виде (punycode) —
// в «Поделиться» и скопированной ссылке это выглядит как набор латиницы. Показываем как есть: доска-квн.рф.
const PUNY_HOST = 'xn----7sbhf4acwc1a.xn--p1ai';
const PRETTY_HOST = 'доска-квн.рф';

export function prettyUrl(url) {
  return typeof url === 'string' ? url.replace(PUNY_HOST, PRETTY_HOST) : url;
}

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.xn----7sbhf4acwc1a.xn--p1ai/v1';

// Только путь на нашем сайте. «//evil.com» и «/\\evil.com» браузер считает адресом
// чужого сайта (обратный слеш он превращает в прямой) — это открытый редирект после входа.
export function safeReturnTo(value, fallback = '/') {
  return typeof value === 'string' &&
    value.startsWith('/') &&
    !/^\/[\/\\]/.test(value) &&
    !/[\u0000-\u001f]/.test(value)
    ? value
    : fallback;
}
