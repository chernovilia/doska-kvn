'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/Toast';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '@/components/Header';
import CategoryStrip from '@/components/CategoryStrip';
import CatalogSheet from '@/components/CatalogSheet';
import AdCard from '@/components/AdCard';
import AdCardSkeleton from '@/components/AdCardSkeleton';
import Modal from '@/components/Modal';
import PostAdModal from '@/components/PostAdModal';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { ChevronDown, LayoutGrid, ListFilter, MapPin, SlidersHorizontal, X } from 'lucide-react';
import {
  DEFAULT_REGION_ID,
  FREE_SECTION,
  getAds,
  getMoreAds,
  getSection,
  resolvePlace
} from '@/lib/api';
import { pluralRu, adPath } from '@/lib/format';
import { useAuth } from '@/lib/auth';
import { getAttributeFields, parseAttributeInput } from '@/data/attributes';

// Лента после «Показать ещё» — чтобы «Назад» из объявления вернул к тому же месту, а не к первой странице.
let feedMemo = null;
const FEED_MEMO_MS = 3 * 60_000;

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
    priceMax: num('pmax'),
    attr: section ? readAttr(get('attr')) : {}
  };
}

// ?attr= — JSON фильтров по характеристикам. Битый JSON из чужой ссылки — просто без фильтров.
function readAttr(raw) {
  if (!raw) return {};
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

function Feed({ place, params }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: authUser, ready: authReady } = useAuth();
  const filters = readFilters(params);
  const { section, group, q, sort, priceMin, priceMax, attr } = filters;
  const attrKey = Object.keys(attr).length ? JSON.stringify(attr) : null;
  const attrFields = section ? getAttributeFields(section, group).filter((f) => f.type !== 'text') : [];

  const [primary, setPrimary] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { toast } = useToast();
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [postOpen, setPostOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [attrOpen, setAttrOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  const resolved = resolvePlace(place) || resolvePlace(DEFAULT_REGION_ID);
  const isCity = resolved?.kind === 'city';
  const ready = params !== null;

  // Одна лента = место + все фильтры
  const feedKey = JSON.stringify([place, section, group, q, sort, priceMin, priceMax, attrKey]);

  const showMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const key = feedKey;
    try {
      const r = await getMoreAds({ place, section, group, search: q, sort, priceMin, priceMax, attr: attrKey, offset: primary.length });
      // Пока грузили, лента могла смениться (другой раздел, город)
      if (key !== feedKeyRef.current) return;
      // Между запросами порядок мог сдвинуться — повторы не показываем
      const seen = new Set(primary.map((a) => a.id));
      const next = [...primary, ...r.items.filter((a) => !seen.has(a.id))];
      setPrimary(next);
      setHasMore(r.hasMore);
      feedMemo = { key, reloadKey, primary: next, nearby, hasMore: r.hasMore, at: Date.now() };
    } catch {
      toast('Не удалось загрузить. Попробуйте ещё раз');
    } finally {
      setLoadingMore(false);
    }
  };
  const feedKeyRef = useRef(feedKey);
  feedKeyRef.current = feedKey;

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    // Вернулись «Назад» из объявления после «Показать ещё» — показываем то, что уже было загружено
    if (feedMemo && feedMemo.key === feedKey && reloadKey === feedMemo.reloadKey && Date.now() - feedMemo.at < FEED_MEMO_MS) {
      setPrimary(feedMemo.primary);
      setNearby(feedMemo.nearby);
      setHasMore(feedMemo.hasMore);
      setLoadError(false);
      setLoading(false);
      // …и к тому же месту ленты
      const y = feedMemo.scrollY;
      if (y) requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
      return;
    }
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
      attr: attrKey,
      includeNearby: isCity
    })
      .then((r) => {
        if (cancelled) return;
        setPrimary(r.primary);
        setNearby(r.nearby);
        setHasMore(r.hasMore);
        feedMemo = null;
      })
      .catch(() => {
        if (cancelled) return;
        setPrimary([]);
        setNearby([]);
        setHasMore(false);
        setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, place, section, group, q, sort, priceMin, priceMax, attrKey, isCity, reloadKey]);

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

  // Подача — только вошедшим: гостя ведём на вход и возвращаем на эту же ленту.
  function openPost() {
    if (!authReady) return;
    if (!authUser) {
      const back = window.location.pathname + window.location.search;
      router.push(`/login?returnTo=${encodeURIComponent(back)}`);
      return;
    }
    setPostOpen(true);
  }

  function onPlaceChange(newPlace) {
    const qs = params?.toString();
    const path = newPlace === DEFAULT_REGION_ID ? '/' : `/${newPlace}`;
    router.push(qs ? `${path}?${qs}` : path);
  }

  function onSearchSelect(sel) {
    if (sel.kind === 'ad') router.push(adPath(sel.id));
    else if (sel.kind === 'section') setFilters({ section: sel.id, group: null, q: null });
  }

  const sectionInfo = getSection(section);
  const hasPrice = priceMin != null || priceMax != null;
  const attrCount = Object.keys(attr).length;
  const hasFilters = !!(section || q || hasPrice || sort !== 'top' || attrCount);
  const sortName = SORTS.find((s) => s.id === sort)?.name;

  const title = q ? `«${q}»` : sectionInfo ? sectionInfo.name : 'Все объявления';

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Header
        place={place}
        onPlaceChange={onPlaceChange}
        search={q || ''}
        onSearchSubmit={(text) => setFilters({ q: text || null })}
        onSearchSelect={onSearchSelect}
        onPost={openPost}
      />

      <CategoryStrip
        value={section}
        group={group}
        onChange={(id) => setFilters({ section: id, group: null, attr: null })}
        onGroupChange={(g) => setFilters({ group: g, attr: null })}
        onMore={() => setCatalogOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-4 pb-4 md:py-6 space-y-4 md:space-y-6">
        {/* Баннеры-карусель на компьютере убраны до настройки через админку (components/HeroBanner.jsx) */}
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

              {attrFields.length > 0 && (
                <button onClick={() => setAttrOpen(true)} className={`pill ${attrCount ? 'pill-on' : ''}`}>
                  <SlidersHorizontal className="w-4 h-4" strokeWidth={2.2} />
                  Фильтры
                  {attrCount > 0 && (
                    <span className="min-w-[20px] h-5 px-1 grid place-items-center rounded-full bg-accent-500 text-white text-[11px] font-bold">
                      {attrCount}
                    </span>
                  )}
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

          {/* Сетка без layout-анимации: она масштабировала всё содержимое, и плашка «пусто» растягивалась */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr"
            onClickCapture={() => {
              // Уходим в объявление — запоминаем место, чтобы «Назад» вернул сюда же
              if (feedMemo && feedMemo.key === feedKey) feedMemo.scrollY = window.scrollY;
            }}
          >
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
                      <AdCard ad={ad} />
                    </motion.div>
                  ))}
            </AnimatePresence>
            {ready && !loading && loadError && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="col-span-full rounded-2xl bg-white ring-1 ring-black/5 p-8 text-center"
              >
                <div className="font-extrabold text-ink-900">Не удалось загрузить объявления</div>
                <div className="text-sm text-ink-500">Проверьте интернет и попробуйте ещё раз.</div>
                <button
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full btn-primary text-sm px-4 py-2"
                >
                  Повторить
                </button>
              </motion.div>
            )}
            {ready && !loading && !loadError && primary.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="col-span-full rounded-2xl bg-white ring-1 ring-black/5 p-8 text-center"
              >
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
                    onClick={openPost}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full btn-primary text-sm px-4 py-2"
                  >
                    + Подать объявление
                  </button>
                )}
              </motion.div>
            )}
          </div>

          {ready && !loading && !loadError && hasMore && (
            <div className="mt-4 flex justify-center">
              <button onClick={showMore} disabled={loadingMore} className="btn-outline h-11 px-6 text-sm disabled:opacity-60">
                {loadingMore ? 'Загружаем…' : 'Показать ещё'}
              </button>
            </div>
          )}

          {/* «В соседних городах» — только когда выбран конкретный город */}
          {isCity && nearby.length > 0 && (
            <NearbyBlock nearby={nearby} onExpand={() => onPlaceChange(resolved.region.id)} />
          )}
        </section>
      </main>

      {/* На телефоне лента без подвала: навигация — в нижнем меню */}
      <div className="hidden md:block">
        <Footer />
      </div>

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
          setFilters({ section: id, group: g, q: null, attr: null });
        }}
      />
      <AttrFiltersModal
        open={attrOpen}
        onClose={() => setAttrOpen(false)}
        fields={attrFields}
        value={attr}
        onApply={(next) => {
          setAttrOpen(false);
          setFilters({ attr: Object.keys(next).length ? JSON.stringify(next) : null });
        }}
      />
      <PostAdModal open={postOpen} onClose={() => setPostOpen(false)} />

      <BottomNav onPost={() => setPostOpen(true)} />
    </div>
  );
}

