'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getOwnAd, renewAd } from '@/lib/api';
import { fallbackToFull, formatDayMonth, formatPrice, thumbUrl } from '@/lib/format';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import PostAdModal from '@/components/PostAdModal';
import BumpButton from '@/components/BumpButton';
import { PROMO_OPTIONS } from '@/components/PromoOptions';
import { useToast } from '@/components/Toast';

export default function PromotePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <PromoteContent />
    </Suspense>
  );
}

// /promote?ad=… — как продвинуть своё объявление. Работает подъём, остальное «скоро».
function PromoteContent() {
  const router = useRouter();
  const search = useSearchParams();
  const adId = search.get('ad');
  const { user, ready } = useAuth();
  const { toast } = useToast();
  const [ad, setAd] = useState(undefined); // undefined — грузим, null — нет или не своё
  const [renewing, setRenewing] = useState(false);
  const [postOpen, setPostOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace(`/login?returnTo=${encodeURIComponent(`/promote?ad=${adId || ''}`)}`);
  }, [ready, user, router, adId]);

  const load = useCallback(() => {
    if (!adId) return setAd(null);
    getOwnAd(adId)
      .then((a) => setAd(a && a.authorId === user?.id ? a : null))
      .catch(() => setAd(null));
  }, [adId, user?.id]);
  useEffect(() => {
    if (user) load();
  }, [user, load]);

  async function onRenew() {
    setRenewing(true);
    try {
      await renewAd(ad.id);
      toast(ad.status === 'archived' ? 'Объявление снова в ленте' : 'Показ продлён');
      load();
    } catch (err) {
      toast(err.message || 'Не получилось', { kind: 'error' });
    } finally {
      setRenewing(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
      <PageHeader title="Продвижение" backHref="/profile?tab=promo" maxWidth="max-w-2xl" />

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-4 space-y-3">
        {ad === undefined ? (
          <>
            <div className="h-20 rounded-2xl bg-slate-200/70 animate-pulse" />
            <div className="h-40 rounded-2xl bg-slate-200/70 animate-pulse" />
          </>
        ) : ad === null ? (
          <div className="rounded-2xl bg-white ring-1 ring-black/5 p-6 text-center">
            <div className="font-bold text-ink-900">Объявление не найдено</div>
            <div className="text-sm text-ink-500 mt-1">Продвигать можно только свои объявления.</div>
            <Link href="/profile?tab=promo" className="inline-block mt-3 btn-outline h-9 px-4 text-sm">
              К моим объявлениям
            </Link>
          </div>
        ) : (
          <>
            <Link href={`/ad/${ad.id}`} className="flex items-center gap-3 rounded-2xl bg-white ring-1 ring-black/5 p-3">
              {ad.image ? (
                <img
                  src={thumbUrl(ad.image)}
                  onError={fallbackToFull(ad.image)}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0" />
              )}
              <div className="min-w-0">
                <div className="font-bold text-ink-900 truncate">{ad.title}</div>
                <div className="text-sm font-extrabold text-ink-900">{formatPrice(ad)}</div>
                {ad.status === 'approved' && ad.expiresAt && (
                  <div className="text-[12px] text-ink-500" suppressHydrationWarning>
                    В ленте до {formatDayMonth(ad.expiresAt)}
                  </div>
                )}
              </div>
            </Link>

            {ad.status !== 'approved' ? (
              <div className="rounded-2xl bg-white ring-1 ring-black/5 p-4 text-sm text-ink-700">
                {ad.status === 'archived' ? (
                  <>
                    <div className="font-bold text-ink-900">Объявление в архиве</div>
                    <div className="mt-0.5">Верните его в ленту — потом можно будет продвигать.</div>
                    <button
                      onClick={onRenew}
                      disabled={renewing}
                      className="mt-3 w-full inline-flex items-center justify-center gap-1.5 h-11 rounded-2xl btn-primary font-bold disabled:opacity-60"
                    >
                      <RefreshCw className={`w-4 h-4 ${renewing ? 'animate-spin' : ''}`} />
                      Вернуть в ленту
                    </button>
                  </>
                ) : (
                  'Продвигать можно только опубликованное объявление.'
                )}
              </div>
            ) : (
              <>
                {ad.canRenew && (
                  <div className="rounded-2xl bg-accent-50 ring-1 ring-accent-200 p-4">
                    <div className="font-bold text-ink-900">Скоро уйдёт в архив</div>
                    <div className="text-[13px] text-ink-700 mt-0.5" suppressHydrationWarning>
                      Показ заканчивается {formatDayMonth(ad.expiresAt)}. Продлите — это бесплатно.
                    </div>
                    <button
                      onClick={onRenew}
                      disabled={renewing}
                      className="mt-3 w-full btn-outline h-10 text-sm bg-white disabled:opacity-60"
                    >
                      <RefreshCw className={`w-4 h-4 ${renewing ? 'animate-spin' : ''}`} />
                      Продлить показ
                    </button>
                  </div>
                )}

                {PROMO_OPTIONS.map((o) => {
                  const Icon = o.icon;
                  return (
                    <section
                      key={o.id}
                      className={`rounded-2xl bg-white ring-1 p-4 ${o.soon ? 'ring-black/5' : 'ring-accent-200 shadow-card'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 grid place-items-center rounded-xl bg-slate-50 shrink-0 ${o.iconCls}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-ink-900">{o.name}</div>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                o.soon ? 'bg-slate-100 text-ink-500' : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {o.soon ? 'Скоро' : o.price}
                            </span>
                          </div>
                          <div className="text-[13px] text-ink-500 mt-0.5">{o.text}</div>
                        </div>
                      </div>
                      {o.id === 'bump' && (
                        <div className="mt-3">
                          <BumpButton ad={ad} />
                        </div>
                      )}
                    </section>
                  );
                })}
              </>
            )}
          </>
        )}
      </main>

      <PostAdModal open={postOpen} onClose={() => setPostOpen(false)} />
      <BottomNav onPost={() => setPostOpen(true)} />
    </div>
  );
}
