'use client';

import { useState } from 'react';

export const AD_STATUS = {
  approved: ['Опубликовано', 'bg-emerald-100 text-emerald-800'],
  pending: ['На модерации', 'bg-amber-100 text-amber-800'],
  rejected: ['Отклонено', 'bg-rose-100 text-rose-800'],
  hidden: ['Скрыто', 'bg-rose-100 text-rose-800'],
  expired: ['Истёк срок', 'bg-slate-100 text-slate-700'],
  archived: ['В архиве', 'bg-slate-100 text-slate-700']
};

export function StatusBadge({ status }) {
  const [label, cls] = AD_STATUS[status] || [status, 'bg-slate-100 text-slate-700'];
  return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}>{label}</span>;
}

export const REPORT_REASONS = {
  scam: 'Мошенничество',
  spam: 'Спам или реклама',
  illegal: 'Запрещённый товар',
  'wrong-category': 'Не та категория',
  sold: 'Уже продано',
  other: 'Другое'
};

// Причины отклонения / удаления — быстрые варианты, чтобы не печатать одно и то же.
export const MODERATION_REASONS = [
  'Нет фото товара',
  'Не та категория',
  'Запрещённый товар',
  'Подозрение на мошенничество',
  'Дубликат объявления',
  'Нет цены или описания'
];

/**
 * Встроенная форма причины: плашки-шаблоны + своё. onConfirm(reason) — reason может быть пустым.
 * tone — цвет кнопки подтверждения.
 */
export function ReasonForm({ title, confirmLabel, tone = 'rose', busy, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  const btn =
    tone === 'amber'
      ? 'bg-amber-500 hover:bg-amber-600'
      : 'bg-rose-600 hover:bg-rose-700';
  return (
    <div className="rounded-2xl bg-slate-50 ring-1 ring-black/5 p-3 space-y-2">
      <div className="text-sm font-bold text-ink-900">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {MODERATION_REASONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setReason(r)}
            className={`chip chip-sm ${reason === r ? 'chip-on' : ''}`}
          >
            {r}
          </button>
        ))}
      </div>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value.slice(0, 500))}
        rows={2}
        placeholder="Причина — её увидит автор"
        className="w-full rounded-xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-3 py-2 text-sm resize-none"
      />
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="btn-outline h-9 px-3 text-sm rounded-xl">
          Отмена
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onConfirm(reason.trim())}
          className={`flex-1 h-9 rounded-xl text-white text-sm font-semibold disabled:opacity-50 ${btn}`}
        >
          {busy ? 'Секунду…' : confirmLabel}
        </button>
      </div>
    </div>
  );
}

// Маленький спиннер-заглушка для списков.
export function ListSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-20 rounded-2xl bg-white ring-1 ring-black/5 animate-pulse" />
      ))}
    </div>
  );
}

export function Empty({ children }) {
  return <div className="rounded-2xl bg-white ring-1 ring-black/5 p-8 text-center text-sm text-ink-500">{children}</div>;
}

export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-xl bg-rose-50 ring-1 ring-rose-200 px-3 py-2 text-[13px] text-rose-800">{message}</div>
  );
}
