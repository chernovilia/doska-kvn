'use client';

import Avatar from '@/components/Avatar';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck,
  ChevronRight,
  LogOut,
  Settings,
  ShieldCheck,
  Star,
  User as UserIcon,
  ShoppingBag,
  MapPin,
  Briefcase,
  LifeBuoy
} from 'lucide-react';

import VkIcon from '@/components/icons/VkIcon';
import BottomNav from '@/components/BottomNav';
import PageHeader, { HeaderIconButton } from '@/components/PageHeader';
import NotificationsButton from '@/components/NotificationsButton';
import AdCard from '@/components/AdCard';
import AdCardSkeleton from '@/components/AdCardSkeleton';
import PostAdModal from '@/components/PostAdModal';
import SettingsEditModal from '@/components/SettingsEditModal';
import BumpButton from '@/components/BumpButton';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/auth';
import { getCity } from '@/data/regions';

import { getMyAds, getUserReviews, deleteAd } from '@/lib/api';
import { RatingSummary, ReviewsList } from '@/components/Reviews';
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
  const { toast } = useToast();
  const [myAds, setMyAds] = useState(null); // null — ещё грузятся
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
      <PageHeader
        title="Профиль"
        maxWidth="max-w-4xl"
        right={
          <>
            {me.isAdmin && (
              <Link href="/admin" className="btn-outline h-9 px-3 text-sm mr-1" title="Админка">
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Админка</span>
              </Link>
            )}
            <NotificationsButton />
            <HeaderIconButton
              label="Выйти"
              onClick={async () => {
                if (!window.confirm('Выйти из аккаунта?')) return;
                await signOut();
                router.push('/');
              }}
            >
              <LogOut className="w-5 h-5" />
            </HeaderIconButton>
          </>
        }
      />

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-5">
        {/* Карточка пользователя */}
        <section className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card overflow-hidden">
          <div className="p-4 md:p-5">
            <div className="flex items-start gap-3 md:gap-4">
              <Avatar person={me} size="xl" className="ring-2 ring-white shadow-card" />
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
                <span className="chip chip-on">
                  <UserIcon className="w-4 h-4" />
                  Личный
                </span>
                {/* Бизнес-аккаунт пока в разработке: плашка видна, но выбрать нельзя */}
                <button
                  type="button"
                  aria-disabled="true"
                  onClick={() => toast('Бизнес-аккаунты в разработке — скоро')}
                  className="chip opacity-50"
                >
                  <Briefcase className="w-4 h-4" />
                  Бизнес
                </button>
              </div>
              <div className="mt-1 text-[11px] text-ink-500">
                Другие видят ваше имя, город, оценки и опубликованные объявления — почту и телефон нет.{' '}
                <Link href={`/user/${me.id}`} className="font-semibold text-brand-700 hover:underline">
                  Моя страница продавца
                </Link>
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
            <Metric value={myAds ? myAds.filter((a) => a.status === 'approved').length : '…'} label="В ленте" />
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
                  className={`chip relative shrink-0 ${active ? 'chip-on' : ''}`}
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

  async function handleDelete(ad) {
    if (!window.confirm(`Удалить объявление «${ad.title}»?`)) return;
    try {
      await deleteAd(ad.id);
      onReload?.();
    } catch (err) {
      alert(err.message || 'Не удалось удалить');
    }
  }

  if (ads === null) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <AdCardSkeleton key={i} />
        ))}
      </div>
    );
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
          className="btn-outline h-9 px-3.5 text-sm"
        >
          + Добавить
        </button>
      </div>
      {/* Без auto-rows-fr: под карточкой кнопка или подпись разной высоты, и соседняя
          карточка растягивалась до высоты самой высокой ячейки ряда */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-start">
        {ads.map((ad) => (
          <div key={ad.id} className="flex flex-col gap-1.5">
            <div>
              <AdCard
                ad={ad}
                showShare
                showStatus
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
  const [reviews, setReviews] = useState(null);
  useEffect(() => {
    getUserReviews(me.id)
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [me.id]);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4">
        <RatingSummary rating={me.rating ?? 0} count={me.reviewsCount ?? 0} />
        <p className="mt-2 text-[12px] text-ink-500">
          Отзыв оставляет собеседник после переписки по объявлению — когда вы оба написали хотя бы по сообщению.
        </p>
      </div>
      {reviews === null ? (
        <div className="h-24 rounded-2xl bg-white ring-1 ring-black/5 animate-pulse" />
      ) : (
        <ReviewsList reviews={reviews} empty="Отзывов пока нет." />
      )}
    </div>
  );
}

function SettingsTab({ me }) {
  const router = useRouter();
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
    { href: '/terms', label: 'Правила и политика', hint: 'Условия использования и обработка данных' }
  ];

  return (
    <>
      {/* Помощь — отдельной яркой карточкой: обращение уходит администрации */}
      <Link
        href="/help"
        className="mb-3 flex items-center gap-3 rounded-2xl bg-accent-50 ring-1 ring-accent-300 p-4 hover:bg-accent-100/60"
      >
        <span className="w-11 h-11 rounded-2xl bg-accent-500 text-white grid place-items-center shrink-0">
          <LifeBuoy className="w-6 h-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-ink-900">Помощь</span>
          <span className="block text-[13px] text-ink-700">Вопрос, проблема или жалоба — напишите нам, ответим здесь и на почту</span>
        </span>
        <ChevronRight className="w-5 h-5 text-ink-500 shrink-0" />
      </Link>

      <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card overflow-hidden">
        <ul>
          {rows.map((r, i) => (
            <li
              key={r.label}
              onClick={() => (r.kind ? setEditKind(r.kind) : r.href ? router.push(r.href) : null)}
              className={`px-4 py-3 flex items-center gap-3 ${
                i < rows.length - 1 ? 'border-b border-black/5' : ''
              } ${r.kind || r.href ? 'hover:bg-brand-50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
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
