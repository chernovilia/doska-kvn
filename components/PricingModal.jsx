'use client';

import { Check, Crown, Rocket, Sparkles } from 'lucide-react';
import Modal from './Modal';

const PLANS = [
  {
    id: 'start',
    name: 'Старт',
    price: '0 ₽',
    period: 'бесплатно',
    accent: 'bg-slate-50 ring-black/10',
    icon: Sparkles,
    features: [
      'До 5 активных объявлений',
      'Публикация во всех 3 городах',
      'Базовая AI-модерация',
      'Стандартная выдача'
    ],
    cta: 'Начать бесплатно'
  },
  {
    id: 'top',
    name: 'ТОП-Мастер',
    price: '500 ₽',
    period: '/мес',
    accent: 'bg-brand-50 ring-brand-300',
    highlight: true,
    icon: Crown,
    features: [
      'Плашка «TOP» и золотая рамка',
      'Приоритет в поиске',
      'Значок «Проверен через Подслушано»',
      'Аналитика просмотров и звонков'
    ],
    cta: 'Подключить через ЮKassa'
  },
  {
    id: 'kvn',
    name: 'Сквозной КВН',
    price: '1 200 ₽',
    period: '/мес',
    accent: 'bg-amber-50 ring-amber-300',
    icon: Rocket,
    features: [
      'Одновременно в Кулебаках, Выксе и Навашино',
      'Бейдж «Официальный партнёр КВН»',
      'Публикация в Telegram и VK-каналах',
      'Персональный менеджер'
    ],
    cta: 'Подключить через ЮKassa'
  }
];

export default function PricingModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} size="xl">
      <div className="p-5 md:p-8">
        <div className="text-xs uppercase tracking-wide text-brand-700 font-bold">
          Для бизнеса
        </div>
        <h3 className="text-2xl md:text-3xl font-extrabold text-ink-900 mt-1">
          Пакеты продвижения на «Доска<span className="brand-slash">/</span>КВН»
        </h3>
        <p className="text-sm text-ink-500 mt-1">
          Быстрая монетизация: комиссия от подписок и промо-размещений.
        </p>

        <div className="mt-6 grid md:grid-cols-3 gap-3">
          {PLANS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className={`relative rounded-3xl p-5 ring-1 ${p.accent} flex flex-col`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 top-badge text-[11px] font-bold px-2 py-1 rounded-full shadow">
                    Популярный
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-brand-700" />
                  <div className="font-extrabold text-ink-900">{p.name}</div>
                </div>
                <div className="mt-3 flex items-end gap-1">
                  <div className="text-3xl font-black text-ink-900">{p.price}</div>
                  <div className="text-sm text-ink-500 mb-1">{p.period}</div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-ink-700">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 mt-[2px]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => alert(`Демо: интеграция с ЮKassa. План «${p.name}»`)}
                  className={`mt-5 w-full rounded-2xl py-3 font-semibold text-sm ${
                    p.highlight
                      ? 'bg-brand-600 hover:bg-brand-700 text-white'
                      : 'bg-white hover:bg-brand-50 ring-1 ring-black/10 text-ink-900'
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 ring-1 ring-black/5 p-4 text-xs text-ink-500">
          Дополнительно: разовое поднятие объявления — 39 ₽, «Срочно» — 79 ₽, VIP на 7 дней — 199 ₽.
        </div>
      </div>
    </Modal>
  );
}
