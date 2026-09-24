'use client';

/**
 * OnboardingModal — одностраничная форма первичной настройки профиля.
 * Показывается пока у юзера me.onboardedAt === null (обязательный шаг).
 *
 * Поля (все обязательные, кроме bio и notifyEmail):
 *   • Тип аккаунта (Личный / Бизнес — задизейблено, «Скоро»)
 *   • Имя (2–80 символов)
 *   • О себе — необязательно, до 200
 *   • Домашний город (только запущенные — Кулебаки/Выкса/Навашино)
 *   • Способ связи (chat | phone) + телефон если phone
 *   • Флажок email-уведомлений
 *
 * Submit → PATCH /v1/me с полями + markOnboarded + agreeTerms.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  User as UserIcon,
  Pencil,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CITIES } from '@/data/regions';
import { useAuth } from '@/lib/auth';

// Города домашнего региона. Позже — расширим по мере запуска других регионов.
const HOME_CITIES = CITIES.filter((c) => c.regionId === 'kvn');

export default function OnboardingModal({ me }) {
  const { updateMe } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    accountType: 'personal', // 'personal' | 'business' (business пока задизейблено)
    name: '',
    bio: '',
    homeCityId: '',
    contactMethod: 'chat', // 'chat' | 'phone'
    phone: '',
    notifyEmail: true
  });

  // Валидация: имя ≥ 2, город выбран, если phone — телефон ≥ 10 цифр.
  const nameOk = form.name.trim().length >= 2;
  const cityOk = !!form.homeCityId;
  const phoneOk =
    form.contactMethod !== 'phone' ||
    form.phone.replace(/\D/g, '').length >= 10;
  const canSubmit = nameOk && cityOk && phoneOk && !busy;

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await updateMe({
        name: form.name.trim(),
        bio: form.bio.trim() || undefined,
        homeCityId: form.homeCityId,
        contactMethod: form.contactMethod,
        phone: form.contactMethod === 'phone' ? form.phone : undefined,
        notifyEmail: form.notifyEmail,
        markOnboarded: true,
        agreeTerms: true
      });
      // Успех — родитель скроет модалку по me.onboardedAt.
    } catch (err) {
      setError(err.message || 'Не получилось сохранить. Попробуйте ещё раз.');
    } finally {
      setBusy(false);
    }
  }

  // Блокируем прокрутку body пока открыто
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div
        initial={{ y: 40, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
        className="relative w-full max-w-xl bg-white rounded-t-3xl md:rounded-3xl shadow-soft overflow-hidden max-h-[92vh] flex flex-col"
      >
        <div className="p-5 md:p-6 pb-3">
          <div className="text-xs uppercase tracking-wide text-brand-700 font-bold">
            Добро пожаловать
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-ink-900 mt-1">
            Создание аккаунта
          </h2>
          <p className="text-sm text-ink-500 mt-1">
            Пара шагов — и вы в системе. Всё можно поменять позже в настройках.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex-1 overflow-y-auto px-5 md:px-6 pb-4 space-y-5"
        >
          {/* Тип аккаунта */}
          <Field label="Тип аккаунта">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-semibold bg-white shadow-card text-brand-700 ring-1 ring-brand-200">
                <UserIcon className="w-4 h-4" />
                Личный
              </span>
              <button
                type="button"
                disabled
                title="Смена типа аккаунта — скоро"
                className="w-8 h-8 grid place-items-center rounded-full text-ink-400 cursor-not-allowed opacity-60"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </Field>

          {/* Имя */}
          <Field label="Имя" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value.slice(0, 80) }))
              }
              placeholder="Как вас зовут?"
              autoFocus
              autoComplete="given-name"
              className="w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-sm"
            />
          </Field>

          {/* О себе */}
          <Field label="О себе" hint="не обязательно">
            <textarea
              value={form.bio}
              onChange={(e) =>
                setForm((f) => ({ ...f, bio: e.target.value.slice(0, 200) }))
              }
              placeholder="Пара слов о вас — увидят в профиле"
              rows={3}
              className="w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-sm resize-none"
            />
            <div className="text-[11px] text-ink-500 mt-1 text-right">
              {form.bio.length}/200
            </div>
          </Field>

          {/* Город */}
          <Field label="Домашний город" required>
            <div className="grid grid-cols-1 gap-2">
              {HOME_CITIES.map((c) => {
                const active = form.homeCityId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, homeCityId: c.id }))
                    }
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1 transition ${
                      active
                        ? 'bg-brand-50 ring-brand-400'
                        : 'bg-white ring-black/10 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 grid place-items-center rounded-xl ${
                        active
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-ink-700'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-ink-900">{c.name}</div>
                      <div className="text-[11px] text-ink-500">
                        {c.population.toLocaleString('ru-RU')} жителей
                      </div>
                    </div>
                    {active && (
                      <CheckCircle2 className="w-5 h-5 text-brand-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Способ связи */}
          <Field label="Способ связи" required>
            <div className="grid grid-cols-1 gap-2">
              <ContactOption
                active={form.contactMethod === 'chat'}
                onClick={() =>
                  setForm((f) => ({ ...f, contactMethod: 'chat' }))
                }
                icon={MessageCircle}
                title="Сообщения на сайте"
                hint="Покупатели пишут через встроенный чат. Номер не показываем."
                recommended
              />
              <ContactOption
                active={form.contactMethod === 'phone'}
                onClick={() =>
                  setForm((f) => ({ ...f, contactMethod: 'phone' }))
                }
                icon={Phone}
                title="Телефон"
                hint="Покажем номер и добавим кнопку «Позвонить»."
              />
            </div>

            {form.contactMethod === 'phone' && (
              <div className="mt-2">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+7 (999) 123-45-67"
                  inputMode="tel"
                  autoComplete="tel"
                  className="w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-sm"
                />
              </div>
            )}
          </Field>

          {/* Уведомления */}
          <Field label="">
            <label className="flex items-start gap-3 rounded-2xl bg-slate-50 ring-1 ring-black/5 p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.notifyEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notifyEmail: e.target.checked }))
                }
                className="mt-0.5 w-4 h-4 accent-brand-600"
              />
              <div>
                <div className="text-sm font-semibold text-ink-900">
                  Уведомления на почту
                </div>
                <div className="text-[12px] text-ink-500">
                  Новые сообщения и события — на ваш e-mail. Отключить можно в любой момент.
                </div>
              </div>
            </label>
          </Field>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 ring-1 ring-rose-200 px-3 py-2 text-[13px] text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-2xl bg-brand-600 hover:bg-brand-700 text-white py-3.5 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? 'Создаём аккаунт…' : 'Создать аккаунт'}
          </button>

          <p className="text-[11px] text-ink-500 text-center leading-relaxed">
            Создавая аккаунт, вы соглашаетесь с{' '}
            <Link href="/terms" target="_blank" className="underline hover:text-ink-800">
              условиями использования
            </Link>{' '}
            и{' '}
            <Link href="/privacy" target="_blank" className="underline hover:text-ink-800">
              политикой конфиденциальности
            </Link>
            . Соблюдаем 152-ФЗ, данные хранятся в РФ.
          </p>
        </form>
      </motion.div>
    </div>
  );
}

