import { notFound } from 'next/navigation';
import { getAd, getSimilarAds } from '@/lib/api';
import AdDetail from '@/components/AdDetail';

// Server Component: делает SSR-fetch, генерит правильные Open Graph теги
// для шэринга в VK/TG/поисковики. Клиент получает уже готовый HTML.

export async function generateMetadata({ params }) {
  const ad = await getAd(params.id).catch(() => null);

  if (!ad) {
    return {
      title: 'Объявление не найдено — Доска/КВН',
      description: 'Такого объявления нет или оно было удалено.'
    };
  }

  const priceText =
    ad.price > 0
      ? `${new Intl.NumberFormat('ru-RU').format(ad.price)} ${ad.priceSuffix || '₽'}`
      : ad.priceSuffix || 'Бесплатно';

  const title = `${ad.title} · ${priceText}`;
  const description =
    (ad.description || `${ad.title}. ${ad.address}. Объявление на Доска/КВН.`).slice(0, 180);
  const image = ad.image || ad.gallery?.[0];

  return {
    title: `${title} — Доска/КВН`,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image, width: 1200, height: 630 }] : [],
      type: 'article',
      locale: 'ru_RU',
      siteName: 'Доска/КВН'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : []
    },
    alternates: {
      canonical: `/ad/${ad.id}`
    }
  };
}

export default async function AdPage({ params }) {
  const ad = await getAd(params.id).catch(() => null);
  if (!ad) notFound();

  const similar = await getSimilarAds(ad.id, 4).catch(() => []);

  return <AdDetail ad={ad} similar={similar} />;
}
