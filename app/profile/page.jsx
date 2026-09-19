'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  ChevronRight,
  LogOut,
  MessageCircle,
  Settings,
  Star,
  Store,
  User as UserIcon,
  ShoppingBag,
  MapPin,
  Clock
} from 'lucide-react';

import VkIcon from '@/components/icons/VkIcon';
import BottomNav from '@/components/BottomNav';
import AdCard from '@/components/AdCard';
import AdModal from '@/components/AdModal';
import PostAdModal from '@/components/PostAdModal';
import AuthModal from '@/components/AuthModal';

import { ADS } from '@/data/mock';
import { MOCK_USER, MY_AD_IDS, MOCK_CHATS, MOCK_MESSAGES, MOCK_REVIEWS } from '@/data/profile';

const TABS = [
  { id: 'ads', name: 'Объявления', icon: ShoppingBag },
  { id: 'messages', name: 'Сообщения', icon: MessageCircle },
  { id: 'reviews', name: 'Отзывы', icon: Star },
  { id: 'settings', name: 'Настройки', icon: Settings }
];

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const search = useSearchParams();
  const initialTab = search.get('tab') || 'ads';
  const [tab, setTab] = useState(initialTab);
  const [type, setType] = useState(MOCK_USER.type); // personal | shop

  const [openAd, setOpenAd] = useState(null);
  const [postOpen, setPostOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    // синхронизируем таб при переходе с бесконечно нижней навигации
    const t = search.get('tab');
    if (t && t !== tab) setTab(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const myAds = useMemo(
    () => MY_AD_IDS.map((id) => ADS.find((a) => a.id === id)).filter(Boolean),
    []
  );

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      {/* Мини-хедер */}
      <div className="hero-gradient border-b border-black/5">
        <div className="max-w-4xl mx-auto px-4 md:px-6 pt-4 pb-3 flex items-center gap-3">
          <Link
            href="/"
            className="w-10 h-10 grid place-items-center rounded-full bg-white ring-1 ring-black/5 hover:bg-brand-50 shadow-card"
            aria-label="Назад"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-ink-800" />
          </Link>
          <div className="font-black tracking-tight text-lg md:text-xl text-ink-900">
            Профиль
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              className="w-10 h-10 grid place-items-center rounded-full bg-white ring-1 ring-black/5 hover:bg-brand-50 shadow-card"
              aria-label="Уведомления"
            >
              <Bell className="w-4.5 h-4.5 text-ink-800" />
            </button>
            <button
              onClick={() => setAuthOpen(true)}
              className="w-10 h-10 grid place-items-center rounded-full bg-white ring-1 ring-black/5 hover:bg-rose-50 shadow-card"
              aria-label="Выйти"
            >
              <LogOut className="w-4.5 h-4.5 text-ink-800" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-5">
        {/* Карточка пользователя */}
        <section className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card overflow-hidden">
          <div className="p-4 md:p-5">
            <div className="flex items-start gap-3 md:gap-4">
              <img
                src={MOCK_USER.avatar}
                alt={MOCK_USER.name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover ring-2 ring-white shadow-card"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-lg md:text-xl font-extrabold text-ink-900 truncate">
                    {type === 'shop' ? MOCK_USER.shop.name : MOCK_USER.name}
                  </div>
                  {MOCK_USER.verified && (
                    <BadgeCheck className="w-4.5 h-4.5 text-brand-600 shrink-0" />
                  )}
                </div>
                <div className="text-[12px] text-ink-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  {MOCK_USER.cityName}
                  <span className="text-ink-300">·</span>
                  {MOCK_USER.registeredAt}
                </div>
                <a
                  href={MOCK_USER.vkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0077FF] hover:underline"
                >
                  <VkIcon className="w-4 h-4" />
                  {MOCK_USER.name} · ВКонтакте
                </a>
              </div>
            </div>

            {/* Переключатель типа аккаунта */}
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-wide text-ink-500 font-bold mb-1.5">
                Тип аккаунта
              </div>
              <div className="inline-flex bg-slate-100 rounded-full p-1">
                <TypeChip
                  active={type === 'personal'}
                  onClick={() => setType('personal')}
                  icon={UserIcon}
                  label="Пользователь"
                />
                <TypeChip
                  active={type === 'shop'}
                  onClick={() => setType('shop')}
                  icon={Store}
                  label="Магазин"
                />
              </div>
              <div className="mt-1 text-[11px] text-ink-500">
                {type === 'shop'
                  ? 'Публичный профиль магазина с рейтингом и отзывами клиентов.'
                  : 'Приватный профиль обычного пользователя. Отзывы видны только вам.'}
              </div>
            </div>

            {/* Бизнес-инфо */}
            {type === 'shop' && (
              <div className="mt-4 rounded-xl bg-slate-50 ring-1 ring-black/5 p-3 text-sm text-ink-700 space-y-1">
                <div>{MOCK_USER.shop.description}</div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {MOCK_USER.shop.categories.map((c) => (
                    <span
                      key={c}
                      className="text-[11px] font-semibold text-brand-700 bg-brand-50 ring-1 ring-brand-200 px-2 py-0.5 rounded-full"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <div className="text-[12px] text-ink-500 mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {MOCK_USER.shop.hours}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {MOCK_USER.shop.address}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Метрики */}
          <div className="grid grid-cols-4 border-t border-black/5 text-center">
            <Metric
              value={MOCK_USER.rating.toFixed(1)}
              label="Рейтинг"
              icon={<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
            />
            <Metric value={MOCK_USER.reviewsCount} label="Отзывы" />
            <Metric value={MOCK_USER.dealsCount} label="Сделки" />
            <Metric value={MOCK_USER.activeAdsCount} label="Активных" />
          </div>
        </section>

        {/* Табы */}
        <section>
          <div className="flex gap-1 md:gap-2 overflow-x-auto no-scrollbar">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold ring-1 ${
                    active
                      ? 'bg-brand-600 text-white ring-brand-600'
                      : 'bg-white text-ink-700 ring-black/10 hover:bg-brand-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.name}
                  {t.id === 'messages' && (
                    <span
                      className={`min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full text-[10px] font-bold ${
                        active ? 'bg-white text-brand-700' : 'bg-accent-500 text-white'
                      }`}
                    >
                      3
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Контент */}
        <AnimatePresence mode="wait">
          <motion.section
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'ads' && (
              <MyAdsTab ads={myAds} onOpen={setOpenAd} onPost={() => setPostOpen(true)} />
            )}
            {tab === 'messages' && <MessagesTab />}
            {tab === 'reviews' && <ReviewsTab />}
            {tab === 'settings' && <SettingsTab type={type} />}
          </motion.section>
        </AnimatePresence>
      </main>

      <AdModal ad={openAd} onClose={() => setOpenAd(null)} />
      <PostAdModal open={postOpen} onClose={() => setPostOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <BottomNav onPost={() => setPostOpen(true)} />
    </div>
  );
}

function TypeChip({ active, onClick, icon: Icon, label }) {
  return (
    <button
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

function Metric({ value, label, icon }) {
  return (
    <div className="py-3 px-2">
      <div className="flex items-center justify-center gap-1 text-base md:text-lg font-black text-ink-900">
        {icon}
        {value}
      </div>
      <div className="text-[11px] text-ink-500 mt-0.5">{label}</div>
    </div>
  );
}

function MyAdsTab({ ads, onOpen, onPost }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-0.5">
        <div className="text-sm font-bold text-ink-900">Мои объявления · {ads.length}</div>
        <button
          onClick={onPost}
          className="rounded-full bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold px-3 py-1.5"
        >
          + Добавить
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr">
        {ads.map((ad) => (
          <div key={ad.id} className="h-full">
            <AdCard ad={ad} onOpen={onOpen} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesTab() {
  const [openChat, setOpenChat] = useState(null);
  const active = MOCK_CHATS.find((c) => c.id === openChat);
  const msgs = active ? MOCK_MESSAGES[active.id] || [] : [];

  return (
    <div className="grid md:grid-cols-[320px_1fr] gap-3">
      {/* Список чатов */}
      <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-black/5 text-sm font-bold text-ink-900">
          Чаты
        </div>
        <ul className="max-h-[60vh] overflow-y-auto">
          {MOCK_CHATS.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setOpenChat(c.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-brand-50 ${
                  openChat === c.id ? 'bg-brand-50' : ''
                }`}
              >
                <img
                  src={c.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-black/5"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-ink-900 truncate">
                      {c.name}
                    </div>
                    <div className="ml-auto text-[11px] text-ink-500 shrink-0">
                      {c.time}
                    </div>
                  </div>
                  <div className="text-[12px] text-ink-500 truncate">
                    <span className="text-brand-700">{c.ad}</span> · {c.last}
                  </div>
                </div>
                {c.unread > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-accent-500 text-white text-[10px] font-bold">
                    {c.unread}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Окно переписки */}
      <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card overflow-hidden min-h-[60vh] flex flex-col">
        {active ? (
          <>
            <div className="px-4 py-3 border-b border-black/5 flex items-center gap-3">
              <img
                src={active.avatar}
                alt=""
                className="w-9 h-9 rounded-full object-cover ring-1 ring-black/5"
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink-900 truncate">
                  {active.name}
                </div>
                <div className="text-[11px] text-ink-500 truncate">
                  По объявлению: <span className="text-brand-700">{active.ad}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-2 overflow-y-auto bg-slate-50">
              {msgs.length ? (
                msgs.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        m.from === 'me'
                          ? 'bg-brand-600 text-white rounded-br-sm'
                          : 'bg-white ring-1 ring-black/5 text-ink-900 rounded-bl-sm'
                      }`}
                    >
                      <div>{m.text}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          m.from === 'me' ? 'text-white/70' : 'text-ink-500'
                        }`}
                      >
                        {m.time}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-ink-500 py-10">
                  Пока нет сообщений — начните переписку
                </div>
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Демо: отправка сообщения');
              }}
              className="p-3 border-t border-black/5 flex items-center gap-2"
            >
              <input
                placeholder="Напишите сообщение…"
                className="flex-1 rounded-full bg-slate-100 focus:bg-white ring-1 ring-transparent focus:ring-brand-400 outline-none px-4 py-2.5 text-sm"
              />
              <button
                type="submit"
                className="rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2.5"
              >
                Отправить
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 grid place-items-center text-center p-8">
            <div>
              <div className="text-4xl">💬</div>
              <div className="mt-2 font-extrabold text-ink-900">Выберите чат</div>
              <div className="text-sm text-ink-500 max-w-xs mx-auto">
                Общайтесь с покупателями и мастерами прямо в приложении — без обмена
                телефонами
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewsTab() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4 flex items-center gap-4">
        <div className="text-3xl md:text-4xl font-black text-ink-900">
          {MOCK_USER.rating.toFixed(1)}
          <span className="text-lg md:text-xl text-ink-500">/5</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <div className="text-[12px] text-ink-500 mt-0.5">
            На основе {MOCK_USER.reviewsCount} отзывов от покупателей
          </div>
        </div>
        <button className="rounded-full bg-white ring-1 ring-black/10 hover:bg-brand-50 text-sm font-semibold text-ink-800 px-3 py-2">
          Все отзывы <ChevronRight className="w-4 h-4 inline -mr-1" />
        </button>
      </div>

      <ul className="space-y-2">
        {MOCK_REVIEWS.map((r) => (
          <li key={r.id} className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white grid place-items-center text-xs font-bold">
                {r.from[0]}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink-900 truncate">
                  {r.from} · <span className="text-ink-500 font-normal">{r.fromCity}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <div className="ml-auto text-[11px] text-ink-500">{r.time}</div>
            </div>
            <div className="mt-2 text-sm text-ink-800">{r.text}</div>
            <div className="mt-1 text-[11px] text-ink-500">
              По объявлению: <span className="text-brand-700">{r.adTitle}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SettingsTab({ type }) {
  const rows = [
    { label: 'Личные данные', hint: MOCK_USER.name },
    { label: 'Телефон', hint: MOCK_USER.phone },
    { label: 'Город по умолчанию', hint: MOCK_USER.cityName },
    {
      label: 'Тип аккаунта',
      hint: type === 'shop' ? 'Магазин (публичный)' : 'Пользователь (приватный)'
    },
    { label: 'Способы оплаты', hint: 'Не подключены' },
    { label: 'Уведомления', hint: 'Push + e-mail' },
    { label: 'Правила и политика', hint: 'v. 1.4' }
  ];
  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card overflow-hidden">
      <ul>
        {rows.map((r, i) => (
          <li
            key={r.label}
            className={`px-4 py-3 flex items-center gap-3 ${
              i < rows.length - 1 ? 'border-b border-black/5' : ''
            } hover:bg-brand-50 cursor-pointer`}
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink-900">{r.label}</div>
              <div className="text-[12px] text-ink-500">{r.hint}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-ink-500 ml-auto" />
          </li>
        ))}
      </ul>
    </div>
  );
}