function priceLabel(min, max) {
  const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n);
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)} ₽`;
  if (min != null) return `от ${fmt(min)} ₽`;
  return `до ${fmt(max)} ₽`;
}

// Фильтры по характеристикам подгруппы: варианты — плашками (один на поле), числа — от/до.
function AttrFiltersModal({ open, onClose, fields, value, onApply }) {
  const [draft, setDraft] = useState({});

  // Черновик — строки из полей ввода; при открытии берём текущие фильтры из URL.
  useEffect(() => {
    if (!open) return;
    const d = {};
    for (const f of fields) {
      const v = value[f.key];
      if (v == null) continue;
      if (f.type === 'number' && typeof v === 'object') {
        d[f.key] = { gte: v.gte != null ? String(v.gte) : '', lte: v.lte != null ? String(v.lte) : '' };
      } else {
        d[f.key] = String(v);
      }
    }
    setDraft(d);
    // Только при открытии: fields и value пересобираются на каждом рендере ленты.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function build() {
    const out = {};
    for (const f of fields) {
      const v = draft[f.key];
      if (v == null) continue;
      if (f.type === 'number') {
        const gte = parseAttributeInput(f, v.gte);
        const lte = parseAttributeInput(f, v.lte);
        if (gte != null || lte != null) {
          out[f.key] = {};
          if (gte != null) out[f.key].gte = gte;
          if (lte != null) out[f.key].lte = lte;
        }
      } else if (v) {
        out[f.key] = v;
      }
    }
    return out;
  }

  const input =
    'w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-4 py-2.5 text-base';

  return (
    <Modal open={open} onClose={onClose} size="md">
      <form
        className="p-5 md:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          onApply(build());
        }}
      >
        <h3 className="text-xl font-extrabold text-ink-900">Фильтры</h3>
        <div className="mt-4 space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <div className="text-sm font-semibold text-ink-700">
                {f.label}
                {f.unit && <span className="font-normal text-ink-500">, {f.unit}</span>}
              </div>
              {f.type === 'select' ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {f.options.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, [f.key]: d[f.key] === o ? '' : o }))}
                      className={`chip ${draft[f.key] === o ? 'chip-on' : ''}`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {['gte', 'lte'].map((op) => (
                    <input
                      key={op}
                      value={draft[f.key]?.[op] ?? ''}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          [f.key]: { gte: '', lte: '', ...d[f.key], [op]: e.target.value.slice(0, 12) }
                        }))
                      }
                      inputMode={f.decimals ? 'decimal' : 'numeric'}
                      placeholder={op === 'gte' ? 'от' : 'до'}
                      aria-label={`${f.label} ${op === 'gte' ? 'от' : 'до'}`}
                      className={input}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={() => onApply({})} className="btn-outline rounded-2xl px-4 py-3 text-sm">
            Сбросить
          </button>
          <button
            type="submit"
            className="flex-1 rounded-2xl btn-primary px-4 py-3 text-sm"
          >
            Показать
          </button>
        </div>
      </form>
    </Modal>
  );
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
    'w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-4 py-3 text-base';

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
            className="flex-1 rounded-2xl btn-primary px-4 py-3 text-sm"
          >
            Показать
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Витрина соседних городов: карточки только для вида — тап по любому месту блока
// (или по кнопке) открывает все объявления региона.
function NearbyBlock({ nearby, onExpand }) {
  return (
    <div className="mt-6 rounded-2xl bg-slate-50/70 ring-1 ring-black/5 p-3 md:p-4">
      <div className="flex items-center gap-2 mb-3 px-0.5">
        <MapPin className="w-4 h-4 text-accent-600" />
        <div className="text-sm font-bold text-ink-900">В соседних городах</div>
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={onExpand}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onExpand()}
        aria-label="Показать все объявления соседних городов"
        className="relative max-h-[520px] overflow-hidden cursor-pointer"
      >
        {/* Карточки не кликаются: блок — превью, переход — к полной ленте */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr pointer-events-none select-none" aria-hidden>
          {nearby.map((ad) => (
            <div key={ad.id} className="h-full opacity-70">
              <AdCard ad={ad} />
            </div>
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
          style={{
            background:
              'linear-gradient(180deg, rgba(246,247,251,0) 0%, rgba(246,247,251,0.85) 60%, rgba(246,247,251,1) 100%)'
          }}
        />
      </div>
      <div className="mt-2 flex justify-center relative z-10">
        <button onClick={onExpand} className="rounded-full btn-primary text-sm px-4 py-2 shadow-card">
          <LayoutGrid className="w-4 h-4" />
          Показать все объявления
        </button>
      </div>
    </div>
  );
}
