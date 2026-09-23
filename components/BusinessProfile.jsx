'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  Home,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Sparkles,
  Star,
  Globe,
  Lock
} from 'lucide-react';
import { accountTypeEmoji, accountTypeLabel, accountTypeBadgeClass, tierLabel, tierColor } from '@/lib/accountType';
import { useAuth } from '@/lib/auth';
import AdCard from './AdCard';
import BottomNav from './BottomNav';
import Footer from './Footer';
import PostAdModal from './PostAdModal';

/**
 * Публичный профиль бизнес-аккаунта (Мастер / Магазин).
 * URL: /u/[slug].
 * Данные: BusinessProfile + список объявлений автора.
 */
export default function BusinessProfile({ biz, ads = [] }) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const authed = ready && !!user;
  const [phoneShown, setPhoneShown] = useState(false);
  const [postOpen, setPostOpen] = useState(false);

  const kindLabel = accountTypeLabel(biz.userType);
  const kindEmoji = accountTypeEmoji(biz.userType);

  function loginRedirect() {
    router.push(`/login?returnTo=/u/${biz.slug}`);
  }

  function onShowPhone() {
    if (!authed) return loginRedirect();
    setPhoneShown(true);
  }

  function onWrite() {
    if (!authed) return loginRedirect();
    router.push(`/messages?chat=new-user-${biz.userId}`);
  }

  function onShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: biz.name,
          text: `${biz.name} — ${kindLabel} на Доска/КВН`,
          url: typeof window !== 'undefined' ? window.location.href : ''
        })
        .catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
      {/* Хедер */}
      <div className="hero-gradient border-b border-black/5">
        <div className="max-w-5xl mx-auto px-4 md:px-6 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 grid place-items-center rounded-full bg-white ring-1 ring-black/5 hover:bg-brand-50 shadow-card"
            aria-label="Назад"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-ink-800" />
          </button>

          <nav className="hidden md:flex items-center gap-1.5 text-[13px] text-ink-500 min-w-0">
            <Link href="/" className="hover:text-brand-700 inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Доска/КВН
            </Link>
            <span>›</span>
            <span className="text-ink-700 font-medium truncate">{biz.name}</span>
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

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5">
        {/* Хедер профиля */}
        <section className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card overflow-hidden">
          <div className="p-5 md:p-6">
            <div className="flex items-start gap-4">
              {biz.logo || biz.userAvatar ? (
                <img
                  src={biz.logo || biz.userAvatar}
                  alt={biz.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover ring-2 ring-white shadow-card"
                />
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-brand-600 text-white grid place-items-center text-3xl font-black shadow-card">
                  {biz.name?.[0] || '?'}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2 flex-wrap">
                  <div>
                    <div className="text-xl md:text-2xl font-extrabold text-ink-900 leading-tight">
                      {biz.name}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ring-1 ${accountTypeBadgeClass(biz.userType)}`}
                      >
                        <span>{kindEmoji}</span>
                        {kindLabel}
                      </span>
                      {biz.userVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 bg-brand-50 ring-1 ring-brand-200 px-2 py-0.5 rounded-full">
                          <BadgeCheck className="w-3 h-3" />
                          Проверен
                        </span>
                      )}
                      {biz.currentTierName && (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ring-1 ${tierColor(biz.currentTierName)}`}
                        >
                          <Sparkles className="w-3 h-3" />
                          {tierLabel(biz.currentTierName)}
                        </span>
                      )}
                      {biz.legalVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 ring-1 ring-amber-200 px-2 py-0.5 rounded-full">
                          <BadgeCheck className="w-3 h-3" />
                          ИП/ООО
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {biz.description && (
                  <p className="mt-3 text-sm text-ink-700 leading-relaxed">
                    {biz.description}
                  </p>
                )}

                {/* Инфо-плашки */}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-600">
                  {biz.hours && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      {biz.hours}
                    </span>
                  )}
                  {biz.address && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      {biz.address}
                    </span>
                  )}
                  {biz.website && (
                    <a
                      href={biz.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-brand-700 hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {biz.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>

                {biz.categories?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {biz.categories.map((c) => (
                      <span
                        key={c}
                        className="text-[11px] font-semibold text-brand-700 bg-brand-50 ring-1 ring-brand-200 px-2 py-0.5 rounded-full"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Кнопки контакта */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                    {biz.phone || '+7 (___) ___-__-__'}
                  </>
                ) : (
                  <>
                    {authed ? <Phone className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    {authed ? 'Показать телефон' : 'Войти для звонка'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Метрики */}
          <div className="grid grid-cols-4 border-t border-black/5 text-center">
            <Metric
              value={biz.userRating?.toFixed?.(1) || '—'}
              label="Рейтинг"
              icon={<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
            />
            <Metric value={biz.userReviewsCount ?? 0} label="Отзывы" />
            <Metric value={biz.userDealsCount ?? 0} label="Сделки" />
            <Metric value={ads.length} label="Объявлений" />
          </div>
        </section>

        {/* Объявления автора */}
        <section>
          <div className="flex items-end justify-between mb-3 px-0.5">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-ink-500 font-bold">
                Витрина
              </div>
              <div className="text-base md:text-lg font-extrabold text-ink-900 leading-tight">
                Объявления · {ads.length}
              </div>
            </div>
          </div>

          {ads.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr">
              {ads.map((ad) => (
                <div key={ad.id} className="h-full">
                  <AdCard ad={ad} onOpen={() => router.push(`/ad/${ad.id}`)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white ring-1 ring-black/5 p-8 text-center">
              <div className="text-2xl">📭</div>
              <div className="mt-2 font-extrabold text-ink-900">Пока нет активных объявлений</div>
              <div className="text-sm text-ink-500">
                Загляните позже — {biz.name} обновляет витрину регулярно.
              </div>
            </div>
          )}
        </section>

        <p className="text-[11px] text-ink-500 text-center px-4">
          Отзывы и рейтинг видны публично. Мы никогда не берём предоплату без встречи.
        </p>
      </main>

      <Footer />
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
