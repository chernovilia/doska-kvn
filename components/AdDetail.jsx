'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Crown,
  ExternalLink,
  Flame,
  Flag,
  Heart,
  Home,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Shield,
  Star,
  Trash2
} from 'lucide-react';
import { cityName, SECTIONS, deleteAd } from '@/lib/api';
import { formatPrice, formatRelative, formatEventDate } from '@/lib/format';
import { accountTypeLabel, accountTypeEmoji, accountTypeBadgeClass, isBusiness } from '@/lib/accountType';
import { useAuth } from '@/lib/auth';
import { shareOrCopy } from '@/lib/share';
import { useToast } from './Toast';
import AdCard from './AdCard';
import BottomNav from './BottomNav';
import Footer from './Footer';
import PostAdModal from './PostAdModal';

export default function AdDetail({ ad, similar = [] }) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const { toast } = useToast();
  const authed = ready && !!user;
  const [phoneShown, setPhoneShown] = useState(false);
  const [liked, setLiked] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [postOpen, setPostOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isOwner = authed && ad.authorId === user.id;

  const gallery = ad.gallery && ad.gallery.length ? ad.gallery : ad.image ? [ad.image] : [];
  const isEvent = ad.section === 'events';
  const sectionName = SECTIONS.find((s) => s.id === ad.section)?.name;
  const authorType = ad.authorType || ad.author?.type;
  const authorTypeIsBiz = isBusiness(authorType);

  function loginRedirect() {
    router.push(`/login?returnTo=/ad/${ad.id}`);
  }

  function onWrite() {
    if (!authed) return loginRedirect();
    router.push(`/messages?chat=new-${ad.id}&ad=${ad.id}`);
  }

  function onShowPhone() {
    if (!authed) return loginRedirect();
    setPhoneShown(true);
  }

  async function onDelete() {
    if (!window.confirm(`Удалить объявление «${ad.title}»? Вернуть его будет нельзя.`)) return;
    setDeleting(true);
    try {
      await deleteAd(ad.id);
      toast('Объявление удалено');
      router.push('/profile');
    } catch (err) {
      toast(err.message || 'Не удалось удалить', { kind: 'error' });
      setDeleting(false);
    }
  }

  async function onShare() {
    const status = await shareOrCopy({
      url: `/ad/${ad.id}`,
      title: ad.title,
      text: `${ad.title} — ${formatPrice(ad)}`
    });
    if (status === 'copied') toast('Ссылка скопирована');
    else if (status === 'shared') toast('Отправлено');
    else if (status === 'error') toast('Не удалось скопировать', { kind: 'error' });
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
      {/* Верхняя навигация */}
      <div className="hero-gradient border-b border-black/5">
        <div className="max-w-5xl mx-auto px-4 md:px-6 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 grid place-items-center rounded-full bg-white ring-1 ring-black/5 hover:bg-brand-50 shadow-card"
            aria-label="Назад"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-ink-800" />
          </button>

          {/* Хлебные крошки — только на десктопе */}
          <nav className="hidden md:flex items-center gap-1.5 text-[13px] text-ink-500 min-w-0">
            <Link href="/" className="hover:text-brand-700 inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Доска/КВН
            </Link>
            <span>›</span>
            <Link href={`/${ad.city}`} className="hover:text-brand-700 truncate">
              {cityName(ad.city)}
            </Link>
            <span>›</span>
            <span className="text-ink-700 font-medium truncate">{sectionName}</span>
          </nav>

          <button
            onClick={onShare}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-black/5 hover:bg-brand-50 shadow-card px-3 py-2 text-sm font-semibold text-ink-800"
          >
            <Share2 className="w-4 h-4 text-brand-600" />
            <span className="hidden sm:inline">Поделиться</span>
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-0 md:px-6 py-0 md:py-6">
        <div className="md:grid md:grid-cols-[1.4fr_1fr] md:gap-6">
          {/* Левая колонка — галерея */}
          <div className="md:sticky md:top-4 md:self-start">
            <div className="relative aspect-[4/3] bg-slate-100 md:rounded-2xl overflow-hidden shadow-card">
              {gallery[photoIdx] ? (
                <img
                  src={gallery[photoIdx]}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-ink-500">
                  Без фото
                </div>
              )}

              {/* Плашки */}
              <div className="absolute top-3 left-3 flex flex-col items-start gap-1">
                {ad.top && (
                  <span className="top-badge inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full shadow">
                    <Crown className="w-3 h-3" /> TOP
                  </span>
                )}
                {ad.urgent && (
                  <span className="inline-flex items-center gap-1 bg-accent-500 text-white text-[11px] font-bold px-2 py-1 rounded-full shadow">
                    <Flame className="w-3 h-3" /> Срочно
                  </span>
                )}
                {authorTypeIsBiz && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ring-1 shadow ${accountTypeBadgeClass(authorType)}`}
                  >
                    <span>{accountTypeEmoji(authorType)}</span>
                    {accountTypeLabel(authorType)}
                  </span>
                )}
              </div>

              {/* Стрелки */}
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={() => setPhotoIdx((i) => (i - 1 + gallery.length) % gallery.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-full bg-white/90 shadow-card ring-1 ring-black/5 hover:bg-white"
                    aria-label="Предыдущее фото"
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => setPhotoIdx((i) => (i + 1) % gallery.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-full bg-white/90 shadow-card ring-1 ring-black/5 hover:bg-white"
                    aria-label="Следующее фото"
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </>
              )}

              {/* Избранное */}
              <button
                onClick={() => setLiked((v) => !v)}
                className="absolute top-3 right-3 w-10 h-10 grid place-items-center rounded-full bg-white/95 shadow-card ring-1 ring-black/5"
                aria-label="В избранное"
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-rose-500 text-rose-500' : 'text-ink-700'}`} />
              </button>

              {/* Счётчик фото */}
              {gallery.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[11px] font-semibold px-2 py-1 rounded-full">
                  {photoIdx + 1} / {gallery.length}
                </div>
              )}
            </div>

            {/* Миниатюры */}
            {gallery.length > 1 && (
              <div className="p-3 flex gap-2 overflow-x-auto no-scrollbar md:mt-2 md:p-0">
                {gallery.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIdx(i)}
                    className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden ring-2 ${
                      i === photoIdx ? 'ring-brand-500' : 'ring-transparent'
                    }`}
                  >
                    <img src={g} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Правая колонка — детали */}
          <div className="p-4 md:p-0 space-y-5">
            <div>
              <div className="text-[12px] text-ink-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                {ad.address || cityName(ad.city)}
                <span className="text-ink-300">·</span>
                <span suppressHydrationWarning>
                  {isEvent ? formatEventDate(ad.eventDate) : formatRelative(ad.createdAt)}
                </span>
              </div>
              <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-ink-900 leading-tight">
                {ad.title}
              </h1>
              <div className="mt-3 text-3xl font-black text-brand-700">
                {formatPrice(ad)}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {ad.verified && (
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 px-2 py-1 rounded-full">
                    <BadgeCheck className="w-3.5 h-3.5" /> Проверен через «Подслушано»
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700 bg-brand-50 ring-1 ring-brand-200 px-2 py-1 rounded-full">
                  <Shield className="w-3.5 h-3.5" /> Прошло модерацию
                </span>
                {isEvent && ad.eventDate && (
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-amber-700 bg-amber-50 ring-1 ring-amber-200 px-2 py-1 rounded-full">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatEventDate(ad.eventDate)}
                  </span>
                )}
              </div>
            </div>

            {/* Описание */}
            {ad.description && (
              <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4">
                <div className="text-[11px] uppercase tracking-wide text-ink-500 font-bold mb-1.5">
                  Описание
                </div>
                <p className="text-sm text-ink-800 leading-relaxed whitespace-pre-line">
                  {ad.description}
                </p>
              </div>
            )}

            {/* Автор */}
            <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4">
              <div className="flex items-center gap-3">
                {ad.author?.avatar ? (
                  <img
                    src={ad.author.avatar}
                    alt={ad.author.name}
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-black/5"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-600 text-white grid place-items-center text-lg font-bold">
                    {ad.author?.name?.[0] || '?'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="text-sm font-semibold text-ink-900 truncate">
                      {ad.author?.name}
                    </div>
                    {ad.author?.verified && (
                      <BadgeCheck className="w-4 h-4 text-brand-600 shrink-0" />
                    )}
                  </div>
                  <div className="text-[12px] text-ink-500 flex items-center gap-2 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {ad.author?.rating?.toFixed?.(1) || '—'}
                    <span className="text-ink-300">·</span>
                    {ad.author?.dealsCount ?? 0} сделок
                  </div>
                </div>
                {authorTypeIsBiz && ad.author?.businessProfile?.slug && (
                  <Link
                    href={`/u/${ad.author.businessProfile.slug}`}
                    className="text-[12px] font-semibold text-brand-700 hover:text-brand-800 shrink-0"
                  >
                    Профиль →
                  </Link>
                )}
              </div>
            </div>

            {isOwner ? (
              <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-ink-900">Это ваше объявление</div>
                  <OwnerStatus status={ad.status} />
                </div>
                <button
                  onClick={onDelete}
                  disabled={deleting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white ring-1 ring-rose-200 text-rose-700 hover:bg-rose-50 font-semibold px-4 py-3 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Удаляем…' : 'Удалить объявление'}
                </button>
              </div>
            ) : (
            <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={onWrite}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-3"
                >
                  <MessageCircle className="w-4 h-4" />
                  Написать
                </button>
                <button
                  onClick={onShowPhone}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white ring-1 ring-black/10 hover:bg-brand-50 font-semibold px-4 py-3 text-ink-900"
                >
                  {phoneShown && authed ? (
                    <>
                      <Phone className="w-4 h-4 text-brand-600" />
                      {ad.phone || '+7 (___) ___-__-__'}
                    </>
                  ) : (
                    <>
                      {authed ? <Phone className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      {authed ? 'Показать телефон' : 'Войти для звонка'}
                    </>
                  )}
                </button>
              </div>

              {!authed && ready && (
                <div className="text-[11px] text-ink-500">
                  Написать и увидеть телефон можно после входа. Защищает от спама и мошенников.
                </div>
              )}

              {ad.avitoUrl && (
                <a
                  href={ad.avitoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white ring-1 ring-black/10 hover:bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 w-full"
                >
                  <ExternalLink className="w-4 h-4" />
                  Открыть похожие на Авито
                </a>
              )}
            </div>
            )}

            {/* Мелкие действия */}
            <div className="flex items-center gap-3 text-[12px] text-ink-500 px-1">
              {!isOwner && (
                <>
                  <button className="inline-flex items-center gap-1 hover:text-ink-800">
                    <Flag className="w-3.5 h-3.5" />
                    Пожаловаться
                  </button>
                  <span className="text-ink-300">·</span>
                </>
              )}
              <span>ID: {ad.id.slice(0, 8)}</span>
            </div>

            <p className="text-[11px] text-ink-500 px-1">
              Мы никогда не берём предоплату без встречи. Соблюдайте правила безопасных сделок.
            </p>
          </div>
        </div>

        {/* Похожие объявления */}
        {similar.length > 0 && (
          <section className="mt-8 md:mt-10 px-4 md:px-0">
            <div className="flex items-end justify-between mb-3 px-0.5">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-ink-500 font-bold">
                  Ещё по теме
                </div>
                <div className="text-base md:text-lg font-extrabold text-ink-900 leading-tight">
                  Похожие объявления
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr">
              {similar.map((s) => (
                <div key={s.id} className="h-full">
                  <AdCard ad={s} onOpen={() => router.push(`/ad/${s.id}`)} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <PostAdModal open={postOpen} onClose={() => setPostOpen(false)} />
      <BottomNav onPost={() => setPostOpen(true)} />
    </div>
  );
}

const OWNER_STATUS = {
  approved: ['Опубликовано', 'bg-emerald-50 text-emerald-700 ring-emerald-200'],
  pending: ['На модерации', 'bg-amber-50 text-amber-800 ring-amber-200'],
  rejected: ['Отклонено', 'bg-rose-50 text-rose-700 ring-rose-200'],
  archived: ['В архиве', 'bg-slate-100 text-slate-700 ring-slate-200']
};

function OwnerStatus({ status }) {
  const [label, cls] = OWNER_STATUS[status] || OWNER_STATUS.approved;
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ring-1 ${cls}`}>
      {label}
    </span>
  );
}
