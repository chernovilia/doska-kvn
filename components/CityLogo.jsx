'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DEFAULT_REGION_ID,
  REGIONS,
  getCitiesOfRegion,
  resolvePlace
} from '@/lib/api';

/**
 * Логотип с дропдауном «регион — город».
 * value  — id текущего «места» (регион или город).
 * onChange(placeId) — вызывается при выборе места. Родитель уже роутит на /placeId.
 *
 * Структура меню:
 *   Секция «Ваш регион» — регион по домену + его города.
 *   Секция «Другие регионы» — все остальные (пока не запущенные — с меткой «скоро»).
 */
export default function CityLogo({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const resolved = resolvePlace(value) || resolvePlace(DEFAULT_REGION_ID);
  const label = resolved?.kind === 'region' ? resolved.region.shortName : resolved?.city.name;

  const homeRegion = REGIONS.find((r) => r.id === DEFAULT_REGION_ID);
  const hasOtherLaunched = REGIONS.some((r) => r.id !== DEFAULT_REGION_ID && r.launched);

  function select(id) {
    onChange?.(id);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative select-none">
      <div className="flex items-baseline font-black tracking-tight text-2xl md:text-3xl leading-none text-ink-900">
        <span>Доска</span>
        <span className="brand-slash">/</span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="group inline-flex items-baseline gap-1 text-ink-900 hover:text-brand-700 transition"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span className="border-b-2 border-dotted border-ink-300 group-hover:border-brand-500">
            {label}
          </span>
          <ChevronDown
            className={`w-4 h-4 md:w-5 md:h-5 self-center text-ink-500 group-hover:text-brand-600 transition ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-[300px] max-w-[92vw] rounded-2xl bg-white shadow-soft ring-1 ring-black/5 z-50 overflow-hidden"
            role="menu"
          >
            {/* Ваш регион */}
            {homeRegion && (
              <div className="p-1.5">
                <div className="px-2.5 py-1 text-[10px] uppercase tracking-wide text-ink-500 font-bold">
                  Ваш регион
                </div>
                <RegionRow
                  id={homeRegion.id}
                  name={homeRegion.shortName}
                  hint={homeRegion.hint}
                  isActive={value === homeRegion.id}
                  isAggregate
                  onClick={() => select(homeRegion.id)}
                />
                {getCitiesOfRegion(homeRegion.id).map((c) => (
                  <RegionRow
                    key={c.id}
                    id={c.id}
                    name={c.name}
                    isCity
                    isActive={value === c.id}
                    onClick={() => select(c.id)}
                  />
                ))}
              </div>
            )}

            {/* Другие регионы — пока заглушка «скоро» */}
            {!hasOtherLaunched && (
              <div className="border-t border-black/5 p-1.5">
                <div className="px-2.5 py-1 text-[10px] uppercase tracking-wide text-ink-500 font-bold">
                  Другие регионы
                </div>
                <div className="mx-1 my-1 rounded-xl bg-slate-50 ring-1 ring-black/5 px-3 py-2.5 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-ink-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink-800">Скоро</div>
                    <div className="text-[11px] text-ink-500">
                      Расширяемся на соседние города
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RegionRow({ id, name, hint, isAggregate, isCity, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center gap-2 hover:bg-brand-50 ${
        isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-800'
      }`}
      role="menuitem"
    >
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          isActive ? 'bg-brand-600' : isAggregate ? 'bg-accent-500' : 'bg-slate-300'
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold truncate">
          {name}
          {isAggregate && (
            <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-accent-600">
              все города
            </span>
          )}
        </div>
        {hint && !isCity && (
          <div className="text-[11px] text-ink-500 truncate">{hint}</div>
        )}
      </div>
      {isActive && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
    </button>
  );
}
