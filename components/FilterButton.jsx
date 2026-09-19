'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getChipsForSection } from '@/lib/api';

// Кнопка-иконка «Фильтры» с выпадающей панелью:
// внутри — быстрые чипсы категорий и переключатель вида (плитка/список).
export default function FilterButton({ section, value, onChange, view, onViewChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const list = getChipsForSection(section);
  const hasSelection = !!value;

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold ring-1 shadow-card transition ${
          hasSelection
            ? 'bg-brand-600 text-white ring-brand-600'
            : 'bg-white text-ink-800 ring-black/10 hover:bg-brand-50'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="hidden sm:inline">Фильтры</span>
        {hasSelection && (
          <span className="ml-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-white text-brand-700 text-[10px] font-bold">
            1
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-[300px] max-w-[92vw] rounded-2xl bg-white shadow-soft ring-1 ring-black/5 z-40 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-black/5 flex items-center">
              <div className="font-extrabold text-ink-900 text-sm">Фильтры</div>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto w-7 h-7 grid place-items-center rounded-full hover:bg-slate-100"
                aria-label="Закрыть"
              >
                <X className="w-4 h-4 text-ink-700" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Вид */}
              <div>
                <div className="text-[11px] uppercase tracking-wide text-ink-500 font-bold mb-1.5">
                  Вид
                </div>
                <div className="inline-flex bg-slate-100 rounded-full p-1">
                  <button
                    onClick={() => onViewChange('grid')}
                    className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-semibold ${
                      view === 'grid' ? 'bg-white shadow-card text-brand-700' : 'text-ink-500'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Плитка
                  </button>
                  <button
                    onClick={() => onViewChange('list')}
                    className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-semibold ${
                      view === 'list' ? 'bg-white shadow-card text-brand-700' : 'text-ink-500'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    Список
                  </button>
                </div>
              </div>

              {/* Категории */}
              <div>
                <div className="text-[11px] uppercase tracking-wide text-ink-500 font-bold mb-1.5">
                  Категории
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => onChange(null)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                      !value
                        ? 'bg-brand-600 text-white ring-brand-600'
                        : 'bg-white text-ink-700 ring-black/10 hover:bg-brand-50'
                    }`}
                  >
                    Все
                  </button>
                  {list.map((c) => (
                    <button
                      key={c}
                      onClick={() => onChange(c === value ? null : c)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                        value === c
                          ? 'bg-brand-600 text-white ring-brand-600'
                          : 'bg-white text-ink-700 ring-black/10 hover:bg-brand-50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-black/5 flex items-center gap-2">
              <button
                onClick={() => onChange(null)}
                className="text-sm font-semibold text-ink-500 hover:text-ink-800"
              >
                Сбросить
              </button>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2"
              >
                Применить
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
