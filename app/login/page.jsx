'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';
import VkIcon from '@/components/icons/VkIcon';
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
  const { signInWithEmail, signInWithVK } = useAuth();

  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(null); // 'vk' | 'email' | null
  const [done, setDone] = useState(false);

  async function loginVK() {
    setBusy('vk');
    await signInWithVK();
    setDone(true);
    setTimeout(() => router.push(returnTo), 700);
  }

  async function loginEmail(e) {
    e.preventDefault();
    if (!email.includes('@')) return;
    setBusy('email');
    await signInWithEmail(email);
    setDone(true);
    setTimeout(() => router.push(returnTo), 700);
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
          {done ? (
            <div className="text-center py-6">
              <div className="mx-auto w-14 h-14 grid place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="mt-3 font-extrabold text-ink-900">Готово!</div>
              <div className="text-sm text-ink-500">Открываем ваш кабинет…</div>
            </div>
          ) : (
            <>
              <div className="text-xs uppercase tracking-wide text-brand-700 font-bold">
                Вход
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-ink-900 mt-1">
                Войдите одним кликом
              </h1>
              <p className="text-sm text-ink-500 mt-1">
                Через ВКонтакте — без паролей. Или по e-mail — если предпочитаете.
              </p>

              <button
                onClick={loginVK}
                disabled={busy === 'vk'}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0077FF] hover:bg-[#0069e0] text-white py-3 font-semibold disabled:opacity-70"
              >
                <VkIcon className="w-5 h-5" />
                {busy === 'vk' ? 'Открываем ВКонтакте…' : 'Войти через ВКонтакте'}
              </button>

              <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wide text-ink-500 font-bold">
                <div className="flex-1 h-px bg-slate-200" />
                или
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <form onSubmit={loginEmail} className="space-y-3">
                <label className="block">
                  <div className="text-sm font-semibold text-ink-700 mb-1">
                    E-mail
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ivan@mail.ru"
                      required
                      className="w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none pl-9 pr-4 py-3 text-sm"
                    />
                  </div>
                </label>
                <button
                  type="submit"
                  disabled={!email.includes('@') || busy === 'email'}
                  className="w-full rounded-2xl bg-brand-600 hover:bg-brand-700 text-white py-3 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {busy === 'email' ? 'Отправляем ссылку…' : 'Продолжить'}
                </button>
                <p className="text-[11px] text-ink-500 text-center">
                  Пришлём ссылку для входа. Пароль не нужен.
                </p>
              </form>

              <div className="mt-5 flex items-center gap-2 text-[12px] text-ink-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Соблюдаем 152-ФЗ. Данные хранятся в РФ.
              </div>
            </>
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
