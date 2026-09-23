import { notFound } from 'next/navigation';
import { getBusinessBySlug, getAdsByAuthor } from '@/lib/api';
import BusinessProfile from '@/components/BusinessProfile';
import { tierLabel } from '@/lib/accountType';

export async function generateMetadata({ params }) {
  const biz = await getBusinessBySlug(params.slug).catch(() => null);

  if (!biz) {
    return {
      title: 'Профиль не найден — Доска/КВН',
      description: 'Такого профиля нет или он не публичный.'
    };
  }

  const tier = tierLabel(biz.currentTierName);
  const kindLabel = biz.userType === 'shop' ? 'Магазин' : 'Мастер услуг';
  const title = `${biz.name} — ${kindLabel}${tier ? ` · ${tier}` : ''}`;
  const description = (biz.description || `${kindLabel} в КВН — ${biz.address || ''}`).slice(0, 180);

  return {
    title: `${title} — Доска/КВН`,
    description,
    openGraph: {
      title,
      description,
      images: biz.logo ? [{ url: biz.logo, width: 1200, height: 630 }] : biz.userAvatar ? [biz.userAvatar] : [],
      type: 'profile',
      locale: 'ru_RU',
      siteName: 'Доска/КВН'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: biz.logo ? [biz.logo] : biz.userAvatar ? [biz.userAvatar] : []
    },
    alternates: {
      canonical: `/u/${params.slug}`
    }
  };
}

export default async function UserPage({ params }) {
  const biz = await getBusinessBySlug(params.slug).catch(() => null);
  if (!biz) notFound();

  const ads = await getAdsByAuthor(biz.userId, 20).catch(() => []);

  return <BusinessProfile biz={biz} ads={ads} />;
}
