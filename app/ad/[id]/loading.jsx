'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { peekAd, cityName } from '@/lib/api';
import { formatPrice, thumbUrl, fallbackToFull } from '@/lib/format';

// Показывается сразу по нажатию на карточку, пока сервер отдаёт страницу.
// Раскладка повторяет AdDetail, чтобы переход выглядел как в приложении, без мигания.
export default function AdLoading() {
  const router = useRouter();
  const id = usePathname()?.split('/').pop();
  const ad = id ? peekAd(id) : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-28 md:pb-0">
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-2 md:px-6 h-14 flex items-center">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 grid place-items-center rounded-full text-ink-800 hover:bg-slate-100"
            aria-label="Назад"
          >
            <ArrowLeft className="w-[22px] h-[22px]" />
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-0 md:px-6 py-0 md:py-6">
        <div className="md:grid md:grid-cols-[1.4fr_1fr] md:gap-6">
          <div className="relative aspect-[4/3] bg-slate-100 md:rounded-2xl overflow-hidden">
            {ad?.image ? (
              // Миниатюра уже в кеше браузера (её показала карточка) — картинка появляется мгновенно
              <img src={thumbUrl(ad.image)} onError={fallbackToFull(ad.image)} alt={ad.title} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full animate-pulse bg-slate-200" />
            )}
          </div>

          <div className="p-4 md:p-0 space-y-4">
            <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4 space-y-2">
              {ad ? (
                <>
                  <div className="text-[26px] md:text-3xl font-black text-ink-900 leading-tight">
                    {formatPrice(ad)}
                  </div>
                  <h1 className="text-lg md:text-xl font-bold text-ink-900 leading-snug">{ad.title}</h1>
                  <div className="text-[13px] text-ink-500">{ad.address || cityName(ad.city)}</div>
                </>
              ) : (
                <>
                  <div className="h-7 w-40 rounded bg-slate-200 animate-pulse" />
                  <div className="h-5 w-4/5 rounded bg-slate-200 animate-pulse" />
                  <div className="h-3 w-32 rounded bg-slate-200 animate-pulse" />
                </>
              )}
            </div>
            <div className="h-24 rounded-2xl bg-white ring-1 ring-black/5 animate-pulse" />
            <div className="h-20 rounded-2xl bg-white ring-1 ring-black/5 animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
