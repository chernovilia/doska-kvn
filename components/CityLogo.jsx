'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { CITIES } from '@/data/mock';

// Логотип с интегрированным выбором города после слэша.
// "доска/<город>" — где <город> кликабелен и имеет тот же цвет, что и "доска".
// Опция "квн" = «все города» (доска/квн).
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

  const active = CITIES.find((c) => c.id === value) || CITIES[0];
  const label = value === 'all' ? 'КВН' : active.name;

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
            className="absolute left-0 mt-2 min-w-[220px] rounded-2xl bg-white shadow-soft ring-1 ring-black/5 p-1 z-50"
            role="menu"
          >
            {CITIES.map((c) => {
              const isActive = c.id === value;
              const isAll = c.id === 'all';
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    onChange(c.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-brand-50 ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-800'
                  }`}
                  role="menuitem"
                >
                  <span className={isAll ? 'text-accent-600 font-black' : ''}>
                    {isAll ? 'КВН' : c.name}
                  </span>
                  <span className="text-[11px] font-medium text-ink-500 ml-1">
                    {isAll ? '· все города' : ''}
                  </span>
                  {isActive && <Check className="w-4 h-4 ml-auto text-brand-600" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
