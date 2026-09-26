import { CITIES, REGIONS } from '@/data/regions';
import { API_URL, SITE_URL } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap() {
  const now = new Date();
  const launchedRegions = REGIONS.filter((r) => r.launched).map((r) => r.id);

  const pages = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'hourly', priority: 1 },
    ...CITIES.filter((c) => launchedRegions.includes(c.regionId)).map((c) => ({
      url: `${SITE_URL}/${c.id}`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8
    })),
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 }
  ];

  // Если API недоступен (например, во время сборки), отдаём только статичные страницы —
  // через час revalidate попробует снова.
  let ads = [];
  try {
    const res = await fetch(`${API_URL}/ads/sitemap`, { next: { revalidate } });
    if (res.ok) {
      const data = await res.json();
      ads = (data.items || []).map((a) => ({
        url: `${SITE_URL}/ad/${a.id}`,
        lastModified: new Date(a.createdAt),
        changeFrequency: 'weekly',
        priority: 0.6
      }));
    }
  } catch {}

  return [...pages, ...ads];
}
