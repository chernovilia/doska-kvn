'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { HERO_SLIDES } from '@/data/slides';
import { resolvePlace, DEFAULT_REGION_ID } from '@/lib/api';

const ACCENTS = {
  brand: {
    bg: 'from-brand-600 to-brand-800',
    orb1: 'bg-white/10',
    orb2: 'bg-accent-500/30',
    eyebrow: 'text-white/70',
    accent: 'text-amber-300'
  },
  emerald: {
    bg: 'from-emerald-600 to-emerald-800',
    orb1: 'bg-white/10',
    orb2: 'bg-emerald-300/30',
    eyebrow: 'text-white/75',
    accent: 'text-emerald-200'
  },
  amber: {
    bg: 'from-amber-500 to-orange-700',
    orb1: 'bg-white/15',
    orb2: 'bg-yellow-300/30',
    eyebrow: 'text-white/80',
    accent: 'text-amber-100'
  }
};

const AUTOPLAY_MS = 6500;

export default function HeroBanner({
  place = DEFAULT_REGION_ID,
  onPricing,
  onPostAd
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const resolved = resolvePlace(place) || resolvePlace(DEFAULT_REGION_ID);
  const placeLine = useMemo(() => {
    return resolved.kind === 'region'
      ? resolved.region.name
      : `${resolved.city.name} · ${resolved.region.shortName}`;
  }, [resolved]);

  // Автопрокрутка (пауза при ховере).
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setI((v) => (v + 1) % HERO_SLIDES.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused]);

  const slide = HERO_SLIDES[i];
  const style = ACCENTS[slide.accent] || ACCENTS.brand;

  function onCta() {
    if (slide.ctaKind === 'post') return onPostAd?.();
    if (slide.ctaKind === 'pricing') return onPricing?.();
  }

  const title = slide.title.replace('{place}', placeLine);

  return (
    <section
      className="relative overflow-hidden rounded-2xl shadow-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className={`relative bg-gradient-to-r ${style.bg} text-white`}
        >
          <div className={`absolute -right-8 -top-8 w-40 h-40 rounded-full blur-2xl ${style.orb1}`} />
          <div className={`absolute -left-10 -bottom-14 w-52 h-52 rounded-full blur-3xl ${style.orb2}`} />

          <div className="relative flex flex-col md:flex-row md:items-center gap-3 p-4 md:px-6 md:py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden sm:grid place-items-center w-10 h-10 rounded-xl bg-white/10 ring-1 ring-white/20 text-lg">
                <span>{slide.emoji}</span>
              </div>
              <div className="min-w-0">
                <div className={`text-[11px] font-bold uppercase tracking-wider ${style.eyebrow}`}>
                  {slide.eyebrow}
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-base md:text-lg font-extrabold truncate"
                >
                  {title}
                </motion.div>
                {slide.body && (
                  <div className="text-[12px] md:text-sm text-white/85 mt-0.5 line-clamp-2">
                    {slide.body}
                  </div>
                )}
              </div>
            </div>

            <div className="md:ml-auto flex items-center gap-2">
              {slide.ctaKind === 'link' ? (
                <Link
                  href={slide.ctaHref || '/'}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white text-ink-900 hover:bg-white/90 font-semibold text-sm px-4 py-2 shadow-card"
                >
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  {slide.ctaLabel}
                </Link>
              ) : slide.ctaKind === 'post' ? (
                <button
                  onClick={onCta}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent-500 hover:bg-accent-600 text-white font-semibold text-sm px-4 py-2 shadow-card"
                >
                  <Plus className="w-4 h-4" />
                  {slide.ctaLabel}
                </button>
              ) : (
                <button
                  onClick={onCta}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white text-ink-900 hover:bg-white/90 font-semibold text-sm px-4 py-2 shadow-card"
                >
                  <TrendingUp className="w-4 h-4 text-brand-600" />
                  {slide.ctaLabel}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Точки-навигация */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {HERO_SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setI(idx)}
            aria-label={`Слайд ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              idx === i ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      {/* Стрелки — только на десктопе */}
      <button
        onClick={() => setI((v) => (v - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
        aria-label="Предыдущий слайд"
        className="hidden md:grid absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 place-items-center rounded-full bg-white/10 hover:bg-white/25 text-white z-10"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => setI((v) => (v + 1) % HERO_SLIDES.length)}
        aria-label="Следующий слайд"
        className="hidden md:grid absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 place-items-center rounded-full bg-white/10 hover:bg-white/25 text-white z-10"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </section>
  );
}
