'use client';

import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getNotifications } from '@/lib/api';
import { formatRelative } from '@/lib/format';

export default function NotificationsButton() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    getNotifications().then(setItems);
  }, []);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const unread = items.filter((n) => n.unread).length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 grid place-items-center rounded-full bg-white ring-1 ring-black/5 hover:bg-brand-50 shadow-card"
        aria-label="Уведомления"
      >
        <Bell className="w-4.5 h-4.5 text-ink-800" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-accent-500 text-white text-[10px] font-bold ring-2 ring-white">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-soft ring-1 ring-black/5 z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-black/5 flex items-center">
              <div className="font-extrabold text-ink-900">Уведомления</div>
              <button
                onClick={() =>
                  setItems((prev) => prev.map((n) => ({ ...n, unread: false })))
                }
                className="ml-auto text-[12px] font-semibold text-brand-700 hover:text-brand-800"
              >
                Прочитать все
              </button>
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {items.map((n) => (
                <li
                  key={n.id}
                  className="px-4 py-3 border-b last:border-b-0 border-black/5 hover:bg-brand-50"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        n.unread ? 'bg-accent-500' : 'bg-slate-300'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-ink-900 truncate">
                        {n.title}
                      </div>
                      <div className="text-[12px] text-ink-500">{n.text}</div>
                    </div>
                    <span
                      className="text-[11px] text-ink-500 whitespace-nowrap"
                      suppressHydrationWarning
                    >
                      {formatRelative(n.at)}
                    </span>
                  </div>
                </li>
              ))}
              {items.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-ink-500">
                  Пока нет уведомлений
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
