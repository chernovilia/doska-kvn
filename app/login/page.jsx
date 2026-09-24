'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = params.get('returnTo') || '/';
  const { requestCode, verifyCode } = useAuth();

  const [step, setStep] = useState('email'); // 'email' | 'code' | 'done'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [expiresInSec, setExpiresInSec] = useState(0);

  // Countdown таймер повторной отправки
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => {
      setResendTimer((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  async function sendCode(isResend = false) {
    setError(null);
    if (!email.includes('@')) {
      setError('Введите корректный email');
      return;
    }
    setBusy(true);
    try {
      const res = await requestCode(email);
      setStep('code');
      setResendTimer(res.resendAfterSec || 60);
      setExpiresInSec(res.expiresInSec || 900);
      if (isResend) setCode('');
    } catch (err) {
      setError(err.message || 'Не удалось отправить код');
      if (err.data?.retryAfterSec) {
        setResendTimer(err.data.retryAfterSec);
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitCode() {
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError('Код — 6 цифр');
      return;
    }
    setBusy(true);
    try {
      await verifyCode(email, code);
      setStep('done');
      setTimeout(() => router.push(returnTo), 700);
    } catch (err) {
      setError(err.message || 'Неверный код');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen hero-gradient grid place-items-start md:place-items-center px-4 py-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/"
            className="w-10 h-10 grid place-items-center rounded-full bg-white ring-1 ring-black/5 hover:bg-brand-50 shadow-card"
            aria-label="Назад"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-ink-800" />
          </Link>
          <div className="font-black tracking-tight text-lg text-ink-900">
            Доска<span className="brand-slash">/</span>КВН
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white ring-1 ring-black/5 shadow-soft p-6 md:p-8"
        >
          {step === 'done' ? (
            <div className="text-center py-6">
              <div className="mx-auto w-14 h-14 grid place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="mt-3 font-extrabold text-ink-900">Готово!</div>
              <div className="text-sm text-ink-500">Открываем ваш кабинет…</div>
            </div>
          ) : step === 'email' ? (
            <EmailStep
              email={email}
              setEmail={setEmail}
              onSubmit={() => sendCode(false)}
              busy={busy}
              error={error}
            />
          ) : (
            <CodeStep
              email={email}
              code={code}
              setCode={setCode}
              onSubmit={submitCode}
              busy={busy}
              error={error}
              resendTimer={resendTimer}
              expiresInSec={expiresInSec}
              onBack={() => {
                setStep('email');
                setCode('');
                setError(null);
              }}
              onResend={() => sendCode(true)}
            />
          )}
        </motion.div>

        <div className="mt-4 text-center text-[12px] text-ink-500">
          Нажимая «Продолжить», вы соглашаетесь с{' '}
          <Link href="/terms" className="underline hover:text-ink-800">
            условиями
          </Link>{' '}
          и{' '}
          <Link href="/privacy" className="underline hover:text-ink-800">
            политикой конфиденциальности
          </Link>
          .
        </div>
      </div>
    </div>
  );
}

function EmailStep({ email, setEmail, onSubmit, busy, error }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="text-xs uppercase tracking-wide text-brand-700 font-bold">
        Вход
      </div>
      <h1 className="text-xl md:text-2xl font-extrabold text-ink-900 mt-1">
        Введите e-mail
      </h1>
      <p className="text-sm text-ink-500 mt-1">
        Пришлём 6-значный код для входа. Без паролей и регистраций.
      </p>

      <label className="block mt-5">
        <div className="text-sm font-semibold text-ink-700 mb-1">E-mail</div>
        <div className="relative">
          <Mail className="w-4 h-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ivan@mail.ru"
            required
            autoFocus
            autoComplete="email"
            inputMode="email"
            className="w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none pl-9 pr-4 py-3 text-sm"
          />
        </div>
      </label>

      {error && <ErrorRow message={error} />}

      <button
        type="submit"
        disabled={!email.includes('@') || busy}
        className="mt-4 w-full rounded-2xl bg-brand-600 hover:bg-brand-700 text-white py-3 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy ? 'Отправляем…' : 'Отправить код'}
      </button>

      <div className="mt-5 flex items-center gap-2 text-[12px] text-ink-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        Соблюдаем 152-ФЗ. Данные хранятся в РФ.
      </div>
    </form>
  );
}

function CodeStep({
  email,
  code,
  setCode,
  onSubmit,
  busy,
  error,
  resendTimer,
  expiresInSec,
  onBack,
  onResend
}) {
  // Автосабмит когда ввели все 6 цифр
  useEffect(() => {
    if (code.length === 6 && !busy) onSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const expiresInMin = Math.round(expiresInSec / 60);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="text-xs uppercase tracking-wide text-brand-700 font-bold">
        Введите код
      </div>
      <h1 className="text-xl md:text-2xl font-extrabold text-ink-900 mt-1">
        Проверьте почту
      </h1>
      <p className="text-sm text-ink-500 mt-1">
        Мы отправили 6-значный код на{' '}
        <span className="font-semibold text-ink-800">{email}</span>
      </p>

      <div className="mt-5">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456"
          maxLength={6}
          autoFocus
          autoComplete="one-time-code"
          inputMode="numeric"
          pattern="\d{6}"
          className="w-full text-center rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none py-4 text-2xl font-black tracking-[0.5em] tabular-nums"
        />
      </div>

      {error && <ErrorRow message={error} />}

      <button
        type="submit"
        disabled={code.length !== 6 || busy}
        className="mt-4 w-full rounded-2xl bg-brand-600 hover:bg-brand-700 text-white py-3 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy ? 'Проверяем…' : 'Войти'}
      </button>

      <div className="mt-4 flex items-center justify-between text-[12px] text-ink-500">
        <button
          type="button"
          onClick={onBack}
          className="hover:text-ink-800 underline"
        >
          Изменить e-mail
        </button>
        {resendTimer > 0 ? (
          <span>Повторно через {resendTimer} сек</span>
        ) : (
          <button
            type="button"
            onClick={onResend}
            className="text-brand-700 hover:text-brand-800 font-semibold"
          >
            Отправить код ещё раз
          </button>
        )}
      </div>

      {expiresInMin > 0 && (
        <div className="mt-3 text-[11px] text-ink-500 text-center">
          Код действует {expiresInMin} мин · Проверьте папку «Спам», если не пришло
        </div>
      )}
    </form>
  );
}

function ErrorRow({ message }) {
  return (
    <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 ring-1 ring-rose-200 px-3 py-2 text-[13px] text-rose-800">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <div>{message}</div>
    </div>
  );
}
