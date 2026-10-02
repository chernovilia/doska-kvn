'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useScrollLock } from '@/lib/scrollLock';

// onBackdrop — если задан, тап мимо окна и Escape зовут его вместо onClose (крестик — всегда onClose).
export default function Modal({ open, onClose, onBackdrop, children, size = 'lg' }) {
  useScrollLock(open); // страница под окном не прокручивается
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && (onBackdrop || onClose)?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, onBackdrop]);

  const width =
    size === 'sm' ? 'max-w-md' : size === 'md' ? 'max-w-xl' : size === 'xl' ? 'max-w-4xl' : 'max-w-2xl';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onBackdrop || onClose}
          />
          <motion.div
            initial={{ y: 40, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            className={`relative w-full ${width} bg-white rounded-t-3xl md:rounded-3xl shadow-soft overflow-hidden sheet-max-h flex flex-col`}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-9 h-9 grid place-items-center rounded-full bg-white/90 ring-1 ring-black/5 shadow-card hover:bg-white"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5 text-ink-700" />
            </button>
            <div className="overflow-y-auto overscroll-contain">
              {children}
              {/* Запас снизу: во встроенных браузерах (ВК, iOS 26) панель перекрывает низ окна */}
              <div className="h-16 md:hidden" aria-hidden />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
