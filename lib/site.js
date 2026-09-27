// Punycode-форма доска-квн.рф — кириллический домен в URL ломает часть краулеров.
export const SITE_URL = 'https://xn----7sbhf4acwc1a.xn--p1ai';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.xn----7sbhf4acwc1a.xn--p1ai/v1';

// Только внутренние пути: иначе ?returnTo=https://… уводил бы после входа на чужой сайт.
export function safeReturnTo(value, fallback = '/') {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : fallback;
}
