'use client';

import { motion } from 'framer-motion';
import { Sparkles, Plus, TrendingUp } from 'lucide-react';

export default function HeroBanner({ city, onPricing, onPostAd }) {
  const cityLine =
    city === 'all'
      ? 'Кулебаки • Выкса • Навашино'
      : city === 'kulebaki'
      ? 'Кулебаки'
      : city === 'vyksa'
      ? 'Выкса'
      : 'Навашино';

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 text-white shadow-card">
      <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -left-10 -bottom-14 w-52 h-52 rounded-full bg-accent-500/30 blur-3xl" />

      <div className="relative flex flex-col md:flex-row md:items-center gap-3 p-4 md:px-6 md:py-4">
        {/* Левая часть — заголовок */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:grid place-items-center w-10 h-10 rounded-xl bg-white/10 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-white/70">
              Единый цифровой хаб
            </div>
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-base md:text-lg font-extrabold truncate"
            >
              {cityLine}{' '}
              <span className="text-amber-300 font-black">· Доска/КВН</span>
            </motion.div>
          </div>
        </div>

        {/* Правая часть — CTA */}
        <div className="md:ml-auto flex items-center gap-2">
          <button
            onClick={onPostAd}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent-500 hover:bg-accent-600 text-white font-semibold text-sm px-4 py-2 shadow-card"
          >
            <Plus className="w-4 h-4" />
            Подать объявление
          </button>
          <button
            onClick={onPricing}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 ring-1 ring-white/20 text-white font-semibold text-sm px-3 py-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Для бизнеса</span>
          </button>
        </div>
      </div>
    </section>
  );
}
