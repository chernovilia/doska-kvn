'use client';

import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SECTIONS, search as searchApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const HINTS = [
  'Грузоперевозки Газель',
  'Электрик Кулебаки',
  'Сдам 1-к квартиру Выкса',
  'Работа на ВМЗ',
  'Ремонт стиральных машин',
  'Детская коляска',
  'Резина R15',
  'Афиша Кулебаки'
];

export default function SearchBar({ onSelect }) {
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);

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
        kind: 'section', id: s.id, text: s.name, emoji: s.emoji
      }));
      const byAd = r.ads.map((a) => ({ kind: 'ad', id: a.id, text: a.title }));
      setSuggestions([...bySection, ...byAd].slice(0, 8));
    });
    return () => { cancelled = true; };
  }, [q]);

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-card ring-1 ring-black/5">
        <Search className="w-5 h-5 text-ink-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          placeholder="Найти в Кулебаках, Выксе, Навашино…"
          className="w-full bg-transparent outline-none text-ink-900 placeholder:text-ink-500 text-sm md:text-base"
        />
        {q && (
          <button
            onClick={() => setQ('')}
            className="text-xs font-medium text-ink-500 hover:text-ink-700"
          >
            Очистить
          </button>
        )}
      </div>

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
                    setQ(s.text);
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-brand-50 text-left"
              >
                <span className="text-lg leading-none">
                  {s.kind === 'section' ? s.emoji : s.kind === 'ad' ? '📌' : '🔎'}
                </span>
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
