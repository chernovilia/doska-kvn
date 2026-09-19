'use client';

import { SECTIONS } from '@/lib/api';
import { motion } from 'framer-motion';

// 3 колонки на мобильном → 2 ряда (3+2), 5 колонок на десктопе.
// Компактные плашки: эмодзи слева, название и счётчик — справа.
export default function SectionTabs({ value, onChange, counts }) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
      {SECTIONS.map((s) => {
        const active = value === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={`relative text-left rounded-xl px-2 py-2 md:px-2.5 md:py-2.5 ring-1 transition ${
              active
                ? 'bg-white ring-brand-300 shadow-soft'
                : 'bg-white/85 hover:bg-white ring-black/5 shadow-card'
            }`}
          >
            {active && (
              <motion.span
                layoutId="tab-underline"
                className="absolute left-2 right-2 -bottom-[3px] h-[3px] rounded-full bg-brand-600"
              />
            )}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base leading-none shrink-0">{s.emoji}</span>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="text-[12px] md:text-[13px] font-semibold text-ink-900 truncate">
                  {s.name}
                </div>
                <div className="text-[10px] text-ink-500 mt-0.5 truncate">
                  {counts?.[s.id] ?? 0} объявлений
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
