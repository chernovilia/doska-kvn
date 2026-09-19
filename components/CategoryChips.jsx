'use client';

import { CHIPS } from '@/data/mock';

export default function CategoryChips({ section, value, onChange }) {
  const list = CHIPS[section] || [];
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      <button
        onClick={() => onChange(null)}
        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
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
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
            value === c
              ? 'bg-brand-600 text-white ring-brand-600'
              : 'bg-white text-ink-700 ring-black/10 hover:bg-brand-50'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
