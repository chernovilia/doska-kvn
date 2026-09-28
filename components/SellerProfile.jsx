'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, BadgeCheck, MapPin, Share2, Star } from 'lucide-react';
import { cityName } from '@/lib/api';
import { formatMonthYear, pluralRu } from '@/lib/format';
import { shareOrCopy } from '@/lib/share';
import { useAuth } from '@/lib/auth';
import { useToast } from './Toast';
import AdCard from './AdCard';
import BottomNav from './BottomNav';
import Footer from './Footer';
import PostAdModal from './PostAdModal';
import { RatingSummary, ReviewsList } from './Reviews';

/**
 * Публичная страница продавца. Связаться — через конкретное объявление
 * («Написать» открывает диалог по нему), поэтому отдельной кнопки здесь нет.
 */
export default function SellerProfile({ user, ads, reviews = [] }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user: me } = useAuth();
  const [postOpen, setPostOpen] = useState(false);
  const isMe = me?.id === user.id;
  const count = user.activeAdsCount ?? ads.length;

  async function onShare() {
    const status = await shareOrCopy({
      url: `/user/${user.id}`,
      title: user.name,
      text: `Объявления продавца ${user.name} на Доске/КВН`
    });
    if (status === 'copied') toast('Ссылка скопирована');
    else if (status === 'shared') toast('Отправлено');
    else if (status === 'error') toast('Не удалось скопировать', { kind: 'error' });
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-2 md:px-6 h-14 flex items-center gap-1">
          <button
            onClick={() => router.back()}
            aria-label="Назад"
            className="w-10 h-10 grid place-items-center rounded-full text-ink-800 hover:bg-slate-100"
          >
            <ArrowLeft className="w-[22px] h-[22px]" />
          </button>
          <div className="font-bold text-ink-900 truncate">Продавец</div>
          <button
            onClick={onShare}
            aria-label="Поделиться"
            className="ml-auto w-10 h-10 grid place-items-center rounded-full text-ink-800 hover:bg-slate-100"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5">
        <section className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4 md:p-5">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-1 ring-black/5 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand-600 text-white grid place-items-center text-2xl font-black shrink-0">
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="flex items-center gap-1.5 text-xl md:text-2xl font-extrabold text-ink-900">
                <span className="truncate">{user.name || 'Без имени'}</span>
                {user.verified && <BadgeCheck className="w-5 h-5 text-brand-600 shrink-0" />}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-ink-500">
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {user.reviewsCount > 0
                    ? `${user.rating.toFixed(1)} · ${user.reviewsCount} ${pluralRu(user.reviewsCount, ['отзыв', 'отзыва', 'отзывов'])}`
                    : 'нет оценок'}
                </span>
                {user.homeCityId && (
                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                    <MapPin className="w-3.5 h-3.5" />
                    {cityName(user.homeCityId)}
                  </span>
                )}
                <span className="whitespace-nowrap" suppressHydrationWarning>
                  На Доске с {formatMonthYear(user.createdAt)}
                </span>
              </div>
            </div>
          </div>
          {user.bio && (
            <p className="mt-4 text-[15px] text-ink-800 leading-relaxed whitespace-pre-line break-words">
              {user.bio}
            </p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-ink-900 px-0.5">
            {count} {pluralRu(count, ['объявление', 'объявления', 'объявлений'])}
          </h2>
          {ads.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr">
              {ads.map((ad) => (
                <div key={ad.id} className="h-full">
                  <AdCard ad={ad} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white ring-1 ring-black/5 p-8 text-center text-sm text-ink-500">
              {isMe ? 'У вас пока нет опубликованных объявлений.' : 'Сейчас у продавца нет опубликованных объявлений.'}
            </div>
          )}
        </section>

        <section id="reviews" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-extrabold text-ink-900 px-0.5">Отзывы</h2>
          {user.reviewsCount > 0 && (
            <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4">
              <RatingSummary rating={user.rating} count={user.reviewsCount} />
            </div>
          )}
          <ReviewsList
            reviews={reviews}
            empty="Отзывов пока нет. Их оставляют собеседники после переписки по объявлению."
          />
        </section>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
      <PostAdModal open={postOpen} onClose={() => setPostOpen(false)} />
      <BottomNav onPost={() => setPostOpen(true)} />
    </div>
  );
}
