'use client';

/**
 * OnboardingModal — блокирующая (без крестика) модалка первичной настройки
 * профиля. Показывается, если у юзера me.onboardedAt === null.
 *
 * 4 шага:
 *   1. Имя + короткое «О себе»
 *   2. Домашний город (агломерация КВН)
 *   3. Способ связи + телефон
 *   4. Согласие с правилами + email-уведомления → submit
 *
 * Все поля кроме bio — обязательные. Итоговый submit шлёт PATCH /v1/me
 * со всеми полями и флагами markOnboarded=true + agreeTerms=true.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  User as UserIcon,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { CITIES } from '@/data/regions';
import { useAuth } from '@/lib/auth';

const STEPS = ['Имя', 'Город', 'Связь', 'Готово'];

// Города домашнего региона — оставляем только КВН, чтобы не перегружать выбор.
// Позже можно расширить, когда запустим другие регионы.
const HOME_CITIES = CITIES.filter((c) => c.regionId === 'kvn');

export default function OnboardingModal({ me }) {
  const { updateMe } = useAuth();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: me?.name || '',
    bio: me?.bio || '',
    homeCityId: me?.homeCityId || '',
    contactMethod: me?.contactMethod || 'chat',
    phone: me?.phone || '',
    notifyEmail: me?.notifyEmail ?? true,
    agree: false
  });

  // Валидация текущего шага
  const canNext = (() => {
    if (step === 0) return form.name.trim().length >= 2;
    if (step === 1) return !!form.homeCityId;
    if (step === 2) {
      if (form.contactMethod === 'phone') {
        return form.phone.replace(/\D/g, '').length >= 10;
      }
      return true;
    }
    if (step === 3) return form.agree;
    return false;
  })();

  async function submit() {
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
      // Успех — модалка сама скроется, т.к. в родителе me.onboardedAt станет != null
    } catch (err) {
      setError(err.message || 'Не получилось сохранить. Попробуйте ещё раз.');
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (step === STEPS.length - 1) {
      submit();
    } else {
      setStep((s) => s + 1);
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
        {/* Шапка с прогрессом */}
        <div className="p-5 md:p-6 pb-3">
          <div className="text-xs uppercase tracking-wide text-brand-700 font-bold">
            Добро пожаловать
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-ink-900 mt-1">
            Пара шагов — и вы в системе
          </h2>
          <div className="mt-4 flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1">
                <div
                  className={`h-1.5 rounded-full ${
                    i <= step ? 'bg-brand-600' : 'bg-slate-200'
                  }`}
                />
                <div
                  className={`mt-1 text-[10px] font-semibold text-center ${
                    i === step ? 'text-brand-700' : 'text-ink-500'
                  }`}
                >
                  {s}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 md:px-6 pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
            >
              {step === 0 && (
                <StepName
                  form={form}
                  setForm={setForm}
                />
              )}
              {step === 1 && (
                <StepCity form={form} setForm={setForm} />
              )}
              {step === 2 && (
                <StepContact form={form} setForm={setForm} />
              )}
              {step === 3 && (
                <StepAgree form={form} setForm={setForm} />
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 ring-1 ring-rose-200 px-3 py-2 text-[13px] text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}
        </div>

        {/* Кнопки навигации */}
        <div className="p-5 md:p-6 pt-3 border-t border-black/5 flex items-center gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={busy}
              className="inline-flex items-center gap-1 h-11 px-3 rounded-2xl text-sm font-semibold text-ink-700 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Назад
            </button>
          )}
          <button
            onClick={next}
            disabled={!canNext || busy}
            className="ml-auto inline-flex items-center gap-1 h-11 px-5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy
              ? 'Сохраняем…'
              : step === STEPS.length - 1
              ? 'Начать пользоваться'
              : 'Дальше'}
            {!busy && step !== STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Шаги ──────────────────────────────────────────────────────────

function StepName({ form, setForm }) {
  return (
    <div>
      <StepHead
        icon={UserIcon}
        title="Как вас зовут?"
        hint="Так вас увидят другие пользователи в объявлениях и чатах."
      />
      <label className="block mt-4">
        <div className="text-xs font-semibold text-ink-700 mb-1">Имя</div>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Ваше имя"
          autoFocus
          className="w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-sm"
        />
      </label>
      <label className="block mt-3">
        <div className="text-xs font-semibold text-ink-700 mb-1">
          О себе <span className="font-normal text-ink-500">— не обязательно</span>
        </div>
        <textarea
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value.slice(0, 200) }))}
          placeholder="Пара слов о вас — увидят в вашем профиле"
          rows={3}
          className="w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-sm resize-none"
        />
        <div className="text-[11px] text-ink-500 mt-1 text-right">
          {form.bio.length}/200
        </div>
      </label>
    </div>
  );
}

