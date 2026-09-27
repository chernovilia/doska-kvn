'use client';

import { useEffect, useState } from 'react';
import { getUnreadCount } from '@/lib/api';

// Шапка и нижнее меню показывают один и тот же счётчик — держим один таймер на страницу.
let count = 0;
let timer = null;
const listeners = new Set();

async function poll(force = false) {
  if (!force && document.hidden) return;
  try {
    const res = await getUnreadCount();
    if (res.count !== count) {
      count = res.count;
      listeners.forEach((l) => l(count));
    }
  } catch {
    // Сеть моргнула — покажем старое значение, следующий опрос обновит.
  }
}

export function refreshUnread() {
  poll(true);
}

function onVisible() {
  if (!document.hidden) poll();
}

export function useUnreadCount(enabled) {
  const [n, setN] = useState(count);

  useEffect(() => {
    if (!enabled) return;
    listeners.add(setN);
    setN(count);
    if (!timer) {
      poll(true);
      timer = setInterval(poll, 30_000);
      document.addEventListener('visibilitychange', onVisible);
    }
    return () => {
      listeners.delete(setN);
      if (!listeners.size) {
        clearInterval(timer);
        timer = null;
        document.removeEventListener('visibilitychange', onVisible);
      }
    };
  }, [enabled]);

  return enabled ? n : 0;
}
