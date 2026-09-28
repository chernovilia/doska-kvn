'use client';

import { useEffect, useState } from 'react';
import { getNotificationsUnread } from '@/lib/api';

// Счётчик непрочитанных уведомлений — один опрос на вкладку, как у сообщений (lib/chats.js).
let count = 0;
let timer = null;
const listeners = new Set();

async function poll(force = false) {
  if (!force && document.hidden) return;
  try {
    const res = await getNotificationsUnread();
    if (res.count !== count) {
      count = res.count;
      listeners.forEach((l) => l(count));
    }
  } catch {
    // Следующий опрос попробует снова.
  }
}

export function refreshNotifications() {
  poll(true);
}

function onVisible() {
  if (!document.hidden) poll();
}

export function useNotificationsUnread(enabled) {
  const [n, setN] = useState(count);

  useEffect(() => {
    if (!enabled) return;
    listeners.add(setN);
    setN(count);
    if (!timer) {
      poll(true);
      timer = setInterval(poll, 60_000);
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
