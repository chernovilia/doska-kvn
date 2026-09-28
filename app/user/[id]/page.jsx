import { notFound } from 'next/navigation';
import { getAdsByAuthor, getPublicUser, getUserReviews } from '@/lib/api';
import SellerProfile from '@/components/SellerProfile';

// Публичная страница продавца: профиль и его опубликованные объявления.

export async function generateMetadata({ params }) {
  const user = await getPublicUser(params.id);
  if (!user) return { title: 'Продавец не найден' };
  const title = `${user.name || 'Продавец'} — объявления продавца`;
  const description = user.bio?.slice(0, 180) || `Все объявления продавца ${user.name || ''} на Доске/КВН.`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'profile', locale: 'ru_RU', siteName: 'Доска/КВН' },
    alternates: { canonical: `/user/${user.id}` }
  };
}

export default async function UserPage({ params }) {
  const [user, ads, reviews] = await Promise.all([
    getPublicUser(params.id),
    getAdsByAuthor(params.id).catch(() => []),
    getUserReviews(params.id).catch(() => [])
  ]);
  if (!user) notFound();
  return <SellerProfile user={user} ads={ads} reviews={reviews} />;
}
