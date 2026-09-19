'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import SectionTabs from '@/components/SectionTabs';
import FilterButton from '@/components/FilterButton';
import AdCard from '@/components/AdCard';
import AdModal from '@/components/AdModal';
import PostAdModal from '@/components/PostAdModal';
import PricingModal from '@/components/PricingModal';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import {
  SECTIONS,
  getAd,
  getAds,
  getCountsBySection
} from '@/lib/api';

export default function HomePage() {
  const [city, setCity] = useState('all');
  const [section, setSection] = useState('market');
  const [chip, setChip] = useState(null);
  const [view, setView] = useState('grid');

  const [ads, setAds] = useState([]);
  const [counts, setCounts] = useState({});

  const [openAd, setOpenAd] = useState(null);
  const [postOpen, setPostOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  // Динамические данные — через lib/api. Позже подменится на fetch без правок компонентов.
  useEffect(() => {
    let cancelled = false;
    getAds({ city, section, chip }).then((list) => {
      if (!cancelled) setAds(list);
    });
    return () => {
      cancelled = true;
    };
  }, [city, section, chip]);

  useEffect(() => {
    let cancelled = false;
    getCountsBySection(city).then((c) => {
      if (!cancelled) setCounts(c);
    });
    return () => {
      cancelled = true;
    };
  }, [city]);

  async function onSearchSelect(sel) {
    if (sel.kind === 'ad') {
      const ad = await getAd(sel.id);
      if (ad) {
        setSection(ad.section);
        setOpenAd(ad);
      }
    } else if (sel.kind === 'section') {
      setSection(sel.id);
    }
  }

  const sectionName = useMemo(
    () => SECTIONS.find((s) => s.id === section)?.name,
    [section]
  );

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Header city={city} onCityChange={setCity} onSearchSelect={onSearchSelect} />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
        <HeroBanner
          city={city}
          onPricing={() => setPricingOpen(true)}
          onPostAd={() => setPostOpen(true)}
        />

        <section className="space-y-2">
          <div className="px-0.5">
            <div className="text-[11px] uppercase tracking-wide text-ink-500 font-bold">
              Разделы
            </div>
            <div className="text-base md:text-lg font-extrabold text-ink-900 leading-tight">
              Куда сегодня заглянуть?
            </div>
          </div>
          <SectionTabs value={section} onChange={setSection} counts={counts} />
        </section>

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3 px-0.5">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-ink-500 font-bold">
                {sectionName}
              </div>
              <div className="text-base md:text-lg font-extrabold text-ink-900 leading-tight">
                Найдено {ads.length} объявлен{plural(ads.length)}
                {chip ? <span className="text-brand-700"> · {chip}</span> : null}
              </div>
            </div>
            <FilterButton
              section={section}
              value={chip}
              onChange={setChip}
              view={view}
              onViewChange={setView}
            />
          </div>

          <motion.div
            layout
            className={
              view === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr'
                : 'grid grid-cols-1 gap-3 auto-rows-fr'
            }
          >
            <AnimatePresence mode="popLayout">
              {ads.map((ad) => (
                <motion.div
                  layout
                  key={ad.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className="h-full"
                >
                  <AdCard ad={ad} onOpen={setOpenAd} />
                </motion.div>
              ))}
            </AnimatePresence>
            {ads.length === 0 && (
              <div className="col-span-full rounded-2xl bg-white ring-1 ring-black/5 p-8 text-center">
                <div className="text-2xl">🤷‍♂️</div>
                <div className="mt-2 font-extrabold text-ink-900">Пока пусто</div>
                <div className="text-sm text-ink-500">
                  В этом городе и разделе объявлений пока нет. Станьте первым!
                </div>
                <button
                  onClick={() => setPostOpen(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2"
                >
                  + Подать объявление
                </button>
              </div>
            )}
          </motion.div>
        </section>

        <section className="rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 ring-1 ring-amber-200 p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-amber-800 font-bold">
              Для местного бизнеса
            </div>
            <div className="text-base md:text-lg font-extrabold text-ink-900 leading-tight">
              Станьте «Проверенным мастером» — получайте заявки со всей агломерации
            </div>
            <div className="text-xs md:text-sm text-ink-700 mt-1">
              От 500 ₽/мес — приоритет в поиске, значок доверия и аналитика.
            </div>
          </div>
          <button
            onClick={() => setPricingOpen(true)}
            className="rounded-full bg-ink-900 hover:bg-black text-white font-semibold text-sm px-4 py-2.5 shadow-card shrink-0"
          >
            Смотреть тарифы
          </button>
        </section>
      </main>

      <Footer />

      <AdModal ad={openAd} onClose={() => setOpenAd(null)} />
      <PostAdModal open={postOpen} onClose={() => setPostOpen(false)} />
      <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} />

      <BottomNav onPost={() => setPostOpen(true)} />
    </div>
  );
}

function plural(n) {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return 'ие';
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return 'ия';
  return 'ий';
}
