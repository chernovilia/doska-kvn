'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Archive, RefreshCw, Rocket } from 'lucide-react';
import { archiveAd, renewAd } from '@/lib/api';
import { formatDayMonth } from '@/lib/format';
import { useToast } from './Toast';

/**
 * Действия автора со своим объявлением по его статусу:
 * опубликовано — «Продвинуть», «Продлить» (за несколько дней до архива), «В архив»;
 * в архиве — «Вернуть в ленту»; отклонено — когда удалим.
 * compact — под карточкой в профиле. onChanged() — перезагрузить данные после действия.
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

  function onArchive(e) {
    e.stopPropagation();
    if (!window.confirm(`Убрать «${ad.title}» в архив? Его не будет видно в ленте, вернуть можно в любой момент.`)) return;
    run('archive', archiveAd, 'Объявление в архиве');
  }

  const size = compact ? 'h-8 rounded-xl px-2 text-[12px]' : 'h-11 rounded-2xl px-4 text-sm';
  const icon = compact ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const hint = compact ? 'text-[11px]' : 'text-[12px]';

  if (ad.status === 'approved') {
    return (
      <div className={compact ? 'space-y-1' : 'space-y-2'}>
        <Link
          href={`/promote?ad=${ad.id}`}
          className={`w-full inline-flex items-center justify-center gap-1.5 font-bold bg-accent-500 hover:bg-accent-600 text-white ${size}`}
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
        <div className={`flex items-center justify-between gap-2 text-ink-500 ${hint}`}>
          {ad.expiresAt ? (
            <span
              className={`whitespace-nowrap ${ad.canRenew ? 'text-accent-700 font-semibold' : ''}`}
              title="Потом объявление уйдёт в архив"
              suppressHydrationWarning
            >
              {compact ? 'до' : 'В ленте до'} {formatDayMonth(ad.expiresAt)}
            </span>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onArchive}
            disabled={!!busy}
            className="inline-flex items-center gap-1 whitespace-nowrap font-semibold hover:text-ink-900 disabled:opacity-60"
          >
            <Archive className="w-3.5 h-3.5" />
            {compact ? 'В архив' : 'Продано — в архив'}
          </button>
        </div>
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
          className={`w-full inline-flex items-center justify-center gap-1.5 font-bold bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-60 ${size}`}
        >
          <RefreshCw className={`${icon} ${busy ? 'animate-spin' : ''}`} />
          Вернуть в ленту
        </button>
        {ad.deleteAt && (
          <div className={`text-center text-ink-500 ${hint}`} suppressHydrationWarning>
            Удалим {formatDayMonth(ad.deleteAt)}
          </div>
        )}
      </div>
    );
  }

  if (ad.status === 'rejected' && ad.deleteAt) {
    return (
      <div className={`text-center text-ink-500 ${hint} ${compact ? 'py-1' : ''}`} suppressHydrationWarning>
        Удалим {formatDayMonth(ad.deleteAt)}
      </div>
    );
  }
  return null;
}
