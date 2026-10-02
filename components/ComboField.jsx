'use client';

import { useState } from 'react';
import { searchOptions } from '@/data/brands';

// Поле с выбором из длинного списка (марка, модель, порода): печатаете — список сужается.
// Чего нет в списке, можно оставить как ввели. Список раскрывается под полем в потоке страницы,
// а не поверх — внутри прокручиваемого окна так его не обрезает.
const SHOWN = 40;

export default function ComboField({ value, onChange, options, placeholder, inputClass = '', invalid = false, ariaLabel, inputMode }) {
  const [open, setOpen] = useState(false);
  const list = options || [];
  const typed = String(value ?? '');
  // Пока значение совпадает с вариантом целиком — показываем весь список (человек только открыл поле)
  const exact = list.some((o) => o.toLowerCase() === typed.trim().toLowerCase());
  const found = exact ? list : searchOptions(list, typed);
  const shown = found.slice(0, SHOWN);

  return (
    <div>
      <input
        value={typed}
        onChange={(e) => {
          onChange(e.target.value.slice(0, 100));
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        // Тап по варианту срабатывает раньше, чем поле теряет фокус (onMouseDown ниже)
        onBlur={() => setOpen(false)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        inputMode={inputMode}
        autoComplete="off"
        role="combobox"
        aria-expanded={open && shown.length > 0}
        className={`${inputClass} ${invalid ? 'ring-rose-300' : ''}`}
      />
      {open && list.length > 0 && (
        <div className="mt-1.5 rounded-2xl ring-1 ring-black/10 bg-white max-h-56 overflow-y-auto overscroll-contain" role="listbox">
          {shown.length === 0 ? (
            <div className="px-4 py-2.5 text-[13px] text-ink-500">Нет в списке — оставим, как вы написали.</div>
          ) : (
            shown.map((o) => (
              <button
                key={o}
                type="button"
                role="option"
                aria-selected={o === typed}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className={`block w-full text-left px-4 py-2.5 text-[15px] border-b border-black/5 last:border-b-0 hover:bg-accent-50 ${
                  o === typed ? 'font-bold text-accent-700' : 'text-ink-900'
                }`}
              >
                {o}
              </button>
            ))
          )}
          {found.length > SHOWN && (
            <div className="px-4 py-2 text-[12px] text-ink-500">Показаны первые {SHOWN} — начните вводить название.</div>
          )}
        </div>
      )}
    </div>
  );
}
