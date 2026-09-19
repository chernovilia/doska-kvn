'use client';

import { BadgeCheck, MapPin, Phone, MessageCircle, Star, Shield, Share2, Crown, Flame, ExternalLink } from 'lucide-react';
import { cityName } from '@/lib/api';
import { formatPrice, formatRelative, formatEventDate } from '@/lib/format';
import Modal from './Modal';
import { useState } from 'react';

export default function AdModal({ ad, onClose }) {
  const [revealed, setRevealed] = useState(false);
  if (!ad) return null;

  const gallery = ad.gallery && ad.gallery.length ? ad.gallery : [ad.image];

  return (
    <Modal open={!!ad} onClose={onClose} size="xl">
      <div className="grid md:grid-cols-2">
        {/* Галерея */}
        <div className="bg-slate-100">
          <div className="aspect-[4/3] md:aspect-auto md:h-full relative">
            <img src={gallery[0]} alt={ad.title} className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 flex flex-col items-start gap-1">
              {ad.top && (
                <span className="top-badge inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full shadow">
                  <Crown className="w-3 h-3" /> TOP
                </span>
              )}
              {ad.urgent && (
                <span className="inline-flex items-center gap-1 bg-accent-500 text-white text-[11px] font-bold px-2 py-1 rounded-full shadow">
                  <Flame className="w-3 h-3" /> Срочно
                </span>
              )}
            </div>
          </div>
          {gallery.length > 1 && (
            <div className="p-3 flex gap-2 overflow-x-auto no-scrollbar">
              {gallery.map((g, i) => (
                <img
                  key={i}
                  src={g}
                  alt=""
                  className="w-20 h-20 rounded-xl object-cover ring-1 ring-black/5"
                />
              ))}
            </div>
          )}
        </div>

        {/* Контент */}
        <div className="p-5 md:p-6">
          <div className="flex items-center gap-2 text-[12px] text-ink-500" suppressHydrationWarning>
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            {ad.address || cityName(ad.city)} • {ad.section === 'events' ? formatEventDate(ad.eventDate) : formatRelative(ad.createdAt)}
          </div>
          <h2 className="mt-1 text-xl md:text-2xl font-extrabold text-ink-900 leading-tight">
            {ad.title}
          </h2>
          <div className="mt-2 text-2xl font-black text-brand-700">{formatPrice(ad)}</div>

          <div className="mt-3 flex flex-wrap gap-2">
            {ad.verified && (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 px-2 py-1 rounded-full">
                <BadgeCheck className="w-3.5 h-3.5" /> Проверен через «Подслушано»
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700 bg-brand-50 ring-1 ring-brand-200 px-2 py-1 rounded-full">
              <Shield className="w-3.5 h-3.5" /> Прошло модерацию
            </span>
          </div>

          {ad.description && (
            <p className="mt-4 text-sm text-ink-700 leading-relaxed">{ad.description}</p>
          )}

          {/* Автор */}
          <div className="mt-5 rounded-2xl bg-slate-50 ring-1 ring-black/5 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white grid place-items-center font-bold">
              {ad.author?.name?.[0] || '?'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink-900 truncate">{ad.author?.name}</div>
              <div className="text-[12px] text-ink-500 flex items-center gap-2">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {ad.author?.rating?.toFixed?.(1) || '—'}
                <span className="text-ink-300">•</span>
                {ad.author?.deals ?? 0} сделок
              </div>
            </div>
          </div>

          {/* Кнопки контактов */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => setRevealed(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-3"
            >
              <Phone className="w-4 h-4" />
              {revealed ? ad.phone || '+7 (___) ___-__-__' : 'Показать телефон'}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={ad.tg || '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white ring-1 ring-black/10 hover:bg-brand-50 font-semibold px-4 py-3 text-ink-900"
              >
                <MessageCircle className="w-4 h-4 text-sky-500" />
                TG
              </a>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white ring-1 ring-black/10 hover:bg-brand-50 font-semibold px-4 py-3 text-ink-900"
                onClick={() => alert('Поделиться ссылкой (демо)')}
              >
                <Share2 className="w-4 h-4 text-brand-600" />
                VK
              </button>
            </div>
          </div>

          {ad.avitoUrl && (
            <a
              href={ad.avitoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white ring-1 ring-black/10 hover:bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 w-full justify-center"
            >
              <ExternalLink className="w-4 h-4" />
              Открыть похожие на Авито
            </a>
          )}

          <p className="mt-3 text-[11px] text-ink-500">
            Мы никогда не берём предоплату без встречи. Пожалуйста, соблюдайте правила безопасных сделок.
          </p>
        </div>
      </div>
    </Modal>
  );
}
