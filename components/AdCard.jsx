'use client';

import { motion } from 'framer-motion';
import { BadgeCheck, Clock, Heart, MapPin, Calendar, Flame, Crown, ExternalLink } from 'lucide-react';
import { cityName, formatPrice } from '@/data/mock';
import { useState } from 'react';

// Единый стиль карточки: одинаковые внешние/внутренние отступы,
// одинаковая высота обложки (aspect-[4/3]), тело — flex-column с ровными gap.
// h-full позволяет карточкам в CSS grid тянуться до одной высоты по ряду.
export default function AdCard({ ad, onOpen }) {
  const [liked, setLiked] = useState(false);
  const isEvent = ad.section === 'events';

  return (
    <motion.button
      layout
      onClick={() => onOpen?.(ad)}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-card ring-1 transition hover:shadow-soft ${
        ad.top ? 'ring-amber-300' : 'ring-black/5'
      }`}
    >
      {/* Обложка — фиксированный аспект, одинаковый для всех карточек */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={ad.image}
          alt={ad.title}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-[1.03]"
        />

        {/* Плашки слева */}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {ad.top && (
            <span className="top-badge inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold shadow">
              <Crown className="h-3 w-3" />
              TOP
            </span>
          )}
          {ad.urgent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-500 px-2 py-1 text-[11px] font-bold text-white shadow">
              <Flame className="h-3 w-3" />
              Срочно
            </span>
          )}
          {isEvent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-1 text-[11px] font-bold text-white shadow">
              <Calendar className="h-3 w-3" />
              Событие
            </span>
          )}
          {ad.avitoUrl && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white shadow">
              <ExternalLink className="h-3 w-3" />
              Авито
            </span>
          )}
        </div>

        {/* Избранное */}
        <div className="absolute right-2 top-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLiked((v) => !v);
            }}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/95 shadow-card ring-1 ring-black/5"
            aria-label="В избранное"
          >
            <Heart
              className={`h-4 w-4 ${liked ? 'fill-rose-500 text-rose-500' : 'text-ink-700'}`}
            />
          </button>
        </div>

        {/* Цена */}
        <div className="absolute bottom-2 left-2 rounded-xl bg-white/95 px-2.5 py-1 shadow-card backdrop-blur">
          <div className="text-[13px] font-extrabold text-ink-900">{formatPrice(ad)}</div>
        </div>
      </div>

      {/* Тело: единая структура, всегда 3 строки */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {/* Заголовок — всегда 2 строки для одинаковой высоты */}
        <div className="line-clamp-2 min-h-[2.5em] text-[13px] font-semibold leading-snug text-ink-900 md:text-sm">
          {ad.title}
        </div>

        {/* Адрес — всегда одна строка */}
        <div className="flex items-center gap-1 text-[11px] text-ink-500 md:text-[12px]">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-600" />
          <span className="truncate">{ad.address || cityName(ad.city)}</span>
        </div>

        {/* Мета — прижата к низу, всегда одна строка */}
        <div className="mt-auto flex items-center gap-1.5">
          {ad.verified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200 md:text-[11px]">
              <BadgeCheck className="h-3 w-3" />
              Проверен
            </span>
          ) : (
            <span className="text-[10px] text-ink-300">·</span>
          )}
          <span className="ml-auto inline-flex items-center gap-0.5 whitespace-nowrap text-[10px] text-ink-500 md:text-[11px]">
            <Clock className="h-3 w-3" />
            {isEvent ? ad.eventDate : ad.date}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
