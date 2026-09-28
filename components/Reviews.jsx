'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Star } from 'lucide-react';
import Modal from './Modal';
import { createReview } from '@/lib/api';
import { formatRelative, pluralRu } from '@/lib/format';

export function Stars({ value, size = 'w-4 h-4' }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Оценка ${value} из 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} ${i < Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
        />
      ))}
    </span>
  );
}

// Итог: «4.7 ★★★★★ · 12 отзывов».
export function RatingSummary({ rating, count }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-3xl font-black text-ink-900">{count ? rating.toFixed(1) : '—'}</div>
      <div>
        <Stars value={count ? rating : 0} />
        <div className="text-[13px] text-ink-500 mt-0.5">
          {count ? `${count} ${pluralRu(count, ['отзыв', 'отзыва', 'отзывов'])}` : 'Пока нет отзывов'}
        </div>
      </div>
    </div>
  );
}

export function ReviewsList({ reviews, empty = 'Пока нет отзывов.' }) {
  if (!reviews.length) {
    return <div className="rounded-2xl bg-white ring-1 ring-black/5 p-6 text-center text-sm text-ink-500">{empty}</div>;
  }
  return (
    <ul className="space-y-2">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4">
          <div className="flex items-center gap-2.5">
            <Link href={`/user/${r.author.id}`} className="shrink-0">
              {r.author.avatar ? (
                <img src={r.author.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <span className="w-9 h-9 rounded-full bg-brand-600 text-white grid place-items-center text-sm font-bold">
                  {r.author.name?.[0]?.toUpperCase() || '?'}
                </span>
              )}
            </Link>
            <div className="min-w-0">
              <Link href={`/user/${r.author.id}`} className="block text-sm font-semibold text-ink-900 truncate hover:text-brand-700">
                {r.author.name || 'Пользователь'}
              </Link>
              <Stars value={r.rating} size="w-3.5 h-3.5" />
            </div>
            <div className="ml-auto text-[12px] text-ink-500 whitespace-nowrap" suppressHydrationWarning>
              {formatRelative(r.createdAt)}
            </div>
          </div>
          {r.text && <p className="mt-2 text-[15px] text-ink-800 leading-relaxed whitespace-pre-line break-words">{r.text}</p>}
          <div className="mt-1.5 text-[12px] text-ink-500">По объявлению «{r.adTitle}»</div>
        </li>
      ))}
    </ul>
  );
}

const LABELS = ['', 'Плохо', 'Так себе', 'Нормально', 'Хорошо', 'Отлично'];

// Форма отзыва по переписке: звёзды обязательны, текст — по желанию.
export function ReviewModal({ open, onClose, conversationId, targetName, onDone }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!rating) return;
    setSending(true);
    setError(null);
    try {
      const review = await createReview({ conversationId, rating, text: text.trim() });
      onDone?.(review);
    } catch (err) {
      setError(err.message || 'Не удалось отправить отзыв');
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <form onSubmit={submit} className="p-5 md:p-6">
        {/* Имя не склоняем («Отзыв о Тест») — поэтому оно отдельной строкой */}
        <h3 className="text-xl font-extrabold text-ink-900 pr-10">Оцените собеседника</h3>
        <p className="mt-1 text-sm text-ink-500">
          <b className="text-ink-800">{targetName || 'Пользователь'}</b> — отзыв увидят все на его странице.
        </p>

        <div className="mt-4 flex items-center gap-1" role="radiogroup" aria-label="Оценка">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} из 5`}
              onClick={() => setRating(n)}
              className="p-1"
            >
              <Star className={`w-9 h-9 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-300'}`} />
            </button>
          ))}
          <span className="ml-2 text-sm font-semibold text-ink-700">{LABELS[rating]}</span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 1000))}
          rows={4}
          placeholder="Как прошла сделка? Что понравилось или нет"
          className="mt-4 w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-base resize-none"
        />
        {error && <div className="mt-2 text-[13px] text-rose-700">{error}</div>}

        <button
          type="submit"
          disabled={!rating || sending}
          className="mt-4 w-full rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white px-4 py-3 font-semibold"
        >
          {sending ? 'Отправляем…' : 'Отправить отзыв'}
        </button>
      </form>
    </Modal>
  );
}