function StepCity({ form, setForm }) {
  return (
    <div>
      <StepHead
        icon={MapPin}
        title="Ваш город"
        hint="По умолчанию будем показывать объявления в вашем городе."
      />
      <div className="mt-4 grid grid-cols-1 gap-2">
        {HOME_CITIES.map((c) => {
          const active = form.homeCityId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setForm((f) => ({ ...f, homeCityId: c.id }))}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1 transition ${
                active
                  ? 'bg-brand-50 ring-brand-400'
                  : 'bg-white ring-black/10 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-9 h-9 grid place-items-center rounded-xl ${
                  active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-700'
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
              {active && <CheckCircle2 className="w-5 h-5 text-brand-600" />}
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-[11px] text-ink-500">
        Позже вы сможете смотреть объявления любого города — это только «домашний».
      </div>
    </div>
  );
}

function StepContact({ form, setForm }) {
  return (
    <div>
      <StepHead
        icon={MessageCircle}
        title="Как с вами связываться?"
        hint="Способ по умолчанию — вы всегда сможете поменять его в настройках."
      />
      <div className="mt-4 grid grid-cols-1 gap-2">
        <ContactOption
          active={form.contactMethod === 'chat'}
          onClick={() => setForm((f) => ({ ...f, contactMethod: 'chat' }))}
          icon={MessageCircle}
          title="Сообщения на сайте"
          hint="Покупатели пишут вам через встроенный чат. Номер не показываем."
          recommended
        />
        <ContactOption
          active={form.contactMethod === 'phone'}
          onClick={() => setForm((f) => ({ ...f, contactMethod: 'phone' }))}
          icon={Phone}
          title="Телефон"
          hint="Покажем номер и добавим кнопку «Позвонить»."
        />
      </div>

      {form.contactMethod === 'phone' && (
        <label className="block mt-3">
          <div className="text-xs font-semibold text-ink-700 mb-1">Телефон</div>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+7 (999) 123-45-67"
            inputMode="tel"
            autoComplete="tel"
            className="w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-sm"
          />
          <div className="text-[11px] text-ink-500 mt-1">
            Только вы решаете, где показывать номер. Он никому не передаётся кроме объявлений.
          </div>
        </label>
      )}
    </div>
  );
}

function StepAgree({ form, setForm }) {
  return (
    <div>
      <StepHead
        icon={ShieldCheck}
        title="Последний шаг"
        hint="Соглашение и уведомления — и мы готовы."
      />

      <label className="mt-4 flex items-start gap-3 rounded-2xl bg-slate-50 ring-1 ring-black/5 p-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.notifyEmail}
          onChange={(e) => setForm((f) => ({ ...f, notifyEmail: e.target.checked }))}
          className="mt-0.5 w-4 h-4 accent-brand-600"
        />
        <div>
          <div className="text-sm font-semibold text-ink-900">
            Уведомления на почту
          </div>
          <div className="text-[12px] text-ink-500">
            Новые сообщения и события — на ваш email. Можно отключить в любой момент.
          </div>
        </div>
      </label>

      <label className="mt-2 flex items-start gap-3 rounded-2xl bg-white ring-1 ring-black/10 p-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.agree}
          onChange={(e) => setForm((f) => ({ ...f, agree: e.target.checked }))}
          className="mt-0.5 w-4 h-4 accent-brand-600"
        />
        <div className="text-[13px] text-ink-800">
          Я соглашаюсь с{' '}
          <Link href="/terms" target="_blank" className="text-brand-700 underline">
            условиями использования
          </Link>{' '}
          и{' '}
          <Link href="/privacy" target="_blank" className="text-brand-700 underline">
            политикой конфиденциальности
          </Link>
          . Соблюдаем 152-ФЗ, данные хранятся в РФ.
        </div>
      </label>
    </div>
  );
}

// ── Общие мелочи ──────────────────────────────────────────────────

function StepHead({ icon: Icon, title, hint }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 grid place-items-center rounded-xl bg-brand-50 text-brand-700 shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-base md:text-lg font-extrabold text-ink-900">{title}</div>
        <div className="text-[13px] text-ink-500 mt-0.5">{hint}</div>
      </div>
    </div>
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
