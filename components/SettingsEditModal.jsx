'use client';

/**
 * Универсальная модалка для редактирования одного поля профиля.
 * kind определяет какие поля показать и что отправить в PATCH /me.
 *
 * kind: 'personal' | 'phone' | 'city' | 'notifications'
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, MapPin, MessageCircle, Phone as PhoneIcon, CheckCircle2 } from 'lucide-react';
import { CITIES } from '@/data/regions';
import { useAuth } from '@/lib/auth';
import AvatarPicker from './AvatarPicker';

const HOME_CITIES = CITIES.filter((c) => c.regionId === 'kvn');

const TITLES = {
  personal: 'Личные данные',
  phone: 'Телефон и связь',
  city: 'Ваш город',
  notifications: 'Уведомления'
};

export default function SettingsEditModal({ open, kind, me, onClose }) {
  const { updateMe } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [state, setState] = useState(() => ({ kind, form: initialFor(kind, me) }));
  // Форма всегда от текущего kind: окно из «Настроек» монтируется с kind=null и в первый
  // рендер после открытия ещё держит пустую форму — поля падали на form.bio.length.
  const form = state.kind === kind ? state.form : initialFor(kind, me);
  const setForm = (next) =>
    setState((st) => {
      const base = st.kind === kind ? st.form : initialFor(kind, me);
      return { kind, form: typeof next === 'function' ? next(base) : next };
    });

  // Заполняем при открытии, а не при каждом обновлении `me`: иначе выбранный аватар
  // сбрасывался бы, если данные профиля обновятся, пока окно открыто.
  useEffect(() => {
    if (open) {
      setState({ kind, form: initialFor(kind, me) });
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, kind]);

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

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const patch = patchFrom(kind, form);
      await updateMe(patch);
      onClose?.();
    } catch (err) {
      setError(err.message || 'Не удалось сохранить');
    } finally {
      setBusy(false);
    }
  }

  const canSave = validate(kind, form) && !busy;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 40, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            className="relative w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-soft overflow-hidden sheet-max-h flex flex-col"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-9 h-9 grid place-items-center rounded-full bg-white/90 ring-1 ring-black/5 shadow-card hover:bg-white"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5 text-ink-700" />
            </button>

            <div className="p-5 pb-20 md:p-6 overflow-y-auto">
              <div className="text-xs uppercase tracking-wide text-accent-700 font-bold">
                Настройки
              </div>
              <h3 className="text-xl font-extrabold text-ink-900 mt-1">
                {TITLES[kind]}
              </h3>

              <div className="mt-4 space-y-4">
                {kind === 'personal' && <PersonalFields form={form} setForm={setForm} onError={setError} />}
                {kind === 'phone' && <PhoneFields form={form} setForm={setForm} />}
                {kind === 'city' && <CityFields form={form} setForm={setForm} />}
                {kind === 'notifications' && <NotificationsFields form={form} setForm={setForm} />}
              </div>

              {error && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 ring-1 ring-rose-200 px-3 py-2 text-[13px] text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-2xl bg-slate-100 hover:bg-slate-200 text-ink-800 py-3 text-sm font-semibold"
                >
                  Отмена
                </button>
                <button
                  onClick={submit}
                  disabled={!canSave}
                  className="flex-[2] rounded-2xl btn-primary py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {busy ? 'Сохраняем…' : 'Сохранить'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Формы для каждого kind ─────────────────────────────────────────

function PersonalFields({ form, setForm, onError }) {
  return (
    <>
      <div>
        <div className="text-sm font-semibold text-ink-700 mb-2">Аватар</div>
        <AvatarPicker
          value={form.avatar}
          name={form.name}
          onChange={(avatar) => {
            onError?.(null);
            setForm((f) => ({ ...f, avatar }));
          }}
          onError={onError}
        />
      </div>
      <div>
        <div className="text-xs font-semibold text-ink-700 mb-1">Имя</div>
        <input
          type="text"
          value={form.name || ''}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value.slice(0, 80) }))}
          className="w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-4 py-3 text-base"
        />
      </div>
      <div>
        <div className="text-xs font-semibold text-ink-700 mb-1">
          О себе <span className="font-normal text-ink-500">— не обязательно</span>
        </div>
        <textarea
          value={form.bio || ''}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value.slice(0, 200) }))}
          rows={3}
          className="w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-4 py-3 text-base resize-none"
        />
        <div className="text-[11px] text-ink-500 mt-1 text-right">{(form.bio || '').length}/200</div>
      </div>
    </>
  );
}

function PhoneFields({ form, setForm }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-2">
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, contactMethod: 'chat' }))}
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left border-[1.5px] transition-colors ${
            form.contactMethod === 'chat' ? 'bg-accent-50 border-accent-400' : 'bg-slate-50 border-transparent hover:bg-slate-100'
          }`}
        >
          <MessageCircle className="w-5 h-5 text-accent-700" />
          <div className="flex-1">
            <div className="text-sm font-bold text-ink-900">Сообщения на сайте</div>
            <div className="text-[11px] text-ink-500">Номер не показываем</div>
          </div>
          {form.contactMethod === 'chat' && <CheckCircle2 className="w-5 h-5 text-accent-600" />}
        </button>
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, contactMethod: 'phone' }))}
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left border-[1.5px] transition-colors ${
            form.contactMethod === 'phone' ? 'bg-accent-50 border-accent-400' : 'bg-slate-50 border-transparent hover:bg-slate-100'
          }`}
        >
          <PhoneIcon className="w-5 h-5 text-accent-700" />
          <div className="flex-1">
            <div className="text-sm font-bold text-ink-900">Телефон</div>
            <div className="text-[11px] text-ink-500">Покажем номер в объявлениях</div>
          </div>
          {form.contactMethod === 'phone' && <CheckCircle2 className="w-5 h-5 text-accent-600" />}
        </button>
      </div>
      <div>
        <div className="text-xs font-semibold text-ink-700 mb-1">
          Номер {form.contactMethod === 'phone' && <span className="text-rose-500">*</span>}
        </div>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="+7 (999) 123-45-67"
          inputMode="tel"
          autoComplete="tel"
          className="w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-4 py-3 text-base"
        />
      </div>
    </>
  );
}

function CityFields({ form, setForm }) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {HOME_CITIES.map((c) => {
        const active = form.homeCityId === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => setForm((f) => ({ ...f, homeCityId: c.id }))}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left border-[1.5px] transition-colors ${
              active ? 'bg-accent-50 border-accent-400' : 'bg-slate-50 border-transparent hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-5 h-5 text-accent-700" />
            <div className="flex-1">
              <div className="font-bold text-ink-900">{c.name}</div>
              <div className="text-[11px] text-ink-500">
                {c.population.toLocaleString('ru-RU')} жителей
              </div>
            </div>
            {active && <CheckCircle2 className="w-5 h-5 text-accent-600" />}
          </button>
        );
      })}
    </div>
  );
}

function NotificationsFields({ form, setForm }) {
  return (
    <label className="flex items-start gap-3 rounded-2xl bg-slate-50 ring-1 ring-black/5 p-3 cursor-pointer">
      <input
        type="checkbox"
        checked={form.notifyEmail}
        onChange={(e) => setForm((f) => ({ ...f, notifyEmail: e.target.checked }))}
        className="mt-0.5 w-4 h-4 accent-accent-600"
      />
      <div>
        <div className="text-sm font-semibold text-ink-900">
          Уведомления на почту
        </div>
        <div className="text-[12px] text-ink-500">
          Новые сообщения и события — на ваш e-mail.
        </div>
      </div>
    </label>
  );
}

// ── Хелперы ────────────────────────────────────────────────────────

function initialFor(kind, me) {
  if (!me) return {};
  if (kind === 'personal') return { name: me.name || '', bio: me.bio || '', avatar: me.avatar || null };
  if (kind === 'phone') return { contactMethod: me.contactMethod || 'chat', phone: me.phone || '' };
  if (kind === 'city') return { homeCityId: me.homeCityId || '' };
  if (kind === 'notifications') return { notifyEmail: me.notifyEmail ?? true };
  return {};
}

function patchFrom(kind, form) {
  if (kind === 'personal') return { name: form.name.trim(), bio: form.bio.trim() || undefined, avatar: form.avatar };
  if (kind === 'phone') return {
    contactMethod: form.contactMethod,
    phone: form.phone || undefined
  };
  if (kind === 'city') return { homeCityId: form.homeCityId };
  if (kind === 'notifications') return { notifyEmail: form.notifyEmail };
  return {};
}

function validate(kind, form) {
  if (!form) return false;
  if (kind === 'personal') return form.name?.trim().length >= 2;
  if (kind === 'phone') {
    if (form.contactMethod === 'phone') return form.phone?.replace(/\D/g, '').length >= 10;
    return true;
  }
  if (kind === 'city') return !!form.homeCityId;
  return true;
}
