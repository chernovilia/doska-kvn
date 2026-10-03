'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Полоса-уведомление о cookie и Яндекс.Метрике. Показывается, только когда Метрика включена в админке,
// и до нажатия «Понятно» на этом устройстве. На экране сообщений не показываем — там внизу поле ввода.
const KEY = 'cookie.noticeOk';

export default function CookieNotice({ enabled }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    try {
      setShow(localStorage.getItem(KEY) !== '1');
    } catch {
      setShow(true);
    }
  }, [enabled]);

  if (!show || pathname?.startsWith('/messages')) return null;

  function ok() {
    try {
      localStorage.setItem(KEY, '1');
    } catch {}
    setShow(false);
  }

  return (
    <div className="fixed z-[44] left-3 right-3 bottom-[84px] md:bottom-4 md:left-auto md:right-4 md:max-w-sm rounded-2xl bg-white ring-1 ring-black/10 shadow-card p-3 flex items-center gap-3">
      <p className="flex-1 min-w-0 text-[12.5px] leading-snug text-ink-700">
        Мы используем cookie и Яндекс.Метрику, чтобы сайт работал и становился удобнее.{' '}
        <Link href="/privacy" className="text-accent-700 underline">
          Подробнее
        </Link>
      </p>
      <button onClick={ok} className="btn-primary h-9 px-3 rounded-xl text-[13px] shrink-0">
        Понятно
      </button>
    </div>
  );
}
