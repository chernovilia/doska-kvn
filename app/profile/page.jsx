'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  ChevronRight,
  LogOut,
  Settings,
  ShieldCheck,
  Star,
  Pencil,
  User as UserIcon,
  ShoppingBag,
  MapPin
} from 'lucide-react';

import VkIcon from '@/components/icons/VkIcon';
import BottomNav from '@/components/BottomNav';
import AdCard from '@/components/AdCard';
import PostAdModal from '@/components/PostAdModal';
import SettingsEditModal from '@/components/SettingsEditModal';
import BumpButton from '@/components/BumpButton';
import { useAuth } from '@/lib/auth';
import { getCity } from '@/data/regions';

import { getMyAds, getReviews, deleteAd } from '@/lib/api';
import { formatRelative } from '@/lib/format';

const TABS = [
  { id: 'ads', name: 'Объявления', icon: ShoppingBag },
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
  const router = useRouter();
  const search = useSearchParams();
  const initialTab = search.get('tab') || 'ads';
  const [tab, setTab] = useState(initialTab);

  const { user: me, ready, signOut } = useAuth();
  const [myAds, setMyAds] = useState([]);
  const [postOpen, setPostOpen] = useState(false);

  // На MVP всегда 'personal'. Бизнес-профили — в разработке.
  const type = 'personal';

  useEffect(() => {
    getMyAds().then(setMyAds).catch(() => setMyAds([]));
  }, [me]);

  useEffect(() => {
    if (ready && !me) {
      router.push('/login?returnTo=/profile');
    }
  }, [ready, me, router]);

  useEffect(() => {
    const t = search.get('tab');
    if (t && t !== tab) setTab(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  if (!me) {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0">
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
            {me.isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 h-10 px-3 rounded-full bg-amber-100 text-amber-900 ring-1 ring-amber-200 hover:bg-amber-200 text-sm font-semibold shadow-card"
                title="Админка"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Админка</span>
              </Link>
            )}
            <button
              className="w-10 h-10 grid place-items-center rounded-full bg-white ring-1 ring-black/5 hover:bg-brand-50 shadow-card"
              aria-label="Уведомления"
            >
              <Bell className="w-4.5 h-4.5 text-ink-800" />
            </button>
            <button
              onClick={async () => {
                await signOut();
                router.push('/');
              }}
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
              {me.avatar ? (
                <img
                  src={me.avatar}
                  alt={me.name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover ring-2 ring-white shadow-card"
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-brand-100 text-brand-700 ring-2 ring-white shadow-card grid place-items-center text-2xl font-black">
                  {(me.name || 'A').slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-lg md:text-xl font-extrabold text-ink-900 truncate">
                    {me.name}
                  </div>
                  {me.verified && (
                    <BadgeCheck className="w-4.5 h-4.5 text-brand-600 shrink-0" />
                  )}
                </div>
                <div className="text-[12px] text-ink-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  {getCity(me.homeCityId)?.name || 'Город не указан'}
                </div>
                {me.vkUrl && (
                  <a
                    href={me.vkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0077FF] hover:underline"
                  >
                    <VkIcon className="w-4 h-4" />
                    {me.name} · ВКонтакте
                  </a>
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-wide text-ink-500 font-bold mb-1.5">
                Тип аккаунта
              </div>
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
              <div className="mt-1 text-[11px] text-ink-500">
                Приватный профиль. Бизнес-аккаунты (мастера, магазины) добавим позже.
              </div>
            </div>

          </div>

          <div className="grid grid-cols-4 border-t border-black/5 text-center">
            <Metric
              value={(me.rating ?? 0).toFixed(1)}
              label="Рейтинг"
              icon={<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
            />
            <Metric value={me.reviewsCount ?? 0} label="Отзывы" />
            <Metric value={me.dealsCount ?? 0} label="Сделки" />
            <Metric value={me.activeAdsCount ?? myAds.length} label="Активных" />
          </div>
        </section>

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
                </button>
              );
            })}
          </div>
        </section>

        <AnimatePresence mode="wait">
          <motion.section
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'ads' && (
              <MyAdsTab
                ads={myAds}
                onPost={() => setPostOpen(true)}
                onReload={() => getMyAds().then(setMyAds).catch(() => {})}
              />
            )}
            {tab === 'reviews' && <ReviewsTab me={me} />}
            {tab === 'settings' && <SettingsTab me={me} />}
          </motion.section>
        </AnimatePresence>
      </main>

      <PostAdModal open={postOpen} onClose={() => setPostOpen(false)} />
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

function MyAdsTab({ ads, onPost, onReload }) {
  const router = useRouter();

  async function handleDelete(ad) {
    if (!window.confirm(`Удалить объявление «${ad.title}»?`)) return;
    try {
      await deleteAd(ad.id);
      onReload?.();
    } catch (err) {
      alert(err.message || 'Не удалось удалить');
    }
  }

  if (ads.length === 0) {
    return (
      <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-8 text-center">
        <div className="mx-auto w-14 h-14 grid place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <div className="mt-3 text-lg font-extrabold text-ink-900">
          У вас пока нет объявлений
        </div>
        <div className="text-sm text-ink-500 mt-1 max-w-sm mx-auto">
          Опубликуйте первое — займёт меньше минуты. Оно появится в общей ленте сразу после публикации.
        </div>
        <button
          onClick={onPost}
          className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-3"
        >
          Создать первое объявление
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-0.5">
        <div className="text-sm font-bold text-ink-900">
          Мои объявления · {ads.length}
        </div>
        <button
          onClick={onPost}
          className="rounded-full bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold px-3 py-1.5"
        >
          + Добавить
        </button>
      </div>
      <div className="text-[11px] text-ink-500 px-0.5 -mt-1">
        Нажми на 🔗 — скопируется ссылка на объявление, чтобы поделиться в
        VK или мессенджере.
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr">
        {ads.map((ad) => (
          <div key={ad.id} className="h-full flex flex-col gap-1.5">
            <div className="flex-1">
              <AdCard
                ad={ad}
                showShare
                onOpen={(a) => router.push(`/ad/${a.id}`)}
                onDelete={handleDelete}
              />
            </div>
            <BumpButton ad={ad} compact />
          </div>
        ))}
      </div>
    </div>
  );
}


function ReviewsTab({ me }) {
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    getReviews().then(setReviews);
  }, []);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4 flex items-center gap-4">
        <div className="text-3xl md:text-4xl font-black text-ink-900">
          {(me.rating ?? 0).toFixed(1)}
          <span className="text-lg md:text-xl text-ink-500">/5</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <div className="text-[12px] text-ink-500 mt-0.5">
            На основе {me.reviewsCount ?? 0} отзывов от покупателей
          </div>
        </div>
        <button className="rounded-full bg-white ring-1 ring-black/10 hover:bg-brand-50 text-sm font-semibold text-ink-800 px-3 py-2">
          Все отзывы <ChevronRight className="w-4 h-4 inline -mr-1" />
        </button>
      </div>

      <ul className="space-y-2">
        {reviews.map((r) => (
          <li key={r.id} className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white grid place-items-center text-xs font-bold">
                {r.fromName[0]}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink-900 truncate">
                  {r.fromName}{' '}
                  <span className="text-ink-500 font-normal">· {r.fromCity}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <div
                className="ml-auto text-[11px] text-ink-500"
                suppressHydrationWarning
              >
                {formatRelative(r.at)}
              </div>
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

function SettingsTab({ me }) {
  const [editKind, setEditKind] = useState(null);

  const phoneHint = (() => {
    if (me.contactMethod === 'phone' && me.phone) return `${me.phone} · показываем`;
    if (me.contactMethod === 'phone') return 'Показываем — но номер не указан';
    return me.phone ? `${me.phone} · только сообщения` : 'Только сообщения на сайте';
  })();

  const rows = [
    { kind: 'personal', label: 'Личные данные', hint: me.name || 'Не заполнено' },
    { kind: 'phone', label: 'Телефон и способ связи', hint: phoneHint },
    { kind: 'city', label: 'Домашний город', hint: getCity(me.homeCityId)?.name || 'Не указан' },
    { kind: null, label: 'Тип аккаунта', hint: 'Личный (приватный)', disabled: true },
    { kind: null, label: 'Способы оплаты', hint: 'Не подключены', disabled: true },
    { kind: 'notifications', label: 'Уведомления', hint: me.notifyEmail ? 'E-mail включён' : 'Отключены' },
    { kind: null, label: 'Правила и политика', hint: 'v. 1.4', disabled: true }
  ];

  return (
    <>
      <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card overflow-hidden">
        <ul>
          {rows.map((r, i) => (
            <li
              key={r.label}
              onClick={() => r.kind && setEditKind(r.kind)}
              className={`px-4 py-3 flex items-center gap-3 ${
                i < rows.length - 1 ? 'border-b border-black/5' : ''
              } ${r.kind ? 'hover:bg-brand-50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink-900">{r.label}</div>
                <div className="text-[12px] text-ink-500 truncate">{r.hint}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-500 ml-auto" />
            </li>
          ))}
        </ul>
      </div>

      <SettingsEditModal
        open={!!editKind}
        kind={editKind}
        me={me}
        onClose={() => setEditKind(null)}
      />
    </>
  );
}
