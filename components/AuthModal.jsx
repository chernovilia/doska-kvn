'use client';

import { CheckCircle2, ShieldCheck } from 'lucide-react';
import Modal from './Modal';
import VkIcon from './icons/VkIcon';
import { useState } from 'react';

export default function AuthModal({ open, onClose }) {
  const [state, setState] = useState('idle'); // idle | loading | done

  function login() {
    setState('loading');
    setTimeout(() => setState('done'), 900);
  }

  function close() {
    onClose?.();
    setTimeout(() => setState('idle'), 300);
  }

  return (
    <Modal open={open} onClose={close} size="sm">
      <div className="p-6">
        <div className="text-xs uppercase tracking-wide text-brand-700 font-bold">Вход</div>
        <h3 className="text-xl font-extrabold text-ink-900 mt-1">
          Войдите через ВКонтакте
        </h3>
        <p className="text-sm text-ink-500 mt-1">
          Без паролей и лишних форм. Данные защищены — 152-ФЗ, хранение в РФ.
        </p>

        {state === 'done' ? (
          <div className="mt-6 text-center py-4">
            <div className="mx-auto w-14 h-14 grid place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="mt-3 font-extrabold text-ink-900">Готово!</div>
            <div className="text-sm text-ink-500">Вы вошли через ВКонтакте</div>
            <button
              onClick={close}
              className="mt-4 w-full rounded-2xl bg-brand-600 hover:bg-brand-700 text-white py-3 font-semibold"
            >
              Перейти в кабинет
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <button
              disabled={state === 'loading'}
              onClick={login}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0077FF] hover:bg-[#0069e0] text-white py-3 font-semibold disabled:opacity-70"
            >
              <VkIcon className="w-5 h-5" />
              {state === 'loading' ? 'Открываем ВКонтакте…' : 'Войти через ВКонтакте'}
            </button>

            <div className="mt-4 flex items-center gap-2 text-[12px] text-ink-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Мы не публикуем ничего от вашего имени в VK.
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
