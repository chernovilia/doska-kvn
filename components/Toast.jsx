'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ToastCtx = createContext(null);

/**
 * Тонкая система тостов. Использование:
 *   const { toast } = useToast();
 *   toast('Ссылка скопирована');
 *   toast('Что-то не так', { kind: 'error' });
 *
 * ToastProvider оборачивает все страницы в layout.jsx.
 */
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, opts = {}) => {
      const id = Date.now() + Math.random();
      const item = {
        id,
        message,
        kind: opts.kind || 'success',
        duration: opts.duration ?? 2200
      };
      setItems((prev) => [...prev, item]);
      setTimeout(() => remove(id), item.duration);
      return id;
    },
    [remove]
  );

  const value = useMemo(() => ({ toast, remove }), [toast, remove]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="pointer-events-auto"
            >
              <div
                className={`inline-flex items-center gap-2 rounded-full shadow-soft px-4 py-2.5 text-sm font-semibold ${
                  t.kind === 'error'
                    ? 'bg-rose-600 text-white'
                    : 'bg-ink-900 text-white'
                }`}
              >
                {t.kind === 'error' ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Check className="w-4 h-4 text-emerald-300" />
                )}
                {t.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    // Провайдер не подключён — тихий фолбэк на alert
    return {
      toast: (msg) => {
        if (typeof window !== 'undefined') console.log('[toast]', msg);
      }
    };
  }
  return ctx;
}