// ── Мелкие визуальные помощники ────────────────────────────────────

function Field({ label, hint, required, children }) {
  return (
    <div>
      {label && (
        <div className="text-xs font-semibold text-ink-700 mb-1.5 flex items-center gap-1.5">
          {label}
          {required && <span className="text-rose-500">*</span>}
          {hint && (
            <span className="font-normal text-ink-500">— {hint}</span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function TypePill({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-semibold ${
        active ? 'bg-white shadow-card text-brand-700' : 'text-ink-500'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function ContactOption({ active, onClick, icon: Icon, title, hint, recommended }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-left ring-1 transition ${
        active
          ? 'bg-brand-50 ring-brand-400'
          : 'bg-white ring-black/10 hover:bg-slate-50'
      }`}
    >
      <div
        className={`w-9 h-9 grid place-items-center rounded-xl shrink-0 ${
          active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-700'
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="font-bold text-ink-900 flex items-center gap-2">
          {title}
          {recommended && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 px-1.5 py-0.5 rounded-full">
              Рекомендуем
            </span>
          )}
        </div>
        <div className="text-[12px] text-ink-500 mt-0.5">{hint}</div>
      </div>
      {active && <CheckCircle2 className="w-5 h-5 text-brand-600 mt-0.5" />}
    </button>
  );
}
