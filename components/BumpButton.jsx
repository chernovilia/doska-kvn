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
      toast('Объявление поднято — оно снова наверху ленты, как новое');
    } catch (err) {
      if (err.nextBumpAt) setNextBumpAt(err.nextBumpAt);
      toast(err.message || 'Не удалось поднять', { kind: 'error' });
    } finally {
      setBusy(false);
    }
  }

  // Кнопки нет, пока подъём недоступен (через ranking.bump_cooldown_days после публикации
  // или прошлого подъёма, настраивается в админке) — только тихая подсказка когда.
  if (onCooldown) {
    return (
      <div
        className={`w-full inline-flex items-center justify-center gap-1.5 text-ink-500 ${
          compact ? 'py-1.5 text-[12px]' : 'py-2 text-[13px]'
        }`}
        suppressHydrationWarning
      >
        <ArrowUpCircle className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        Поднять можно через {timeLeft}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title="Бесплатно: объявление встанет наверх ленты, как новое"
      className={`w-full inline-flex items-center justify-center gap-1.5 btn-primary disabled:opacity-60 ${
        compact ? 'rounded-xl px-2 py-1.5 text-[12px]' : 'rounded-2xl px-4 py-3'
      }`}
    >
      <ArrowUpCircle className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      {busy ? 'Поднимаем…' : compact ? 'Поднять' : 'Поднять в ленте'}
    </button>
  );
}
