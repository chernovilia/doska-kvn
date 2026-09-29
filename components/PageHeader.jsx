'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

/**
 * Закреплённая шапка внутренних страниц: «назад», заголовок, действия справа.
 * Одна на все страницы, чтобы шапки не прокручивались и выглядели одинаково.
 * backHref — куда вести, если истории нет (открыли по ссылке); иначе router.back().
 */
export default function PageHeader({ title, right, backHref = '/', maxWidth = 'max-w-5xl' }) {
  const router = useRouter();

  function onBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push(backHref);
  }

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-slate-100">
      <div className={`${maxWidth} mx-auto px-2 md:px-6 h-14 flex items-center gap-1`}>
        <button
          onClick={onBack}
          aria-label="Назад"
          className="w-10 h-10 grid place-items-center rounded-full text-ink-800 hover:bg-slate-100 shrink-0"
        >
          <ArrowLeft className="w-[22px] h-[22px]" />
        </button>
        <h1 className="font-extrabold text-lg text-ink-900 truncate">{title}</h1>
        {right && <div className="ml-auto flex items-center gap-1 shrink-0">{right}</div>}
      </div>
    </div>
  );
}

// Кнопка-иконка для правой части шапки.
export function HeaderIconButton({ label, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="w-10 h-10 grid place-items-center rounded-full text-ink-800 hover:bg-slate-100"
    >
      {children}
    </button>
  );
}
