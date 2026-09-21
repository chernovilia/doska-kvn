'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Modal from './Modal';
import { Hammer, Store, Check, Sparkles, Info } from 'lucide-react';

/**
 * Модалка активации бизнес-аккаунта.
 * Открывается при клике на «Бизнес» в тумблере профиля.
 *
 * Шаги:
 * 1) Выбрать подтип (Мастер услуг / Магазин)
 * 2) Ввести название (ИП, ООО, магазин, мастерская — что угодно)
 * 3) Активировать
 *
 * onSubmit({ kind: 'master' | 'shop', name: string })
 */
export default function BusinessSetupModal({
  open,
  currentKind,
  currentName,
  onClose,
  onSubmit
}) {
  const [kind, setKind] = useState('master');
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) {
      setKind(currentKind === 'shop' ? 'shop' : 'master');
      setName(currentName || '');
    }
  }, [open, currentKind, currentName]);

  const canSubmit = kind && name.trim().length >= 3;

  function submit() {
    if (!canSubmit) return;
    onSubmit?.({ kind, name: name.trim() });
    onClose?.();
  }

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="p-5 md:p-6">
        <div className="text-xs uppercase tracking-wide text-brand-700 font-bold">
          Активация бизнес-аккаунта
        </div>
        <h3 className="text-xl md:text-2xl font-extrabold text-ink-900 mt-1">
          Кем вы работаете в КВН?
        </h3>
        <p className="text-sm text-ink-500 mt-1">
          После активации ваш профиль станет публичным на{' '}
          <span className="font-semibold">/u/[slug]</span> — с рейтингом,
          отзывами и витриной ваших объявлений.
        </p>

        {/* Шаг 1: выбор подтипа */}
        <div className="mt-5">
          <div className="text-[11px] uppercase tracking-wide text-ink-500 font-bold mb-2">
            Тип бизнеса
          </div>
          <div className="grid grid-cols-1 gap-2">
            <KindCard
              active={kind === 'master'}
              onClick={() => setKind('master')}
              icon={Hammer}
              label="Мастер услуг"
              hint="Электрик, сантехник, репетитор, грузчик, парикмахер"
              accent="emerald"
            />
            <KindCard
              active={kind === 'shop'}
              onClick={() => setKind('shop')}
              icon={Store}
              label="Магазин или бизнес"
              hint="Автосервис, ателье, кафе, ремонт техники, ИП/ООО"
              accent="brand"
            />
          </div>
        </div>

        {/* Шаг 2: название */}
        <div className="mt-5">
          <label className="text-[11px] uppercase tracking-wide text-ink-500 font-bold mb-2 block">
            Название вашего дела
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              kind === 'master' ? 'Например: Мастерская Ильи' : 'Например: ИП Иванов / Автосервис «Волна»'
            }
            maxLength={60}
            autoFocus
            className="w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-sm"
          />
          <div className="mt-1 text-[11px] text-ink-500 flex items-center gap-1.5">
            <Info className="w-3 h-3" />
            Можно ФИО с «ИП», название ООО или разговорное имя ({name.length}/60)
          </div>
        </div>

        {/* Info-плашка */}
        <div className="mt-4 rounded-2xl bg-brand-50 ring-1 ring-brand-200 p-3 text-[12px] text-brand-800">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              После активации остальные поля (описание, часы, адрес, фото)
              можно будет заполнить в настройках профиля. Ваши старые
              объявления сохраняются, но новые будут публиковаться от имени
              бизнеса.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={onClose}
            className="rounded-2xl bg-white ring-1 ring-black/10 px-4 py-3 text-sm font-semibold text-ink-700 hover:bg-slate-50"
          >
            Отмена
          </button>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="ml-auto inline-flex items-center gap-1.5 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white px-4 py-3 text-sm font-semibold"
          >
            <Check className="w-4 h-4" />
            Активировать бизнес
          </button>
        </div>
      </div>
    </Modal>
  );
}

function KindCard({ active, onClick, icon: Icon, label, hint, accent }) {
  const activeCls =
    accent === 'emerald'
      ? 'bg-emerald-50 ring-emerald-300'
      : 'bg-brand-50 ring-brand-300';
  const iconCls =
    accent === 'emerald' ? 'text-emerald-700' : 'text-brand-700';
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1 transition ${
        active ? activeCls : 'bg-white ring-black/10 hover:bg-slate-50'
      }`}
    >
      <div
        className={`w-10 h-10 grid place-items-center rounded-xl bg-white ring-1 ring-black/5 ${iconCls}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-ink-900">{label}</div>
        <div className="text-[12px] text-ink-500 truncate">{hint}</div>
      </div>
      {active && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`w-6 h-6 grid place-items-center rounded-full ${
            accent === 'emerald' ? 'bg-emerald-600' : 'bg-brand-600'
          } text-white`}
        >
          <Check className="w-4 h-4" />
        </motion.div>
      )}
    </button>
  );
}
