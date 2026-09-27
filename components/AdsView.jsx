'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import CategoryStrip from '@/components/CategoryStrip';
import CatalogSheet from '@/components/CatalogSheet';
import AdCard from '@/components/AdCard';
import AdCardSkeleton from '@/components/AdCardSkeleton';
import Modal from '@/components/Modal';
import PostAdModal from '@/components/PostAdModal';
import PricingModal from '@/components/PricingModal';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { ChevronDown, ListFilter, MapPin, Sparkles, X } from 'lucide-react';
import {
  DEFAULT_REGION_ID,
  FREE_SECTION,
  getAds,
  getSection,
  resolvePlace
} from '@/lib/api';
import { pluralRu } from '@/lib/format';

const SORTS = [
  { id: 'top', name: 'Рекомендуемые' },
  { id: 'recent', name: 'Сначала новые' },
  { id: 'cheap', name: 'Дешевле' },
  { id: 'expensive', name: 'Дороже' }
];

/**
 * Основной экран сервиса.
 * `place` — id региона (kvn) или id города (vyksa), из пути.
 * Фильтры живут в query: ?section=&group=&q=&sort=&pmin=&pmax= — ссылкой можно поделиться,
 * «назад» возвращает прошлый фильтр. По умолчанию — все объявления места.
 */
export default function AdsView({ place = DEFAULT_REGION_ID }) {
  // useSearchParams на статической странице требует Suspense; пока он не готов —
  // та же разметка без фильтров, чтобы не было пустого экрана.
  return (
    <Suspense fallback={<Feed place={place} params={null} />}>
      <FeedWithParams place={place} />
    </Suspense>
  );
}

function FeedWithParams({ place }) {
  const params = useSearchParams();
  return <Feed place={place} params={params} />;
}

function readFilters(params) {
  const get = (k) => params?.get(k) || null;
  const num = (k) => {
    const v = get(k);
    return v != null && /^\d+$/.test(v) ? Number(v) : null;
  };
  const section = getSection(get('section')) ? get('section') : null;
  return {
    section,
    group: section ? get('group') : null,
    q: get('q'),
    sort: SORTS.some((s) => s.id === get('sort')) ? get('sort') : 'top',
    priceMin: num('pmin'),
    priceMax: num('pmax')
  };
}

