'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User as UserIcon, Pencil, Phone, MessageCircle, AlertCircle } from 'lucide-react';
import { CITIES } from '@/data/regions';
import { useAuth } from '@/lib/auth';
import { safeReturnTo } from '@/lib/site';
import { useToast } from '@/components/Toast';

const HOME_CITIES = CITIES.filter((c) => c.regionId === 'kvn');

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Onboarding />
    </Suspense>
  );
}

// Обычная страница, а не модалка: во встроенных браузерах (ВК) панели перекрывают
// фиксированные окна, а прокрутку обычной страницы браузер сам уводит из-под них.
function Onboarding() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = safeReturnTo(params.get('returnTo'));
  const { user, ready, updateMe } = useAuth();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: '',
    homeCityId: '',
    contactMethod: 'chat',
    phone: '',
    notifyEmail: true
  });

  // После успешного updateMe у user появится onboardedAt — этот же эффект вернёт на returnTo.
  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace('/login?returnTo=/onboarding');
    else if (user.onboardedAt) router.replace(returnTo);
  }, [ready, user, returnTo, router]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const canSubmit =
    form.name.trim().length >= 2 &&
    !!form.homeCityId &&
    (form.contactMethod !== 'phone' || form.phone.replace(/\D/g, '').length >= 10) &&
    !busy;

  async function submit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await updateMe({
        name: form.name.trim(),
        homeCityId: form.homeCityId,
        contactMethod: form.contactMethod,
        phone: form.contactMethod === 'phone' ? form.phone : undefined,
        notifyEmail: form.notifyEmail,
        markOnboarded: true,
        agreeTerms: true
      });
      toast('Аккаунт создан');
    } catch (err) {
      setError(err.message || 'Не получилось сохранить. Попробуйте ещё раз.');
      setBusy(false);
    }
  }

  if (!ready || !user || user.onboardedAt) return <div className="min-h-screen" />;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-xl mx-auto px-4 pt-6 pb-28">
        <div className="font-black tracking-tight text-lg text-ink-900">
          Доска<span className="brand-slash">/</span>КВН
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-ink-900">Создание аккаунта</h1>
        <p className="text-sm text-ink-500 mt-1">
          Ещё пара полей — и можно публиковать. Всё меняется потом в настройках.
        </p>

        <form
          onSubmit={submit}
          className="mt-5 space-y-5 rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4 md:p-6"
        >
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

          <Field label="Имя" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set({ name: e.target.value.slice(0, 80) })}
              placeholder="Как вас зовут?"
              autoComplete="given-name"
              className="w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-base"
            />
          </Field>

          <Field label="Ваш город" required>
            <div className="grid grid-cols-3 gap-2">
              {HOME_CITIES.map((c) => (
                <Choice
                  key={c.id}
                  active={form.homeCityId === c.id}
                  onClick={() => set({ homeCityId: c.id })}
                >
                  {c.name}
                </Choice>
              ))}
            </div>
          </Field>

          <Field label="Как с вами связываться" required>
            <div className="grid grid-cols-2 gap-2">
              <Choice
                active={form.contactMethod === 'chat'}
                onClick={() => set({ contactMethod: 'chat' })}
              >
                <MessageCircle className="w-4 h-4" />
                Сообщения
              </Choice>
              <Choice
                active={form.contactMethod === 'phone'}
                onClick={() => set({ contactMethod: 'phone' })}
              >
                <Phone className="w-4 h-4" />
                Телефон
              </Choice>
            </div>
            <div className="mt-1.5 text-[12px] text-ink-500">
              {form.contactMethod === 'chat'
                ? 'Покупатели пишут вам на сайте, номер скрыт.'
                : 'Номер увидят только вошедшие пользователи.'}
            </div>
            {form.contactMethod === 'phone' && (
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set({ phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
                inputMode="tel"
                autoComplete="tel"
                className="mt-2 w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-base"
              />
            )}
          </Field>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.notifyEmail}
              onChange={(e) => set({ notifyEmail: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-brand-600"
            />
            <span className="text-sm text-ink-800">
              Присылать уведомления на e-mail
              <span className="block text-[12px] text-ink-500">
                Новые сообщения и события. Можно отключить в любой момент.
              </span>
            </span>
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 ring-1 ring-rose-200 px-3 py-2 text-[13px] text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-2xl bg-brand-600 hover:bg-brand-700 text-white py-3.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
            .
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <div className="text-xs font-semibold text-ink-700 mb-1.5">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </div>
      {children}
    </div>
  );
}

function Choice({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-2xl px-3 py-3 text-sm font-semibold ring-1 transition ${
        active
          ? 'bg-brand-600 text-white ring-brand-600'
          : 'bg-white text-ink-800 ring-black/10 hover:bg-brand-50'
      }`}
    >
      {children}
    </button>
  );
}
