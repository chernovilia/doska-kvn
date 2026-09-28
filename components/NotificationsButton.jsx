'use client';

import { Bell, CheckCircle2, Clock, EyeOff, LifeBuoy, Star, Trash2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/api';
import { refreshNotifications, useNotificationsUnread } from '@/lib/notifications';
import { formatRelative } from '@/lib/format';

const ICONS = {
  ad_approved: [CheckCircle2, 'text-emerald-600 bg-emerald-50'],
  ad_rejected: [XCircle, 'text-rose-600 bg-rose-50'],
  ad_hidden: [EyeOff, 'text-rose-600 bg-rose-50'],
  ad_removed: [Trash2, 'text-rose-600 bg-rose-50'],
  ad_pending: [Clock, 'text-amber-600 bg-amber-50'],
  review_new: [Star, 'text-amber-600 bg-amber-50'],
  support_new: [LifeBuoy, 'text-accent-600 bg-accent-50'],
  support_reply: [LifeBuoy, 'text-accent-600 bg-accent-50']
};

// Колокольчик: счётчик непрочитанных опрашивается раз в минуту, список — при открытии.
export default function NotificationsButton() {
  const router = useRouter();
  const unread = useNotificationsUnread(true);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    getNotifications()
      .then(setItems)
      .catch(() => setItems([]));
  }, [open, unread]);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  async function onItem(n) {
    setOpen(false);
    if (!n.readAt) {
      setItems((prev) => prev?.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
      markNotificationRead(n.id).then(refreshNotifications).catch(() => {});
    }
    if (n.link) router.push(n.link);
  }

  async function onReadAll() {
    setItems((prev) => prev?.map((x) => ({ ...x, readAt: x.readAt || new Date().toISOString() })));
    await markAllNotificationsRead().catch(() => {});
    refreshNotifications();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 grid place-items-center rounded-full hover:bg-slate-100"
        aria-label={unread ? `Уведомления, непрочитанных: ${unread}` : 'Уведомления'}
      >
        <Bell className="w-[22px] h-[22px] text-ink-700" strokeWidth={1.8} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-accent-500 text-white text-[10px] font-bold ring-2 ring-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl bg-white shadow-soft ring-1 ring-black/5 z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-black/5 flex items-center">
              <div className="font-extrabold text-ink-900">Уведомления</div>
              {items?.some((n) => !n.readAt) && (
                <button
                  onClick={onReadAll}
                  className="ml-auto text-[13px] font-semibold text-brand-700 hover:text-brand-800"
                >
                  Прочитать все
                </button>
              )}
            </div>
            <ul className="max-h-[60vh] overflow-y-auto">
              {items === null && (
                <li className="px-4 py-6">
                  <div className="h-4 w-2/3 rounded bg-slate-100 animate-pulse" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
                </li>
              )}
              {items?.map((n) => {
                const [Icon, tone] = ICONS[n.type] || [Bell, 'text-brand-700 bg-brand-50'];
                return (
                  <li key={n.id} className="border-b last:border-b-0 border-black/5">
                    <button
                      onClick={() => onItem(n)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 ${
                        n.readAt ? '' : 'bg-accent-50/40'
                      }`}
                    >
                      <span className={`w-8 h-8 shrink-0 grid place-items-center rounded-full ${tone}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink-900 line-clamp-2">{n.title}</span>
                        {n.body && (
                          <span className="block text-[13px] text-ink-500 line-clamp-2 whitespace-pre-line">
                            {n.body}
                          </span>
                        )}
                        <span className="block mt-0.5 text-[11px] text-ink-500" suppressHydrationWarning>
                          {formatRelative(n.createdAt)}
                        </span>
                      </span>
                      {!n.readAt && <span className="mt-1.5 w-2 h-2 rounded-full bg-accent-500 shrink-0" />}
                    </button>
                  </li>
                );
              })}
              {items?.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-ink-500">
                  Пока нет уведомлений. Здесь появятся отзывы о вас и решения модерации.
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
