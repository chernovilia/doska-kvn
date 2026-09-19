'use client';

import { CITIES } from '@/data/mock';
import { MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function CitySelector({ value, onChange, compact = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const active = CITIES.find((c) => c.id === value) || CITIES[0];

  if (compact) {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-3 py-2 text-sm font-semibold text-ink-900 shadow-card ring-1 ring-black/5 hover:bg-white"
        >
          <MapPin className="w-4 h-4 text-brand-600" />
          {active.name}
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute right-0 mt-2 w-52 rounded-2xl bg-white shadow-soft ring-1 ring-black/5 p-1 z-40"
            >
              {CITIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onChange(c.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-brand-50 ${
                    c.id === value ? 'bg-brand-50 text-brand-700' : 'text-ink-700'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Полноразмерный сегмент-переключатель
  return (
    <div className="inline-flex bg-white/70 backdrop-blur ring-1 ring-black/5 shadow-card rounded-full p-1">
      {CITIES.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={`relative px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold rounded-full transition ${
            c.id === value ? 'text-white' : 'text-ink-700 hover:text-ink-900'
          }`}
        >
          {c.id === value && (
            <motion.span
              layoutId="city-pill"
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              className="absolute inset-0 rounded-full bg-brand-600 shadow"
            />
          )}
          <span className="relative">{c.name}</span>
        </button>
      ))}
    </div>
  );
}
