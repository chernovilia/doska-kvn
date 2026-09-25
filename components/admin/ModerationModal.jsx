'use client';

/**
 * Модалка модерации — полный просмотр объявления с фото, описанием, контактами,
 * плюс кнопки Одобрить / Отклонить / Удалить. Открывается кликом по строке
 * в /admin → Объявления.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import {
  X, Check, XCircle, Trash2, User as UserIcon, Mail, Phone,
  MapPin, Calendar, ShieldCheck, AlertCircle, ExternalLink
} from 'lucide-react';
import { adminGetAd, adminSetAdStatus, adminDeleteAd } from '@/lib/api';

export default function ModerationModal({ open, adId, onClose, onChanged }) {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    if (!open || !adId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setActivePhoto(0);
    adminGetAd(adId)
      .then((data) => { if (!cancelled) setAd(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, adId]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  async function setStatus(status) {
    if (!ad) return;
    setBusy(true);
    setError(null);
    try {
      await adminSetAdStatus(ad.id, status);
      onChanged?.();
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!ad || !window.confirm(`Удалить объявление «${ad.title}»?`)) return;
    setBusy(true);
    setError(null);
    try {
      await adminDeleteAd(ad.id);
      onChanged?.();
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const photos = ad?.photos || [];
  const heroSrc = photos[activePhoto]?.url;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 40, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            className="relative w-full max-w-4xl bg-white rounded-t-3xl md:rounded-3xl shadow-soft overflow-hidden max-h-[92vh] flex flex-col"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-9 h-9 grid place-items-center rounded-full bg-white/90 ring-1 ring-black/5 shadow-card hover:bg-white"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5 text-ink-700" />
            </button>

            <div className="p-5 md:p-6 border-b border-black/5">
              <div className="text-xs uppercase tracking-wide text-brand-700 font-bold">
                Модерация объявления
              </div>
              <h2 className="text-xl font-extrabold text-ink-900 mt-1">
                {loading ? 'Загрузка…' : ad?.title || '—'}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {error && (
                <div className="m-5 flex items-start gap-2 rounded-xl bg-rose-50 ring-1 ring-rose-200 px-3 py-2 text-[13px] text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              {ad && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
                  {/* Фото */}
                  <div>
                    <div className="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden ring-1 ring-black/5">
                      {heroSrc ? (
                        <img src={heroSrc} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-ink-400 text-sm">
                          Фото не загружены
                        </div>
                      )}
                    </div>
                    {photos.length > 1 && (
                      <div className="mt-2 grid grid-cols-6 gap-1.5">
                        {photos.map((p, i) => (
                          <button
                            key={p.url}
                            onClick={() => setActivePhoto(i)}
                            className={`aspect-square rounded-lg overflow-hidden ring-2 ${
                              i === activePhoto ? 'ring-brand-500' : 'ring-transparent'
                            }`}
                          >
                            <img src={p.url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Данные */}
                  <div className="space-y-4">
                    <div>
                      <StatusBadge status={ad.status} />
                    </div>

                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-ink-500 font-bold">
                        Раздел / категория
                      </div>
                      <div className="text-sm text-ink-900 mt-1">
                        {ad.section}
                        {ad.categoryGroup && <> → {ad.categoryGroup}</>}
                        {ad.category && <> → {ad.category}</>}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-ink-500 font-bold">
                        Цена
                      </div>
                      <div className="text-lg font-extrabold text-ink-900 mt-1">
                        {ad.price ? `${ad.price.toLocaleString('ru-RU')} ₽` : 'даром'}
                        {ad.priceSuffix && (
                          <span className="text-sm text-ink-500 font-normal ml-1">
                            {ad.priceSuffix}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-ink-500 font-bold">
                        Адрес
                      </div>
                      <div className="text-sm text-ink-900 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-600" />
                        {ad.address || ad.cityId}
                      </div>
                    </div>

                    {ad.description && (
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-ink-500 font-bold">
                          Описание
                        </div>
                        <div className="text-sm text-ink-800 mt-1 whitespace-pre-wrap">
                          {ad.description}
                        </div>
                      </div>
                    )}

                    {ad.avitoUrl && (
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-ink-500 font-bold">
                          Импорт с Авито
                        </div>
                        <a
                          href={ad.avitoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-brand-700 hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          Оригинал
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {ad?.author && (
                <div className="border-t border-black/5 p-5 bg-slate-50">
                  <div className="text-[11px] uppercase tracking-wide text-ink-500 font-bold mb-2">
                    Автор
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <InfoRow icon={UserIcon} label="Имя">
                      {ad.author.name || <span className="text-ink-400">не заполнено</span>}
                    </InfoRow>
                    <InfoRow icon={Mail} label="Email">
                      {ad.author.email}
                    </InfoRow>
                    <InfoRow icon={Phone} label="Телефон">
                      {ad.author.phone || <span className="text-ink-400">—</span>}
                      <span className="ml-1 text-[11px] text-ink-500">
                        · связь: {ad.author.contactMethod}
                      </span>
                    </InfoRow>
                    <InfoRow icon={MapPin} label="Город">
                      {ad.author.homeCityId || <span className="text-ink-400">—</span>}
                    </InfoRow>
                    <InfoRow icon={Calendar} label="Регистрация">
                      {new Date(ad.author.createdAt).toLocaleDateString('ru-RU')}
                      {ad.author.onboardedAt && (
                        <span className="ml-1 text-[11px] text-emerald-700">
                          · онбординг пройден
                        </span>
                      )}
                    </InfoRow>
                    <InfoRow icon={ShieldCheck} label="Роль / рейтинг">
                      <span className="capitalize">{ad.author.role}</span>
                      {ad.author.rating > 0 && ` · ★ ${ad.author.rating.toFixed(1)}`}
                      {ad.author.dealsCount > 0 && ` · ${ad.author.dealsCount} сделок`}
                    </InfoRow>
                  </div>
                  <div className="mt-3 text-xs text-ink-500">
                    <Link
                      href={`/ad/${ad.id}`}
                      target="_blank"
                      className="text-brand-700 hover:underline inline-flex items-center gap-1"
                    >
                      Открыть публичную страницу
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Действия */}
            {ad && (
              <div className="p-4 border-t border-black/5 bg-white flex flex-wrap items-center gap-2">
                <button
                  onClick={remove}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white ring-1 ring-rose-200 text-rose-700 hover:bg-rose-50 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Удалить навсегда
                </button>

                <div className="ml-auto flex items-center gap-2">
                  {ad.status !== 'rejected' && (
                    <button
                      onClick={() => setStatus('rejected')}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white ring-1 ring-amber-200 text-amber-800 hover:bg-amber-50 px-4 py-2 text-sm font-semibold disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Отклонить
                    </button>
                  )}
                  {ad.status !== 'approved' && (
                    <button
                      onClick={() => setStatus('approved')}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      Одобрить
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div>
      <div className="text-[11px] text-ink-500 flex items-center gap-1">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="text-ink-900">{children}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    approved: 'bg-emerald-100 text-emerald-800',
    pending: 'bg-amber-100 text-amber-800',
    rejected: 'bg-rose-100 text-rose-800',
    archived: 'bg-slate-100 text-slate-700'
  };
  return (
    <span
      className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
        map[status] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {status}
    </span>
  );
}
