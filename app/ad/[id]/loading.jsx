'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { peekAd, cityName } from '@/lib/api';
import { formatPrice } from '@/lib/format';

// Показывается сразу по нажатию на карточку, пока сервер отдаёт страницу.
// Раскладка повторяет AdDetail, чтобы переход выглядел как в приложении, без мигания.
export default function AdLoading() {
  const router = useRouter();
  const id = usePathname()?.split('/').pop();
  const ad = id ? peekAd(id) : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
      <div className="hero-gradient border-b border-black/5">
        <div className="max-w-5xl mx-auto px-4 md:px-6 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 grid place-items-center rounded-full bg-white ring-1 ring-black/5 hover:bg-brand-50 shadow-card"
            aria-label="Назад"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-ink-800" />
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-0 md:px-6 py-0 md:py-6">
        <div className="md:grid md:grid-cols-[1.4fr_1fr] md:gap-6">
          <div className="relative aspect-[4/3] bg-slate-100 md:rounded-2xl overflow-hidden shadow-card">
            {ad?.image ? (
              <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full animate-pulse bg-slate-200" />
            )}
          </div>

          <div className="p-4 md:p-0 space-y-5">
            {ad ? (
              <div>
                <div className="text-[12px] text-ink-500">{ad.address || cityName(ad.city)}</div>
                <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-ink-900 leading-tight">
                  {ad.title}
                </h1>
                <div className="mt-3 text-3xl font-black text-brand-700">{formatPrice(ad)}</div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-3 w-32 rounded bg-slate-200 animate-pulse" />
                <div className="h-7 w-4/5 rounded bg-slate-200 animate-pulse" />
                <div className="h-8 w-40 rounded bg-slate-200 animate-pulse" />
              </div>
            )}
            <div className="h-24 rounded-2xl bg-white ring-1 ring-black/5 animate-pulse" />
            <div className="h-20 rounded-2xl bg-white ring-1 ring-black/5 animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