function Feed({ place, params }) {
  const router = useRouter();
  const pathname = usePathname();
  const filters = readFilters(params);
  const { section, group, q, sort, priceMin, priceMax } = filters;

  const [primary, setPrimary] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [postOpen, setPostOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  const resolved = resolvePlace(place) || resolvePlace(DEFAULT_REGION_ID);
  const isCity = resolved?.kind === 'city';
  const ready = params !== null;

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    getAds({
      place,
      section,
      group,
      search: q,
      sort,
      priceMin,
      priceMax,
      includeNearby: isCity
    })
      .then((r) => {
        if (cancelled) return;
        if (isCity) {
          setPrimary(r.primary);
          setNearby(r.nearby);
        } else {
          setPrimary(r);
          setNearby([]);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setPrimary([]);
        setNearby([]);
        setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, place, section, group, q, sort, priceMin, priceMax, isCity, reloadKey]);

  // Меняем только query через History API: Next 14 синхронизирует useSearchParams,
  // а запроса к серверу за страницей нет — фильтр переключается мгновенно.
  function setFilters(patch) {
    const next = new URLSearchParams(params?.toString() || '');
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === '') next.delete(k);
      else next.set(k, String(v));
    }
    if (next.get('sort') === 'top') next.delete('sort');
    const qs = next.toString();
    window.history.pushState(null, '', qs ? `${pathname}?${qs}` : pathname);
  }

  function onPlaceChange(newPlace) {
    const qs = params?.toString();
    const path = newPlace === DEFAULT_REGION_ID ? '/' : `/${newPlace}`;
    router.push(qs ? `${path}?${qs}` : path);
  }

  function onSearchSelect(sel) {
    if (sel.kind === 'ad') router.push(`/ad/${sel.id}`);
    else if (sel.kind === 'section') setFilters({ section: sel.id, group: null, q: null });
  }

  const sectionInfo = getSection(section);
  const hasPrice = priceMin != null || priceMax != null;
  const hasFilters = !!(section || q || hasPrice || sort !== 'top');
  const sortName = SORTS.find((s) => s.id === sort)?.name;

  const title = q ? `«${q}»` : sectionInfo ? sectionInfo.name : sort === 'top' ? 'Рекомендуем' : 'Все объявления';

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Header
        place={place}
        onPlaceChange={onPlaceChange}
        search={q || ''}
        onSearchSubmit={(text) => setFilters({ q: text || null })}
        onSearchSelect={onSearchSelect}
      />

      <CategoryStrip
        value={section}
        group={group}
        onChange={(id) => setFilters({ section: id, group: null })}
        onGroupChange={(g) => setFilters({ group: g })}
        onMore={() => setCatalogOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-4 pb-4 md:py-6 space-y-4 md:space-y-6">
        {!hasFilters && (
          <div className="hidden md:block">
            <HeroBanner
              place={place}
              onPricing={() => setPricingOpen(true)}
              onPostAd={() => setPostOpen(true)}
            />
          </div>
        )}

        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-3 px-0.5">
            <div className="min-w-0">
              {q && <div className="text-[12px] font-semibold text-ink-500">Поиск{sectionInfo ? ` · ${sectionInfo.name}` : ''}</div>}
              <h1 className="text-2xl font-extrabold text-ink-900 leading-tight truncate">{title}</h1>
            </div>
            <div className="text-[13px] text-ink-500 shrink-0">
              {loading || !ready || loadError
                ? ''
                : `${primary.length} ${pluralRu(primary.length, ['объявление', 'объявления', 'объявлений'])}`}
            </div>
          </div>

          {/* Сортировка (иконкой), цена, сброс */}
          <div className="-mx-4 md:mx-0 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 px-4 md:px-0 py-1 w-max">
              {/* Нативный select поверх иконки: на телефоне открывается системный список */}
              <label className={`pill relative px-3.5 ${sort !== 'top' ? 'pill-on' : ''}`} title={sortName}>
                <ListFilter className="w-5 h-5" strokeWidth={2} />
                <ChevronDown className="w-4 h-4" strokeWidth={2.2} />
                <select
                  value={sort}
                  onChange={(e) => setFilters({ sort: e.target.value })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label={`Сортировка: ${sortName}`}
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              {section !== FREE_SECTION.id && (
                <button onClick={() => setPriceOpen(true)} className={`pill ${hasPrice ? 'pill-on' : ''}`}>
                  {hasPrice ? priceLabel(priceMin, priceMax) : 'Цена'}
                  <ChevronDown className="w-4 h-4" strokeWidth={2.2} />
                </button>
              )}

              {hasFilters && (
                <button
                  onClick={() => window.history.pushState(null, '', pathname)}
                  className="inline-flex items-center gap-1 h-10 px-2 text-[14px] font-semibold text-ink-500 hover:text-ink-800"
                >
                  <X className="w-4 h-4" />
                  Сбросить
                </button>
              )}
            </div>
          </div>

          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr">
            <AnimatePresence mode="popLayout">
              {loading || !ready
                ? Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      layout
                      key={`skel-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="h-full"
                    >
                      <AdCardSkeleton />
                    </motion.div>
                  ))
                : primary.map((ad) => (
                    <motion.div
                      layout
                      key={ad.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="h-full"
                    >
                      <AdCard ad={ad} onOpen={(a) => router.push(`/ad/${a.id}`)} />
                    </motion.div>
                  ))}
            </AnimatePresence>
            {ready && !loading && loadError && (
              <div className="col-span-full rounded-2xl bg-white ring-1 ring-black/5 p-8 text-center">
                <div className="font-extrabold text-ink-900">Не удалось загрузить объявления</div>
                <div className="text-sm text-ink-500">Проверьте интернет и попробуйте ещё раз.</div>
                <button
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2"
                >
                  Повторить
                </button>
              </div>
            )}
            {ready && !loading && !loadError && primary.length === 0 && (
              <div className="col-span-full rounded-2xl bg-white ring-1 ring-black/5 p-8 text-center">
                <div className="font-extrabold text-ink-900">
                  {hasFilters ? 'Ничего не нашлось' : 'Пока пусто'}
                </div>
                <div className="text-sm text-ink-500">
                  {hasFilters
                    ? 'Попробуйте другой запрос или уберите часть фильтров.'
                    : 'Здесь ещё нет объявлений. Станьте первым!'}
                </div>
                {hasFilters ? (
                  <button
                    onClick={() => window.history.pushState(null, '', pathname)}
                    className="mt-3 btn-outline h-10 px-4 text-sm"
                  >
                    Сбросить фильтры
                  </button>
                ) : (
                  <button
                    onClick={() => setPostOpen(true)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2"
                  >
                    + Подать объявление
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* «В соседних городах» — только когда выбран конкретный город */}
          {isCity && nearby.length > 0 && (
            <NearbyBlock
              cityName={resolved.city.name}
              nearby={nearby}
              onOpen={(a) => router.push(`/ad/${a.id}`)}
              onExpand={() => onPlaceChange(resolved.region.id)}
              regionName={resolved.region.shortName}
            />
          )}
        </section>
      </main>

      <Footer />

      <PriceModal
        open={priceOpen}
        onClose={() => setPriceOpen(false)}
        min={priceMin}
        max={priceMax}
        onApply={(min, max) => {
          setPriceOpen(false);
          setFilters({ pmin: min, pmax: max });
        }}
      />
      <CatalogSheet
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        onPick={(id, g) => {
          setCatalogOpen(false);
          setFilters({ section: id, group: g, q: null });
        }}
      />
      <PostAdModal open={postOpen} onClose={() => setPostOpen(false)} />
      <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} />

      <BottomNav onPost={() => setPostOpen(true)} feedPath={pathname} />
    </div>
  );
}

function priceLabel(min, max) {
  const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n);
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)} ₽`;
  if (min != null) return `от ${fmt(min)} ₽`;
  return `до ${fmt(max)} ₽`;
}

function PriceModal({ open, onClose, min, max, onApply }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    if (!open) return;
    setFrom(min != null ? String(min) : '');
    setTo(max != null ? String(max) : '');
  }, [open, min, max]);

  const toNum = (v) => (v === '' ? null : Number(v));
  let a = toNum(from);
  let b = toNum(to);
  if (a != null && b != null && a > b) [a, b] = [b, a];

  const input =
    'w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-base';

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <form
        className="p-5 md:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          onApply(a, b);
        }}
      >
        <h3 className="text-xl font-extrabold text-ink-900">Цена, ₽</h3>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value.replace(/\D/g, '').slice(0, 9))}
            inputMode="numeric"
            placeholder="от"
            aria-label="Цена от"
            className={input}
          />
          <input
            value={to}
            onChange={(e) => setTo(e.target.value.replace(/\D/g, '').slice(0, 9))}
            inputMode="numeric"
            placeholder="до"
            aria-label="Цена до"
            className={input}
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onApply(null, null)}
            className="btn-outline rounded-2xl px-4 py-3 text-sm"
          >
            Сбросить
          </button>
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 text-sm font-semibold"
          >
            Показать
          </button>
        </div>
      </form>
    </Modal>
  );
}

