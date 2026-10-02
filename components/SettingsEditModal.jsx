'use client';

/**
 * Универсальная модалка для редактирования одного поля профиля.
 * kind определяет какие поля показать и что отправить в PATCH /me.
 *
 * kind: 'personal' | 'phone' | 'city' | 'notifications'
 */

import { useScrollLock } from '@/lib/scrollLock';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, BellRing, MapPin, MessageCircle, Phone as PhoneIcon, CheckCircle2 } from 'lucide-react';
import { CITIES } from '@/data/regions';
import { useAuth } from '@/lib/auth';
import AvatarPicker from './AvatarPicker';
import { useApp } from './AppShell';
import { checkUsername } from '@/lib/api';
import { disablePush, enablePush, pushState } from '@/lib/pwa';

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

  useScrollLock(open); // страница под окном не прокручивается
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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

            {/* Шапка до заголовка закреплена, прокручиваются только поля */}
            <div className="shrink-0 px-5 md:px-6 pt-5 md:pt-6 pb-3 pr-14 border-b border-slate-100">
              <div className="text-xs uppercase tracking-wide text-accent-700 font-bold">
                Настройки
              </div>
              <h3 className="text-xl font-extrabold text-ink-900 mt-1">
                {TITLES[kind]}
              </h3>
            </div>

            <div className="px-5 md:px-6 pb-20 md:pb-6 overflow-y-auto overscroll-contain">
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
      <UsernameField form={form} setForm={setForm} />
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

// Свой адрес страницы: доска-квн.рф/u/<адрес>. Свободен ли — проверяем при вводе.
function UsernameField({ form, setForm }) {
  const value = form.username || '';
  useEffect(() => {
    const u = value.trim().toLowerCase().replace(/^@/, '');
    if (!u || u === form.usernameSaved) {
      setForm((f) => ({ ...f, usernameStatus: null, usernameReason: null }));
      return;
    }
    setForm((f) => ({ ...f, usernameStatus: 'checking' }));
    const t = setTimeout(async () => {
      const r = await checkUsername(u).catch(() => ({ available: false, reason: 'Не удалось проверить' }));
      setForm((f) =>
        (f.username || '').trim().toLowerCase().replace(/^@/, '') === u
          ? { ...f, usernameStatus: r.available ? 'ok' : 'bad', usernameReason: r.reason || null }
          : f
      );
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div>
      <div className="text-xs font-semibold text-ink-700 mb-1">
        Адрес страницы <span className="font-normal text-ink-500">— не обязательно</span>
      </div>
      <div className="flex items-center rounded-2xl bg-white ring-1 ring-black/10 focus-within:ring-accent-400 px-4">
        <span className="text-ink-500 text-[15px] shrink-0">доска-квн.рф/u/</span>
        <input
          type="text"
          value={value}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.replace(/\s/g, '').slice(0, 30) }))}
          placeholder="ivan"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 min-w-0 bg-transparent outline-none py-3 text-base"
        />
      </div>
      <div className="text-[11px] mt-1 min-h-[16px]">
        {form.usernameStatus === 'checking' && <span className="text-ink-500">Проверяем…</span>}
        {form.usernameStatus === 'ok' && <span className="text-emerald-700">Адрес свободен</span>}
        {form.usernameStatus === 'bad' && <span className="text-rose-700">{form.usernameReason}</span>}
        {!form.usernameStatus && (
          <span className="text-ink-500">Латиница, цифры и «_». Ссылка на вашу страницу продавца.</span>
        )}
      </div>
    </div>
  );
}

// Пуши на этом устройстве: включаются сразу, без «Сохранить».
function PushToggle() {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const { openInstallGuide } = useApp();
  useEffect(() => {
    pushState().then(setState);
  }, []);

  if (!state || state === 'unsupported') return null;

  async function toggle() {
    setBusy(true);
    try {
      setState(state === 'on' ? await disablePush() : await enablePush());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 ring-1 ring-black/5 p-3">
      <BellRing className="w-5 h-5 text-accent-700 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-ink-900">Уведомления на этом устройстве</div>
        <div className="text-[12px] text-ink-500">
          {state === 'on' && 'Включены: новые сообщения и события приходят сразу'}
          {state === 'off' && 'Сообщения и ответы — сразу, даже когда сайт закрыт'}
          {state === 'denied' && 'Запрещены в настройках браузера — разрешите уведомления для сайта'}
          {state === 'needs-install' && 'На iPhone уведомления приходят только в установленное приложение'}
        </div>
        {state === 'needs-install' && (
          <button type="button" onClick={() => openInstallGuide('push')} className="mt-1 text-[13px] font-semibold text-accent-700">
            Как установить →
          </button>
        )}
      </div>
      {(state === 'on' || state === 'off') && (
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          role="switch"
          aria-checked={state === 'on'}
          aria-label="Уведомления на этом устройстве"
          className={`relative w-12 h-7 rounded-full transition-colors shrink-0 disabled:opacity-50 ${state === 'on' ? 'bg-emerald-500' : 'bg-slate-300'}`}
        >
          <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${state === 'on' ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
      )}
    </div>
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
            <div className="flex-1 font-bold text-ink-900">{c.name}</div>
            {active && <CheckCircle2 className="w-5 h-5 text-accent-600" />}
          </button>
        );
      })}
    </div>
  );
}

function NotificationsFields({ form, setForm }) {
  return (
    <>
    <PushToggle />
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
    </>
  );
}

// ── Хелперы ────────────────────────────────────────────────────────

function initialFor(kind, me) {
  if (!me) return {};
  if (kind === 'personal') {
    return {
      name: me.name || '',
      bio: me.bio || '',
      avatar: me.avatar || null,
      username: me.username || '',
      usernameSaved: me.username || ''
    };
  }
  if (kind === 'phone') return { contactMethod: me.contactMethod || 'chat', phone: me.phone || '' };
  if (kind === 'city') return { homeCityId: me.homeCityId || '' };
  if (kind === 'notifications') return { notifyEmail: me.notifyEmail ?? true };
  return {};
}

function patchFrom(kind, form) {
  if (kind === 'personal') {
    return {
      name: form.name.trim(),
      bio: form.bio.trim() || undefined,
      avatar: form.avatar,
      username: (form.username || '').trim().toLowerCase().replace(/^@/, '')
    };
  }
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
  if (kind === 'personal') {
    return form.name?.trim().length >= 2 && form.usernameStatus !== 'bad' && form.usernameStatus !== 'checking';
  }
  if (kind === 'phone') {
    if (form.contactMethod === 'phone') return form.phone?.replace(/\D/g, '').length >= 10;
    return true;
  }
  if (kind === 'city') return !!form.homeCityId;
  return true;
}
