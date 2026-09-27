'use client';

import { FileText, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { search as searchApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const HINTS = [
  'Грузоперевозки Газель',
  'Электрик Кулебаки',
  'Сдам 1-к квартиру Выкса',
  'Вакансии Выкса',
  'Ремонт стиральных машин',
  'Детская коляска',
  'Резина R15',
  'Афиша Кулебаки'
];

/**
 * Поиск с подсказками.
 * value — текущий запрос из URL ленты; onSubmit(q) — искать в ленте (пустая строка = сбросить);
 * onSelect({ kind: 'ad' | 'section', id }) — переход из подсказки.
 */
export default function SearchBar({ value = '', onSubmit, onSelect }) {
  const [q, setQ] = useState(value);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  // Запрос сменился снаружи (назад в истории, сброс фильтров) — показываем его.
  useEffect(() => setQ(value), [value]);

  function submit(text) {
    const query = text.trim();
    setQ(query);
    onSubmit?.(query);
    inputRef.current?.blur();
  }

  const [suggestions, setSuggestions] = useState(() =>
    HINTS.slice(0, 6).map((h) => ({ kind: 'hint', text: h }))
  );

  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setSuggestions(HINTS.slice(0, 6).map((h) => ({ kind: 'hint', text: h })));
      return;
    }
    let cancelled = false;
    searchApi(query).then((r) => {
      if (cancelled) return;
      const bySection = r.sections.map((s) => ({
        kind: 'section', id: s.id, text: s.name, icon: s.icon, tile: s.tile
      }));
      const byAd = r.ads.map((a) => ({ kind: 'ad', id: a.id, text: a.title }));
      setSuggestions([...bySection, ...byAd].slice(0, 8));
    });
    return () => { cancelled = true; };
  }, [q]);

  return (
    <div className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(q);
        }}
        className="flex items-center gap-2 bg-white rounded-2xl pl-4 pr-2 py-2 shadow-card ring-1 ring-black/5"
      >
        <Search className="w-5 h-5 text-ink-500 shrink-0" />
        <input
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          placeholder="Найти в Кулебаках, Выксе, Навашино…"
          className="w-full min-w-0 py-1 bg-transparent outline-none text-ink-900 placeholder:text-ink-500 text-base [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button
            type="button"
            onClick={() => (value ? submit('') : setQ(''))}
            className="w-8 h-8 grid place-items-center rounded-full text-ink-500 hover:bg-slate-100 shrink-0"
            aria-label="Очистить"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className="h-9 px-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shrink-0"
        >
          Найти
        </button>
      </form>

      <AnimatePresence>
        {focused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl bg-white shadow-soft ring-1 ring-black/5 p-2"
          >
            {suggestions.map((s, i) => (
              <button
                key={s.kind + i}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (s.kind === 'ad') {
                    onSelect?.({ kind: 'ad', id: s.id });
                  } else if (s.kind === 'section') {
                    onSelect?.({ kind: 'section', id: s.id });
                  } else {
                    submit(s.text);
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-brand-50 text-left"
              >
                <SuggestionIcon s={s} />
                <span className="text-sm text-ink-900">{s.text}</span>
                <span className="ml-auto text-[11px] uppercase tracking-wide text-ink-500">
                  {s.kind === 'ad' ? 'объявление' : s.kind === 'section' ? 'раздел' : 'подсказка'}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SuggestionIcon({ s }) {
  if (s.kind === 'section') {
    const Icon = s.icon;
    return (
      <span className={`grid place-items-center w-7 h-7 rounded-lg shrink-0 ${s.tile}`}>
        <Icon className="w-4 h-4" />
      </span>
    );
  }
  const Icon = s.kind === 'ad' ? FileText : Search;
  return (
    <span className="grid place-items-center w-7 h-7 rounded-lg shrink-0 bg-slate-100 text-ink-500">
      <Icon className="w-4 h-4" />
    </span>
  );
}