function NearbyBlock({ cityName, nearby, onOpen, onExpand, regionName }) {
  return (
    <div className="mt-6 rounded-2xl bg-slate-50/70 ring-1 ring-black/5 p-3 md:p-4 relative">
      <div className="flex items-center gap-2 mb-3 px-0.5">
        <MapPin className="w-4 h-4 text-brand-600" />
        <div className="min-w-0">
          <div className="text-sm font-bold text-ink-900">В соседних городах</div>
          <div className="text-[11px] text-ink-500">
            Помимо {cityName} — из региона {regionName} и рядом
          </div>
        </div>
        <button
          onClick={onExpand}
          className="ml-auto btn-outline h-9 px-3 text-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          Показать все
        </button>
      </div>
      {/* Обёртка с градиентом-затуханием снизу — намёк «есть ещё, кликните «Показать все» */}
      <div className="relative max-h-[520px] overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr">
          {nearby.map((ad) => (
            <div key={ad.id} className="h-full opacity-70 hover:opacity-100 transition">
              <AdCard ad={ad} onOpen={onOpen} />
            </div>
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
          style={{
            background:
              'linear-gradient(180deg, rgba(246,247,251,0) 0%, rgba(246,247,251,0.85) 60%, rgba(246,247,251,1) 100%)'
          }}
        />
      </div>
      <div className="mt-2 flex justify-center relative z-10">
        <button
          onClick={onExpand}
          className="rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 shadow-card"
        >
          Показать все объявления региона
        </button>
      </div>
    </div>
  );
}
