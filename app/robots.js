import { SITE_URL } from '@/lib/site';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/profile', '/messages', '/login', '/favorites']
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
