/** @type {import('next').NextConfig} */

// Защитные заголовки: сайт нельзя встроить в чужую страницу (кликджекинг по кнопкам
// «удалить», «заблокировать»), браузер не угадывает тип файлов, чужим сайтам не уходит
// полный адрес страницы.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
];

const nextConfig = {
  reactStrictMode: true,
  // Оптимизатор картинок Next не используем (обычные <img>), внешних источников ему не даём:
  // через remotePatterns работала DoS-уязвимость Next 14 (GHSA-9g9p-9gw9-jx7f).
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  }
};

module.exports = nextConfig;
