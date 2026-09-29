'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Archive, RefreshCw, Rocket } from 'lucide-react';
import { archiveAd, renewAd } from '@/lib/api';
import { formatDayMonth } from '@/lib/format';
import { useToast } from './Toast';

/**
 * Главное действие автора со своим объявлением по статусу:
 * опубликовано — «Продвинуть» и «Продлить» (за несколько дней до архива); в архиве — «Вернуть в ленту».
 * compact — под карточкой в профиле: только кнопки, без подписей. Полный вид (страница объявления)
 * добавляет сроки: до какого числа показывается, когда удалим.
 * onChanged() — перезагрузить данные после действия.
 */
export default function OwnerAdActions({ ad, compact = false, onChanged }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(null);

  async function run(kind, fn, okText) {
    setBusy(kind);
    try {
      await fn(ad.id);
      toast(okText);
      onChanged?.();
    } catch (err) {
      toast(err.message || 'Не получилось', { kind: 'error' });
    } finally {
      setBusy(null);
    }
  }

  const size = compact ? 'h-8 rounded-xl px-2 text-[12px]' : 'h-11 rounded-2xl px-4 text-sm';
  const icon = compact ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const hint = compact ? 'text-[11px]' : 'text-[12px]';

  if (ad.status === 'approved') {
    return (
      <div className={compact ? 'space-y-1' : 'space-y-2'}>
        <Link
          href={`/promote?ad=${ad.id}`}
          className={`w-full inline-flex items-center justify-center gap-1.5 font-bold btn-primary ${size}`}
        >
          <Rocket className={icon} />
          Продвинуть
        </Link>
        {ad.canRenew && (
          <button
            type="button"
            onClick={() => run('renew', renewAd, 'Показ продлён')}
            disabled={!!busy}
            className={`w-full btn-outline ${size} disabled:opacity-60`}
          >
            <RefreshCw className={`${icon} ${busy === 'renew' ? 'animate-spin' : ''}`} />
            Продлить показ
          </button>
        )}
        {!compact && ad.expiresAt && (
          <div
            className={`text-center ${hint} ${ad.canRenew ? 'text-accent-700 font-semibold' : 'text-ink-500'}`}
            suppressHydrationWarning
          >
            Показывается до {formatDayMonth(ad.expiresAt)}, потом — в архив
          </div>
        )}
      </div>
    );
  }

  if (ad.status === 'archived') {
    return (
      <div className={compact ? 'space-y-1' : 'space-y-2'}>
        <button
          type="button"
          onClick={() => run('renew', renewAd, 'Объявление снова в ленте')}
          disabled={!!busy}
          className={`w-full inline-flex items-center justify-center gap-1.5 font-bold btn-primary disabled:opacity-60 ${size}`}
        >
          <RefreshCw className={`${icon} ${busy ? 'animate-spin' : ''}`} />
          Вернуть в ленту
        </button>
        {!compact && ad.deleteAt && (
          <div className={`text-center text-ink-500 ${hint}`} suppressHydrationWarning>
            Удалим {formatDayMonth(ad.deleteAt)}
          </div>
        )}
      </div>
    );
  }

  if (!compact && ad.status === 'rejected' && ad.deleteAt) {
    return (
      <div className={`text-center text-ink-500 ${hint}`} suppressHydrationWarning>
        Удалим {formatDayMonth(ad.deleteAt)}
      </div>
    );
  }
  return null;
}

// «Продано»: убрать опубликованное в архив. На странице объявления — под «Удалить».
export function SoldButton({ ad, onChanged }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  if (ad.status !== 'approved') return null;

  async function onClick() {
    if (!window.confirm(`Отметить «${ad.title}» проданным? Объявление уйдёт в архив, вернуть можно в любой момент.`)) return;
    setBusy(true);
    try {
      await archiveAd(ad.id);
      toast('Объявление в архиве');
      onChanged?.();
    } catch (err) {
      toast(err.message || 'Не получилось', { kind: 'error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="w-full btn-outline h-11 rounded-2xl px-4 text-sm disabled:opacity-60"
    >
      <Archive className="w-4 h-4" />
      {busy ? 'Секунду…' : 'Продано — убрать в архив'}
    </button>
  );
}
