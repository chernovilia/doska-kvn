'use client';

import { forwardRef, useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import { FEED_SECTIONS, FREE_SECTION, getCategoryGroups } from '@/lib/api';

/**
 * Разделы под шапкой: плитки с иконками, первая — «Ещё» (каталог).
 * Когда раздел выбран, ниже появляется лента его подгрупп.
 * value — id раздела или null (повторный тап снимает выбор); group — подгруппа или null.
 */
export default function CategoryStrip({ value, group, onChange, onGroupChange, onMore }) {
  const scrollerRef = useRef(null);
  const activeRef = useRef(null);
  const groups = value && value !== FREE_SECTION.id ? getCategoryGroups(value) : [];

  // Выбранный раздел, пришедший из URL, должен быть виден без ручной прокрутки.
  // Двигаем только горизонтальный скролл ленты: scrollIntoView дёрнул бы и страницу.
  useEffect(() => {
    const box = scrollerRef.current;
    const el = activeRef.current;
    if (!box || !el) return;
    box.scrollLeft = el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2;
  }, [value]);

  return (
    <div>
      <div className="bg-white border-y border-slate-100">
        <div
          ref={scrollerRef}
          className="relative max-w-6xl mx-auto overflow-x-auto no-scrollbar"
        >
          <div className="flex md:justify-between gap-0.5 px-2.5 md:px-4 py-2 w-max md:w-auto">
            <Tile label="Ещё" tile="bg-slate-100 text-ink-700" icon={Menu} onClick={onMore} />
            {FEED_SECTIONS.map((s) => {
              const active = value === s.id;
              return (
                <Tile
                  key={s.id}
                  ref={active ? activeRef : null}
                  label={s.short || s.name}
                  title={s.name}
                  tile={s.tile}
                  icon={s.icon}
                  active={active}
                  onClick={() => onChange(active ? null : s.id)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {groups.length > 0 && (
        <div className="bg-slate-50 border-b border-slate-100">
          <div className="max-w-6xl mx-auto overflow-x-auto no-scrollbar">
            <div className="flex gap-2 px-4 md:px-6 py-2.5 w-max">
              <button
                onClick={() => onGroupChange(null)}
                className={`chip chip-sm ${!group ? 'chip-on' : ''}`}
                aria-pressed={!group}
              >
                Все
              </button>
              {groups.map((g) => (
                <button
                  key={g.name}
                  onClick={() => onGroupChange(group === g.name ? null : g.name)}
                  className={`chip chip-sm ${group === g.name ? 'chip-on' : ''}`}
                  aria-pressed={group === g.name}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ref нужен выбранной плитке — по нему лента докручивается до неё.
const Tile = forwardRef(function Tile({ label, title, tile, icon: Icon, active, onClick }, ref) {
  return (
    <button
      ref={ref}
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`shrink-0 w-[66px] md:w-[76px] flex flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors ${
        active ? 'bg-brand-50' : 'hover:bg-slate-50'
      }`}
    >
      <span
        className={`grid place-items-center w-[52px] h-[52px] rounded-2xl ${tile} ${
          active ? 'ring-2 ring-inset ring-brand-500' : ''
        }`}
      >
        <Icon className="w-6 h-6" strokeWidth={1.8} />
      </span>
      <span
        className={`text-[12px] leading-tight whitespace-nowrap ${
          active ? 'font-bold text-brand-700' : 'font-medium text-ink-700'
        }`}
      >
        {label}
      </span>
    </button>
  );
});
