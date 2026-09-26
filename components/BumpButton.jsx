'use client';

import { useEffect, useState } from 'react';
import { ArrowUpCircle } from 'lucide-react';
import { bumpAd } from '@/lib/api';
import { formatTimeLeft } from '@/lib/format';
import { useToast } from './Toast';

// compact — маленькая кнопка под карточкой в «Моих объявлениях».
export default function BumpButton({ ad, compact = false }) {
  const { toast } = useToast();
  const [nextBumpAt, setNextBumpAt] = useState(ad.nextBumpAt || null);
  const [busy, setBusy] = useState(false);
  const [, tick] = useState(0);

  // Раз в минуту перерисовываем, чтобы «осталось N» не застывало.
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  if (ad.status !== 'approved') return null;

  const timeLeft = nextBumpAt ? formatTimeLeft(nextBumpAt) : '';
  const onCooldown = !!timeLeft;

  async function onClick(e) {
    e.stopPropagation();
    setBusy(true);
    try {
      const res = await bumpAd(ad.id);
      setNextBumpAt(res.nextBumpAt);
      toast('Объявление поднято — сутки будет выше в ленте');
    } catch (err) {
      if (err.nextBumpAt) setNextBumpAt(err.nextBumpAt);
      toast(err.message || 'Не удалось поднять', { kind: 'error' });
    } finally {
      setBusy(false);
    }
  }

  const label = busy
    ? 'Поднимаем…'
    : onCooldown
    ? `Снова через ${timeLeft}`
    : compact
    ? 'Поднять'
    : 'Поднять в ленте';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || onCooldown}
      title={onCooldown ? 'Бесплатный подъём снова доступен после паузы' : 'Бесплатно'}
      className={`w-full inline-flex items-center justify-center gap-1.5 font-semibold disabled:cursor-not-allowed ${
        compact ? 'rounded-xl px-2 py-1.5 text-[12px]' : 'rounded-2xl px-4 py-3'
      } ${
        onCooldown
          ? 'bg-slate-100 text-ink-500'
          : 'bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-60'
      }`}
    >
      <ArrowUpCircle className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      {label}
    </button>
  );
}
