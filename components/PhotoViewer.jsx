'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useScrollLock } from '@/lib/scrollLock';

/**
 * Фото объявления во весь экран. Открывается по нажатию на фото в галерее.
 * Телефон: листается пальцем, увеличивается щипком; «Назад» закрывает просмотр, а не страницу.
 * Компьютер: стрелки на экране и на клавиатуре, Esc или клик мимо фото — закрыть.
 */
export default function PhotoViewer({ photos, start = 0, title, onClose }) {
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(start);
  useScrollLock(true);

  // Открываемся сразу на том фото, на которое нажали
  useEffect(() => {
    const el = trackRef.current;
    if (el) el.scrollLeft = start * el.clientWidth;
  }, [start]);

  // «Назад» (кнопка телефона, жест) закрывает просмотр: кладём в историю свою запись
  const closedByBack = useRef(false);
  useEffect(() => {
    window.history.pushState({ ...window.history.state, photoViewer: true }, '');
    const onPop = () => {
      closedByBack.current = true;
      onClose();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      // Закрыли крестиком или Esc — убираем свою запись из истории
      if (!closedByBack.current && window.history.state?.photoViewer) window.history.back();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function go(i) {
    const el = trackRef.current;
    if (!el) return;
    const n = Math.max(0, Math.min(photos.length - 1, i));
    el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' });
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') go(idx - 1);
      else if (e.key === 'ArrowRight') go(idx + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, onClose]);

  return (
    <div className="fixed inset-0 z-[60] bg-black" role="dialog" aria-modal="true" aria-label="Просмотр фото">
      <div
        ref={trackRef}
        onScroll={(e) => setIdx(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
        style={{ touchAction: 'pan-x pinch-zoom' }}
      >
        {photos.map((src, i) => (
          // Клик по тёмному полю вокруг фото закрывает просмотр, по самому фото — нет
          <div key={src + i} onClick={onClose} className="w-full h-full shrink-0 snap-center grid place-items-center">
            <img
              src={src}
              alt={i === 0 ? title : ''}
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full object-contain select-none"
              draggable={false}
            />
          </div>
        ))}
      </div>

      <button
        onClick={onClose}
        aria-label="Закрыть"
        className="absolute top-3 right-3 w-11 h-11 grid place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
        style={{ marginTop: 'env(safe-area-inset-top)' }}
      >
        <X className="w-6 h-6" />
      </button>

      {photos.length > 1 && (
        <>
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/15 text-white text-[13px] font-semibold px-3 py-1 rounded-full tabular-nums"
            style={{ marginTop: 'env(safe-area-inset-top)' }}
          >
            {idx + 1} / {photos.length}
          </div>
          <button
            onClick={() => go(idx - 1)}
            disabled={idx === 0}
            aria-label="Предыдущее фото"
            className="hidden md:grid absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 disabled:opacity-30"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => go(idx + 1)}
            disabled={idx === photos.length - 1}
            aria-label="Следующее фото"
            className="hidden md:grid absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 disabled:opacity-30"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
}
