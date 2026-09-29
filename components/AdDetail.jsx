'use client';

import Avatar from './Avatar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Crown,
  ExternalLink,
  Eye,
  Flag,
  Flame,
  Heart,
  Home,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Star,
  Trash2
} from 'lucide-react';
import {
  cityName,
  getSection,
  deleteAd,
  getAdContact,
  openConversation,
  getSimilarAds,
  registerView
} from '@/lib/api';
import { formatPrice, formatRelative, formatEventDate, formatMonthYear, pluralRu, safeAvitoUrl, thumbUrl, fallbackToFull, formatDayMonth } from '@/lib/format';
import { accountTypeLabel, accountTypeEmoji, accountTypeBadgeClass, isBusiness } from '@/lib/accountType';
import { useAuth } from '@/lib/auth';
import { describeAttributes } from '@/data/attributes';
import { useFavorites } from '@/lib/favorites';
import { shareOrCopy } from '@/lib/share';
import { useToast } from './Toast';
import AdCard from './AdCard';
import BottomNav from './BottomNav';
import Footer from './Footer';
import PostAdModal from './PostAdModal';
import OwnerAdActions from './OwnerAdActions';
import ReportModal from './ReportModal';

export default function AdDetail({ ad }) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const { toast } = useToast();
  const authed = ready && !!user;
  const isOwner = authed && ad.authorId === user.id;
  const acceptsPhone = ad.author?.contactMethod === 'phone';

  const [phone, setPhone] = useState(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [opening, setOpening] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [views, setViews] = useState(ad.viewsCount ?? 0);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const liked = isFavorite(ad.id);

  async function onToggleFavorite() {
    try {
      const res = await toggleFavorite(ad);
      if (res === 'added') toast('Добавлено в избранное');
    } catch (err) {
      toast(err.message || 'Не получилось', { kind: 'error' });
    }
  }

  // Похожие — в браузере: на сервере они только задерживали открытие страницы.
  const [similar, setSimilar] = useState([]);
  useEffect(() => {
    let cancelled = false;
    getSimilarAds(ad, 4)
      .then((items) => !cancelled && setSimilar(items))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [ad]);

  // Просмотр засчитывает сервер (раз в сутки на зрителя); ref — от двойного вызова в dev.
  const viewSent = useRef(null);
  useEffect(() => {
    if (viewSent.current === ad.id) return;
    viewSent.current = ad.id;
    registerView(ad.id)
      .then((r) => setViews(r.viewsCount))
      .catch(() => {});
  }, [ad.id]);

  const gallery = ad.gallery?.length ? ad.gallery : ad.image ? [ad.image] : [];
  const specs = describeAttributes(ad);
  const isEvent = ad.section === 'events';
  // У старых объявлений раздел 'market' — его в справочнике уже нет.
  const sectionInfo = getSection(ad.section);
  const authorType = ad.authorType || ad.author?.type;
  const authorTypeIsBiz = isBusiness(authorType);

  function loginRedirect() {
    router.push(`/login?returnTo=/ad/${ad.id}`);
  }

  async function onWrite() {
    if (!authed) return loginRedirect();
    setOpening(true);
    try {
      const { id } = await openConversation(ad.id);
      router.push(`/messages?chat=${id}`);
    } catch (err) {
      toast(err.message || 'Не удалось открыть переписку', { kind: 'error' });
      setOpening(false);
    }
  }

  async function onShowPhone() {
    if (!authed) return loginRedirect();
    setPhoneLoading(true);
    try {
      const res = await getAdContact(ad.id);
      setPhone(res.phone);
    } catch (err) {
      toast(err.message || 'Не удалось получить телефон', { kind: 'error' });
    } finally {
      setPhoneLoading(false);
    }
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

  // Кнопки связи: в карточке справа на компьютере и в закреплённой панели на телефоне.
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null;
  const writeBtn = (
    <button
      onClick={onWrite}
      disabled={opening}
      className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold disabled:opacity-60"
    >
      <MessageCircle className="w-5 h-5" />
      {opening ? 'Открываем…' : 'Написать'}
    </button>
  );
  const phoneBtn = !acceptsPhone ? null : telHref ? (
    <a href={telHref} className="btn-outline flex-1 h-12 rounded-2xl px-3 text-[15px]">
      <Phone className="w-5 h-5 text-brand-600" />
      <span className="truncate">{phone}</span>
    </a>
  ) : (
    <button
      onClick={onShowPhone}
      disabled={phoneLoading}
      className="btn-outline flex-1 h-12 rounded-2xl px-3 text-[15px] disabled:opacity-60"
    >
      {authed ? <Phone className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
      {phoneLoading ? 'Загружаем…' : authed ? 'Позвонить' : 'Телефон'}
    </button>
  );

  const path = [
    sectionInfo && { label: sectionInfo.name, href: `/${ad.city}?section=${sectionInfo.id}` },
    sectionInfo && ad.categoryGroup && {
      label: ad.categoryGroup,
      href: `/${ad.city}?section=${sectionInfo.id}&group=${encodeURIComponent(ad.categoryGroup)}`
    },
    ad.category && { label: ad.category }
  ].filter(Boolean);

  // Связаться можно только по опубликованному: чужое неопубликованное видит лишь админ.
  const showActionBar = !isOwner && ad.status === 'approved';

  return (
    <div className={`min-h-screen bg-slate-50 md:pb-0 ${showActionBar ? 'pb-28' : 'pb-24'}`}>
      {/* Верхняя панель */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-2 md:px-6 h-14 flex items-center gap-1">
          <IconBtn label="Назад" onClick={() => router.back()}>
            <ArrowLeft className="w-[22px] h-[22px]" />
          </IconBtn>

          {/* Хлебные крошки — только на десктопе */}
          <nav className="hidden md:flex items-center gap-1.5 text-[13px] text-ink-500 min-w-0 ml-2">
            <Link href="/" className="hover:text-brand-700 inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Доска/КВН
            </Link>
            <span>›</span>
            <Link href={`/${ad.city}`} className="hover:text-brand-700 truncate">
              {cityName(ad.city)}
            </Link>
            {path.filter((p) => p.href).map((p, i) => (
              <span key={i} className="contents">
                <span>›</span>
                <Link href={p.href} className="hover:text-brand-700 truncate">
                  {p.label}
                </Link>
              </span>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-0.5">
            {/* Неопубликованное по ссылке никто, кроме автора, не откроет — делиться нечем */}
            {ad.status === 'approved' && (
              <IconBtn label="Поделиться" onClick={onShare}>
                <Share2 className="w-5 h-5" />
              </IconBtn>
            )}
            {!isOwner && (
              <IconBtn label={liked ? 'Убрать из избранного' : 'В избранное'} onClick={onToggleFavorite}>
                <Heart className={`w-[22px] h-[22px] ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
              </IconBtn>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-0 md:px-6 py-0 md:py-6">
        <StatusBanner ad={ad} />
        <div className="md:grid md:grid-cols-[1.4fr_1fr] md:gap-6">
          {/* Левая колонка — галерея */}
          <div className="md:sticky md:top-20 md:self-start">
            <Gallery photos={gallery} title={ad.title} section={ad.section}>
              <div className="absolute top-3 left-3 flex flex-col items-start gap-1 pointer-events-none">
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
            </Gallery>
          </div>

          {/* Правая колонка — детали */}
          <div className="p-4 md:p-0 space-y-4">
            <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4 space-y-2">
              <div className="text-[26px] md:text-3xl font-black text-ink-900 leading-tight">
                {formatPrice(ad)}
              </div>
              <h1 className="text-lg md:text-xl font-bold text-ink-900 leading-snug">{ad.title}</h1>

              {path.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px] text-ink-500">
                  {path.map((p, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5">
                      {i > 0 && <span className="text-ink-300">›</span>}
                      {p.href ? (
                        <Link href={p.href} className="hover:text-brand-700">
                          {p.label}
                        </Link>
                      ) : (
                        <span>{p.label}</span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-500">
                <span className="inline-flex items-center gap-1 min-w-0">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="truncate">{ad.address || cityName(ad.city)}</span>
                </span>
                <span suppressHydrationWarning>
                  {isEvent ? formatEventDate(ad.eventDate) : formatRelative(ad.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {views} {pluralRu(views, ['просмотр', 'просмотра', 'просмотров'])}
                </span>
              </div>

              {(ad.verified || (isEvent && ad.eventDate)) && (
                <div className="pt-1 flex flex-wrap gap-2">
                  {ad.verified && (
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 px-2 py-1 rounded-full">
                      <BadgeCheck className="w-3.5 h-3.5" /> Проверен через «Подслушано»
                    </span>
                  )}
                  {isEvent && ad.eventDate && (
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-amber-700 bg-amber-50 ring-1 ring-amber-200 px-2 py-1 rounded-full">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatEventDate(ad.eventDate)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Связь — на компьютере; на телефоне те же кнопки в панели снизу */}
            {showActionBar && (
              <div className="hidden md:block rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4 space-y-2">
                <div className="flex gap-2">
                  {writeBtn}
                  {phoneBtn}
                </div>
                {ready && (!acceptsPhone || !authed) && (
                  <div className="text-[12px] text-ink-500">
                    {acceptsPhone
                      ? 'Телефон и сообщения доступны после входа — это защищает продавцов от спама.'
                      : 'Продавец отвечает только в сообщениях на сайте.'}
                  </div>
                )}
              </div>
            )}

            {isOwner && (
              <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-ink-900">Это ваше объявление</div>
                  <OwnerStatus status={ad.status} />
                </div>
                <OwnerAdActions ad={ad} onChanged={() => router.refresh()} />
                <button
                  onClick={onDelete}
                  disabled={deleting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white border-2 border-rose-100 text-rose-700 hover:bg-rose-50 font-bold px-4 py-3 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Удаляем…' : 'Удалить объявление'}
                </button>
              </div>
            )}

            {specs.length > 0 && (
              <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4">
                <h2 className="text-base font-bold text-ink-900 mb-1">Характеристики</h2>
                <dl className="divide-y divide-slate-100">
                  {specs.map((r) => (
                    <div key={r.label} className="flex items-baseline justify-between gap-4 py-2 text-[15px]">
                      <dt className="text-ink-500">{r.label}</dt>
                      <dd className="font-semibold text-ink-900 text-right break-words min-w-0">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {ad.description && (
              <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4">
                <h2 className="text-base font-bold text-ink-900 mb-1.5">Описание</h2>
                <p className="text-[15px] text-ink-800 leading-relaxed whitespace-pre-line break-words">
                  {ad.description}
                </p>
              </div>
            )}

            {/* Продавец */}
            <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4">
              <h2 className="text-base font-bold text-ink-900 mb-3">
                {isEvent ? 'Организатор' : 'Продавец'}
              </h2>
              <div className="flex items-center gap-3">
                <Avatar person={ad.author} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="font-semibold text-ink-900 truncate">{ad.author?.name}</div>
                    {ad.author?.verified && <BadgeCheck className="w-4 h-4 text-brand-600 shrink-0" />}
                  </div>
                  <div className="text-[13px] text-ink-500 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {ad.author?.reviewsCount > 0 ? ad.author.rating.toFixed(1) : 'нет оценок'}
                  </div>
                  {ad.author?.createdAt && (
                    <div className="text-[13px] text-ink-500" suppressHydrationWarning>
                      На Доске с {formatMonthYear(ad.author.createdAt)}
                    </div>
                  )}
                </div>
                {authorTypeIsBiz && ad.author?.businessProfile?.slug && (
                  <Link
                    href={`/u/${ad.author.businessProfile.slug}`}
                    className="text-[13px] font-semibold text-brand-700 hover:text-brand-800 shrink-0"
                  >
                    Профиль →
                  </Link>
                )}
              </div>
              <Link
                href={`/user/${ad.authorId}`}
                className="mt-3 -mx-1 px-1 py-2 flex items-center justify-between rounded-xl text-[15px] font-semibold text-brand-700 hover:bg-slate-50"
              >
                {isOwner ? 'Как вашу страницу видят другие' : 'Все объявления продавца'}
                <ChevronRight className="w-5 h-5" />
              </Link>
              {!isOwner && ready && (!acceptsPhone || !authed) && (
                <div className="md:hidden mt-1 text-[12px] text-ink-500">
                  {acceptsPhone
                    ? 'Телефон и сообщения доступны после входа — это защищает продавцов от спама.'
                    : 'Продавец отвечает только в сообщениях на сайте.'}
                </div>
              )}
            </div>

            {safeAvitoUrl(ad.avitoUrl) && (
              <a
                href={safeAvitoUrl(ad.avitoUrl)}
                target="_blank"
                rel="noreferrer"
                className="btn-outline w-full rounded-2xl px-4 py-3 text-sm text-emerald-700"
              >
                <ExternalLink className="w-4 h-4" />
                Открыть похожие на Авито
              </a>
            )}

            <div className="px-1 space-y-2">
              <p className="text-[12px] text-ink-500">
                Не вносите предоплату до встречи с продавцом — так чаще всего действуют мошенники.
              </p>
              <div className="flex items-center gap-3 text-[12px] text-ink-500">
                {!isOwner && (
                  <>
                    <button
                      onClick={() => (authed ? setReportOpen(true) : loginRedirect())}
                      className="inline-flex items-center gap-1 hover:text-ink-800"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      Пожаловаться
                    </button>
                    <span className="text-ink-300">·</span>
                  </>
                )}
                <span>№ {ad.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <section className="mt-6 md:mt-10 px-4 md:px-0">
            <h2 className="text-xl font-extrabold text-ink-900 mb-3 px-0.5">Похожие объявления</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr">
              {similar.map((s) => (
                <div key={s.id} className="h-full">
                  <AdCard ad={s} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        adId={ad.id}
        onDone={() => {
          setReportOpen(false);
          toast('Жалоба отправлена — спасибо');
        }}
      />

      {showActionBar ? (
        // Закреплённая панель связи на телефоне — вместо нижнего меню, как в приложениях
        <div
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-100 px-4 pt-2.5"
          style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}
        >
          <div className="flex gap-2">
            {phoneBtn}
            {writeBtn}
          </div>
        </div>
      ) : (
        <>
          <PostAdModal open={postOpen} onClose={() => setPostOpen(false)} />
          <BottomNav onPost={() => setPostOpen(true)} />
        </>
      )}
    </div>
  );
}

function IconBtn({ label, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="w-10 h-10 grid place-items-center rounded-full text-ink-800 hover:bg-slate-100"
    >
      {children}
    </button>
  );
}

/**
 * Галерея: на телефоне листается пальцем (scroll-snap), на компьютере — стрелками и миниатюрами.
 * children — плашки поверх фото.
 */
function Gallery({ photos, title, section, children }) {
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    setIdx(Math.round(el.scrollLeft / el.clientWidth));
  }

  function go(i) {
    const el = trackRef.current;
    if (!el) return;
    const n = (i + photos.length) % photos.length;
    el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' });
  }

  if (!photos.length) {
    const s = getSection(section);
    const Icon = s?.icon;
    return (
      <div className={`relative aspect-[4/3] md:rounded-2xl overflow-hidden grid place-items-center ${s?.tile || 'bg-slate-100 text-ink-500'}`}>
        {Icon ? <Icon className="w-16 h-16 opacity-50" strokeWidth={1.4} /> : 'Без фото'}
        {children}
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/3] bg-slate-100 md:rounded-2xl overflow-hidden md:shadow-card">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
        >
          {photos.map((src, i) => (
            <img
              key={src + i}
              src={src}
              alt={i === 0 ? title : ''}
              loading={i === 0 ? 'eager' : 'lazy'}
              className="w-full h-full shrink-0 snap-center object-contain bg-slate-100"
            />
          ))}
        </div>

        {children}

        {photos.length > 1 && (
          <>
            <button
              onClick={() => go(idx - 1)}
              className="hidden md:grid absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 place-items-center rounded-full bg-white/90 shadow-card hover:bg-white"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => go(idx + 1)}
              className="hidden md:grid absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 place-items-center rounded-full bg-white/90 shadow-card hover:bg-white"
              aria-label="Следующее фото"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[12px] font-semibold px-2 py-0.5 rounded-full tabular-nums">
              {idx + 1} / {photos.length}
            </div>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="hidden md:flex mt-2 gap-2 overflow-x-auto no-scrollbar">
          {photos.map((src, i) => (
            <button
              key={src + i}
              onClick={() => go(i)}
              className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden ring-2 ${
                i === idx ? 'ring-accent-500' : 'ring-transparent'
              }`}
              aria-label={`Фото ${i + 1}`}
            >
              <img src={thumbUrl(src)} onError={fallbackToFull(src)} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const OWNER_STATUS = {
  approved: ['Опубликовано', 'bg-emerald-50 text-emerald-700 ring-emerald-200'],
  pending: ['На модерации', 'bg-amber-50 text-amber-800 ring-amber-200'],
  rejected: ['Отклонено', 'bg-rose-50 text-rose-700 ring-rose-200'],
  hidden: ['Скрыто модератором', 'bg-rose-50 text-rose-700 ring-rose-200'],
  expired: ['Истёк срок', 'bg-slate-100 text-slate-700 ring-slate-200'],
  archived: ['В архиве', 'bg-slate-100 text-slate-700 ring-slate-200']
};

// Плашка над объявлением, которого нет в ленте: его видят только автор и админы.
const STATUS_BANNER = {
  pending: ['bg-amber-50 ring-amber-200 text-amber-900', 'Объявление на проверке', 'Оно появится в ленте после одобрения модератором — пришлём уведомление.'],
  rejected: ['bg-rose-50 ring-rose-200 text-rose-900', 'Объявление отклонено', 'Его не видно в ленте и поиске.'],
  hidden: ['bg-rose-50 ring-rose-200 text-rose-900', 'Объявление скрыто модератором', 'Его не видно в ленте и поиске. Если это ошибка — напишите в поддержку.'],
  archived: ['bg-slate-100 ring-slate-200 text-ink-900', 'Объявление в архиве', 'Его не видно в ленте и поиске. Вернуть можно кнопкой ниже.']
};

function StatusBanner({ ad }) {
  const b = STATUS_BANNER[ad.status];
  if (!b) return null;
  const [cls, title, text] = b;
  return (
    <div className={`mx-4 md:mx-0 mt-3 mb-3 md:mt-0 md:mb-4 rounded-2xl ring-1 px-4 py-3 ${cls}`}>
      <div className="font-bold">{title}</div>
      {ad.moderationNotes && <div className="text-sm mt-0.5">Причина: {ad.moderationNotes}</div>}
      <div className="text-[13px] mt-0.5 opacity-80">{text}</div>
      {ad.deleteAt && (
        <div className="text-[13px] mt-0.5 font-semibold" suppressHydrationWarning>
          Удалим {formatDayMonth(ad.deleteAt)} вместе с фото.
        </div>
      )}
      {ad.status !== 'pending' && ad.status !== 'archived' && (
        <Link href="/help" className="inline-block mt-1.5 text-[13px] font-semibold underline">
          Написать в поддержку
        </Link>
      )}
    </div>
  );
}

function OwnerStatus({ status }) {
  const [label, cls] = OWNER_STATUS[status] || OWNER_STATUS.approved;
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ring-1 ${cls}`}>
      {label}
    </span>
  );
}
