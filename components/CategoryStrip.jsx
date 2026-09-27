'use client';

import { useEffect, useRef } from 'react';
import { FEED_SECTIONS } from '@/lib/api';

/**
 * Лента разделов плитками с иконками под поиском.
 * value — id выбранного раздела или null; повторный тап снимает выбор.
 */
export default function CategoryStrip({ value, onChange }) {
  const scrollerRef = useRef(null);
  const activeRef = useRef(null);

  // Выбранный раздел, пришедший из URL, должен быть виден без ручной прокрутки.
  // Двигаем только горизонтальный скролл ленты: scrollIntoView дёрнул бы и страницу.
  useEffect(() => {
    const box = scrollerRef.current;
    const el = activeRef.current;
    if (!box || !el) return;
    box.scrollLeft = el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2;
  }, [value]);

  return (
    <div ref={scrollerRef} className="relative -mx-4 md:mx-0 overflow-x-auto no-scrollbar">
      <div className="flex gap-1 md:gap-2 px-4 md:px-0 md:grid md:grid-cols-12">
        {FEED_SECTIONS.map((s) => {
          const Icon = s.icon;
          const active = value === s.id;
          return (
            <button
              key={s.id}
              ref={active ? activeRef : null}
              onClick={() => onChange(active ? null : s.id)}
              aria-pressed={active}
              className="group shrink-0 w-[72px] md:w-auto flex flex-col items-center gap-1.5 rounded-2xl pt-1 pb-1.5"
            >
              <span
                className={`grid place-items-center w-14 h-14 rounded-2xl transition ${s.tile} ${
                  active ? 'ring-2 ring-brand-600 ring-offset-2 ring-offset-transparent' : 'group-hover:scale-105'
                }`}
              >
                <Icon className="w-6 h-6" strokeWidth={2} />
              </span>
              <span
                className={`text-[11px] leading-tight text-center line-clamp-2 min-h-[2.5em] ${
                  active ? 'font-bold text-brand-700' : 'font-semibold text-ink-800'
                }`}
              >
                {s.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
