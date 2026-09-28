'use client';

import { useEffect, useState } from 'react';
import Modal from './Modal';
import { reportAd } from '@/lib/api';

const REASONS = [
  ['scam', 'Мошенничество', 'Просят предоплату, подозрительная ссылка'],
  ['illegal', 'Запрещённый товар или услуга', ''],
  ['spam', 'Спам или реклама', ''],
  ['wrong-category', 'Не та категория', ''],
  ['sold', 'Уже продано', 'Объявление неактуально'],
  ['other', 'Другое', '']
];

// Жалоба на объявление — уходит в очередь «Жалобы» в админке.
export default function ReportModal({ open, onClose, adId, onDone }) {
  const [reason, setReason] = useState(null);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setReason(null);
      setComment('');
      setError(null);
    }
  }, [open]);

  async function submit(e) {
    e.preventDefault();
    if (!reason) return;
    setSending(true);
    setError(null);
    try {
      await reportAd(adId, reason, comment.trim());
      onDone?.();
    } catch (err) {
      setError(err.message || 'Не удалось отправить жалобу');
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <form onSubmit={submit} className="p-5 md:p-6">
        <h3 className="text-xl font-extrabold text-ink-900 pr-10">Пожаловаться</h3>
        <p className="mt-1 text-sm text-ink-500">Модератор проверит объявление. Автор не узнает, кто пожаловался.</p>
        <div className="mt-4 space-y-1.5">
          {REASONS.map(([id, label, hint]) => (
            <button
              key={id}
              type="button"
              onClick={() => setReason(id)}
              className={`w-full text-left rounded-2xl px-4 py-2.5 border-[1.5px] transition-colors ${
                reason === id ? 'bg-accent-50 border-accent-400' : 'bg-slate-50 border-transparent hover:bg-slate-100'
              }`}
            >
              <span className="block text-[15px] font-semibold text-ink-900">{label}</span>
              {hint && <span className="block text-[12px] text-ink-500">{hint}</span>}
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          rows={2}
          placeholder="Подробности — по желанию"
          className="mt-3 w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-base resize-none"
        />
        {error && <div className="mt-2 text-[13px] text-rose-700">{error}</div>}
        <button
          type="submit"
          disabled={!reason || sending}
          className="mt-3 w-full rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white px-4 py-3 font-semibold"
        >
          {sending ? 'Отправляем…' : 'Отправить жалобу'}
        </button>
      </form>
    </Modal>
  );
}
