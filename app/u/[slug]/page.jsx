import { notFound } from 'next/navigation';
import { getBusinessBySlug, getAdsByAuthor, getUserByUsername, getUserReviews } from '@/lib/api';
import BusinessProfile from '@/components/BusinessProfile';
import SellerProfile from '@/components/SellerProfile';

// /u/<адрес>: сначала свой адрес пользователя (UserHandle), потом — страница бизнеса (пока выключены).
import { tierLabel } from '@/lib/accountType';

export async function generateMetadata({ params }) {
  const user = await getUserByUsername(params.slug);
  if (user) {
    const title = `${user.name || 'Продавец'} — объявления продавца`;
    const description = user.bio?.slice(0, 180) || `Все объявления продавца ${user.name || ''} на Доске/КВН.`;
    return {
      title,
      description,
      openGraph: { title, description, type: 'profile', locale: 'ru_RU', siteName: 'Доска/КВН' },
      alternates: { canonical: `/u/${user.username}` }
    };
  }
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
  const user = await getUserByUsername(params.slug);
  if (user) {
    const [ads, reviews] = await Promise.all([
      getAdsByAuthor(user.id).catch(() => []),
      getUserReviews(user.id).catch(() => [])
    ]);
    return <SellerProfile user={user} ads={ads} reviews={reviews} />;
  }
  const biz = await getBusinessBySlug(params.slug).catch(() => null);
  if (!biz) notFound();

  const ads = await getAdsByAuthor(biz.userId, 20).catch(() => []);

  return <BusinessProfile biz={biz} ads={ads} />;
}
