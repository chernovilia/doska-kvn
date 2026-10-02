'use client';

/**
 * /admin — админка. Доступ только у me.isAdmin (бэк проверяет ADMIN_EMAILS / role).
 * Вкладки: обзор (метрики и рост), объявления (поиск, статусы, модерация), жалобы,
 * пользователи (поиск, блокировка), отзывы, настройки. Списки — карточками: удобно и с телефона.
 */

import Avatar from '@/components/Avatar';
import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Eye,
  Flag,
  Heart,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trash2,
  Users
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import {
  adminStats,
  adminListUsers,
  adminListAds,
  adminDeleteUser,
  adminDeleteAd,
  adminWipeAll,
  adminGetSettings,
  adminSetSetting,
  adminListSupport,
  adminReplySupport,
  adminSetSupportStatus,
  adminSetAdStatus,
  adminBlockUser,
  adminListReports,
  adminResolveReport,
  adminListReviews,
  adminDeleteReview,
  cityName,
  getSection,
  getSiteSettings,
  adminSetNeighbors,
  adminSetContacts,
  adminAppStats,
  adminSetAppTexts,
  adminResetAppStats,
  adminGetLegal,
  adminSetLegal,
  adminResetLegal
} from '@/lib/api';
import { LegalBody } from '@/components/LegalDoc';
import { LEGAL_DEFAULTS } from '@/lib/legal';
import Modal from '@/components/Modal';
import PostAdModal from '@/components/PostAdModal';
import { useApp } from '@/components/AppShell';
import { loadAppConfig } from '@/lib/pwa';
import { CITIES } from '@/data/regions';
import { formatPrice, formatRelative, pluralRu, thumbUrl, fallbackToFull, adPath } from '@/lib/format';
import ModerationModal from '@/components/admin/ModerationModal';
import { Empty, ErrorBox, ListSkeleton, REPORT_REASONS, ReasonForm, StatusBadge } from '@/components/admin/ui';
import { Stars } from '@/components/Reviews';

const PAGE_SIZE = 30;

const TABS = [
  { id: 'overview', name: 'Обзор' },
  { id: 'ads', name: 'Объявления' },
  { id: 'reports', name: 'Жалобы' },
  { id: 'support', name: 'Поддержка' },
  { id: 'users', name: 'Пользователи' },
  { id: 'reviews', name: 'Отзывы' },
  { id: 'settings', name: 'Настройки' }
];

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AdminContent />
    </Suspense>
  );
}

function AdminContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, ready } = useAuth();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'overview';
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [modAdId, setModAdId] = useState(null);
  // Переход из «Пользователи» к объявлениям автора и из «Обзора» в нужный статус.
  // Ссылки из уведомлений приходят параметрами: ?tab=ads&status=pending, ?tab=support&ticket=…
  const [adsPreset, setAdsPreset] = useState(() =>
    params.get('status') ? { status: params.get('status') } : null
  );

  const loadStats = useCallback(() => {
    adminStats()
      .then((s) => {
        setStats(s);
        setStatsError(null);
      })
      .catch((err) => setStatsError(err.message || 'Не удалось загрузить метрики'));
  }, []);

  useEffect(() => {
    if (ready && !user) router.push('/login?returnTo=/admin');
  }, [ready, user, router]);

  useEffect(() => {
    if (user?.isAdmin) loadStats();
  }, [user, loadStats]);

  function go(id, preset = null) {
    setAdsPreset(preset);
    router.replace(id === 'overview' ? '/admin' : `/admin?tab=${id}`, { scroll: false });
  }

  if (!ready) return <div className="min-h-screen" />;
  if (!user) return null;

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto w-14 h-14 grid place-items-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-ink-900 mt-3">Нет доступа</h1>
          <p className="text-sm text-ink-500 mt-1">
            У вашего аккаунта нет прав администратора. Если это ошибка — свяжитесь с владельцем сайта.
          </p>
          <Link href="/" className="mt-4 btn-outline h-10 px-4 text-sm">
            <ArrowLeft className="w-4 h-4" />
            На главную
          </Link>
        </div>
      </div>
    );
  }

  const badges = { ads: stats?.pendingAds, reports: stats?.pendingReports, support: stats?.openTickets };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-[var(--banner-h,0px)] z-30 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-2 md:px-6 h-14 flex items-center gap-1">
          <Link href="/" className="w-10 h-10 grid place-items-center rounded-full text-ink-800 hover:bg-slate-100" aria-label="На главную">
            <ArrowLeft className="w-[22px] h-[22px]" />
          </Link>
          <ShieldCheck className="w-5 h-5 text-accent-700" />
          <div className="font-extrabold text-lg text-ink-900 ml-1">Админка</div>
          <div className="ml-auto text-[12px] text-ink-500 truncate hidden sm:block">{user.email}</div>
        </div>
        <div className="max-w-6xl mx-auto overflow-x-auto no-scrollbar">
          <div className="flex gap-1.5 px-4 md:px-6 pb-2.5 w-max">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => go(t.id)} className={`chip chip-sm ${tab === t.id ? 'chip-on' : ''}`}>
                {t.name}
                {badges[t.id] > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-accent-500 text-white text-[10px] font-bold">
                    {badges[t.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
        {tab === 'overview' &&
          (statsError && !stats ? (
            <div className="space-y-3">
              <ErrorBox message={statsError} />
              <button onClick={loadStats} className="btn-outline h-10 px-4 text-sm">
                <RefreshCw className="w-4 h-4" />
                Повторить
              </button>
            </div>
          ) : (
            <OverviewTab stats={stats} onReload={loadStats} go={go} />
          ))}
        {tab === 'ads' && <AdsTab preset={adsPreset} onOpen={setModAdId} onChanged={loadStats} />}
        {tab === 'reports' && <ReportsTab onOpen={setModAdId} onChanged={loadStats} />}
        {tab === 'users' && <UsersTab me={user} onShowAds={(u) => go('ads', { authorId: u.id, authorName: u.name || u.email })} onChanged={loadStats} />}
        {tab === 'reviews' && <ReviewsTab onChanged={loadStats} />}
        {tab === 'support' && <SupportTab focusId={params.get('ticket')} onChanged={loadStats} />}
        {tab === 'settings' && <SettingsTab onChanged={loadStats} />}
      </main>

      <ModerationModal
        open={!!modAdId}
        adId={modAdId}
        onClose={() => setModAdId(null)}
        onChanged={() => {
          loadStats();
          window.dispatchEvent(new Event('admin:changed'));
        }}
      />
    </div>
  );
}

// Списки перезагружаются после действий в модалке модерации.
function useAdminChanged(fn) {
  useEffect(() => {
    window.addEventListener('admin:changed', fn);
    return () => window.removeEventListener('admin:changed', fn);
  }, [fn]);
}

// ── Обзор ──────────────────────────────────────────────────────────

function OverviewTab({ stats, onReload, go }) {
  const [wiping, setWiping] = useState(false);
  const [error, setError] = useState(null);

  async function wipe() {
    const confirmText = 'СТЕРЕТЬ';
    const input = window.prompt(
      `Это удалит ВСЕХ пользователей и все объявления. Восстановить нельзя.\n\nВведите ${confirmText}, чтобы подтвердить:`
    );
    if (input !== confirmText) return;
    setWiping(true);
    setError(null);
    try {
      await adminWipeAll();
      onReload();
    } catch (err) {
      setError(err.message);
    } finally {
      setWiping(false);
    }
  }

  if (!stats) return <ListSkeleton rows={3} />;
  const maxDaily = Math.max(1, ...stats.daily.map((d) => Math.max(d.users, d.ads)));

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h2 className="text-xl font-extrabold text-ink-900">Обзор</h2>
        <button onClick={onReload} className="ml-auto btn-outline h-9 px-3 text-sm">
          <RefreshCw className="w-4 h-4" />
          Обновить
        </button>
      </div>

      {(stats.pendingAds > 0 || stats.pendingReports > 0 || stats.openTickets > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {stats.pendingAds > 0 && (
            <button onClick={() => go('ads', { status: 'pending' })} className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-3 text-left">
              <div className="font-bold text-amber-900">
                Ждут модерации: {stats.pendingAds}
              </div>
              <div className="text-[13px] text-amber-800">Открыть очередь →</div>
            </button>
          )}
          {stats.pendingReports > 0 && (
            <button onClick={() => go('reports')} className="rounded-2xl bg-rose-50 ring-1 ring-rose-200 p-3 text-left">
              <div className="font-bold text-rose-900">Новые жалобы: {stats.pendingReports}</div>
              <div className="text-[13px] text-rose-800">Разобрать →</div>
            </button>
          )}
          {stats.openTickets > 0 && (
            <button onClick={() => go('support')} className="rounded-2xl bg-accent-50 ring-1 ring-accent-300 p-3 text-left">
              <div className="font-bold text-ink-900">Обращения ждут ответа: {stats.openTickets}</div>
              <div className="text-[13px] text-ink-700">Ответить →</div>
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Kpi icon={Users} label="Пользователи" value={stats.users} delta={stats.usersNew7d} hint={`${stats.usersOnboarded} заполнили профиль`} />
        <Kpi icon={ShoppingBag} label="Опубликовано" value={stats.approvedAds} delta={stats.adsNew7d} hint={`всего ${stats.ads}, откл. ${stats.rejectedAds}, скрыто ${stats.hiddenAds}, архив ${stats.archivedAds ?? 0}`} />
        <Kpi icon={MessageCircle} label="Переписки" value={stats.conversations} hint={`${stats.messages7d} сообщ. за 7 дней`} />
        <Kpi icon={Eye} label="Просмотры" value={stats.views} hint="всех объявлений" />
        <Kpi icon={Heart} label="В избранном" value={stats.favorites} />
        <Kpi icon={Star} label="Отзывы" value={stats.reviews} />
        <Kpi icon={Flag} label="Жалобы" value={stats.pendingReports} hint="ждут разбора" />
        <Kpi icon={Ban} label="Заблокированы" value={stats.blockedUsers} />
      </div>

      <AppStats />

      <section className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <h3 className="font-bold text-ink-900 w-full sm:w-auto sm:mr-auto">Новые за 14 дней</h3>
          <span className="inline-flex items-center gap-1 text-[12px] text-ink-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-accent-500" /> пользователи
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] text-ink-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-accent-400" /> объявления
          </span>
        </div>
        <div className="mt-3 h-32 flex items-end gap-1">
          {stats.daily.map((d) => (
            <div key={d.day} className="flex-1 h-full flex flex-col justify-end" title={`${d.day}: ${d.users} польз., ${d.ads} объявл.`}>
              <div className="flex items-end gap-px h-full">
                <div className="flex-1 rounded-t bg-accent-500" style={{ height: `${(d.users / maxDaily) * 100}%` }} />
                <div className="flex-1 rounded-t bg-accent-400" style={{ height: `${(d.ads / maxDaily) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-ink-500">
          <span>{stats.daily[0]?.day.slice(5).split('-').reverse().join('.')}</span>
          <span>сегодня</span>
        </div>
      </section>

      {stats.byCity.length > 0 && (
        <section className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4">
          <h3 className="font-bold text-ink-900 text-sm">Опубликованные по городам</h3>
          <div className="mt-2 space-y-1.5">
            {stats.byCity.map((c) => (
              <div key={c.cityId} className="flex items-center gap-2 text-sm">
                <span className="w-28 truncate text-ink-700">{cityName(c.cityId)}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-accent-500" style={{ width: `${(c.count / stats.byCity[0].count) * 100}%` }} />
                </div>
                <span className="w-10 text-right tabular-nums text-ink-900 font-semibold">{c.count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="text-[12px] text-ink-500">
        Техническое: фото {stats.tech.adPhotos}, активных сессий {stats.tech.refreshTokens}, кодов входа {stats.tech.emailCodes}.
      </p>

      <ErrorBox message={error} />
      {/* Полный сброс — только если разрешён на сервере (ADMIN_WIPE_ENABLED); на проде выключен */}
      {stats.wipeEnabled && (
      <details className="rounded-2xl bg-rose-50 ring-1 ring-rose-200 p-4">
        <summary className="text-sm font-bold text-rose-900 cursor-pointer">Опасная зона</summary>
        <p className="mt-2 text-[13px] text-rose-800">
          Полный сброс пользовательских данных. Справочники (регионы, города, тарифы, настройки) не трогает.
        </p>
        <button
          onClick={wipe}
          disabled={wiping}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-4 py-2 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {wiping ? 'Удаляем…' : 'Стереть всех пользователей и объявления'}
        </button>
      </details>
      )}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, delta, hint }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-3">
      <div className="flex items-center gap-1.5 text-[12px] text-ink-500 font-semibold">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-black text-ink-900 tabular-nums">{value ?? '—'}</span>
        {delta > 0 && <span className="text-[12px] font-bold text-emerald-600">+{delta} за 7 дн.</span>}
      </div>
      {hint && <div className="text-[11px] text-ink-500 truncate">{hint}</div>}
    </div>
  );
}

// ── Поиск и пагинация ──────────────────────────────────────────────

function SearchBox({ value, onChange, placeholder }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onChange(draft.trim());
      }}
      className="flex-1 min-w-[200px] flex items-center gap-2 h-10 px-3 rounded-xl bg-white ring-1 ring-black/10 focus-within:ring-accent-400"
    >
      <Search className="w-4 h-4 text-ink-500 shrink-0" />
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => draft.trim() !== value && onChange(draft.trim())}
        placeholder={placeholder}
        className="flex-1 min-w-0 bg-transparent outline-none text-[15px]"
      />
    </form>
  );
}

function Pager({ total, offset, onOffset }) {
  if (total <= PAGE_SIZE) return null;
  const to = Math.min(total, offset + PAGE_SIZE);
  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button disabled={offset === 0} onClick={() => onOffset(Math.max(0, offset - PAGE_SIZE))} className="btn-outline h-9 px-3 text-sm disabled:opacity-40">
        Назад
      </button>
      <span className="text-[13px] text-ink-500 tabular-nums">
        {offset + 1}–{to} из {total}
      </span>
      <button disabled={to >= total} onClick={() => onOffset(offset + PAGE_SIZE)} className="btn-outline h-9 px-3 text-sm disabled:opacity-40">
        Дальше
      </button>
    </div>
  );
}

// ── Объявления ─────────────────────────────────────────────────────

const ASK = {
  reject: { title: 'Почему отклоняем?', confirm: 'Отклонить' },
  hide: { title: 'Почему скрываем из ленты? Автор увидит причину', confirm: 'Скрыть' },
  delete: { title: 'Почему удаляем? Вернуть будет нельзя', confirm: 'Удалить' }
};

const STATUS_FILTERS = [
  { key: '', label: 'Все' },
  { key: 'pending', label: 'На модерации' },
  { key: 'approved', label: 'Опубликованы' },
  { key: 'rejected', label: 'Отклонены' },
  { key: 'hidden', label: 'Скрытые' },
  { key: 'archived', label: 'Архив' }
];

function AdsTab({ preset, onOpen, onChanged }) {
  const [status, setStatus] = useState(preset?.status || '');
  const [q, setQ] = useState('');
  const [author, setAuthor] = useState(preset?.authorId ? { id: preset.authorId, name: preset.authorName } : null);
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [asking, setAsking] = useState(null); // { id, action: 'reject' | 'delete' }
  const [busy, setBusy] = useState(false);
  const [placing, setPlacing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await adminListAds({ limit: PAGE_SIZE, offset, status, q, authorId: author?.id }));
    } catch (err) {
      setError(err.message);
    }
  }, [offset, status, q, author]);

  useEffect(() => {
    load();
  }, [load]);
  useAdminChanged(load);

  async function act(fn) {
    setBusy(true);
    try {
      await fn();
      setAsking(null);
      await load();
      onChanged();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchBox value={q} onChange={(v) => { setOffset(0); setQ(v); }} placeholder="Заголовок, описание или ID" />
        <button onClick={() => setPlacing(true)} className="btn-primary h-10 px-4 rounded-full text-sm shrink-0">
          <Plus className="w-4 h-4" />
          Разместить за пользователя
        </button>
      </div>
      <PlaceForUser
        open={placing}
        onClose={() => setPlacing(false)}
        onPlaced={() => {
          load();
          onChanged();
        }}
      />
      <div className="-mx-4 md:mx-0 overflow-x-auto no-scrollbar">
        <div className="flex gap-1.5 px-4 md:px-0 w-max">
          {STATUS_FILTERS.map((f) => (
            <button key={f.key || 'all'} onClick={() => { setOffset(0); setStatus(f.key); }} className={`chip chip-sm ${status === f.key ? 'chip-on' : ''}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {author && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-ink-500">Автор:</span>
          <span className="font-semibold text-ink-900">{author.name}</span>
          <button onClick={() => { setOffset(0); setAuthor(null); }} className="text-accent-700 font-semibold">
            сбросить
          </button>
        </div>
      )}

      <ErrorBox message={error} />
      {!data ? (
        <ListSkeleton />
      ) : data.items.length === 0 ? (
        <Empty>Ничего не нашлось.</Empty>
      ) : (
        <ul className="space-y-2">
          <li className="text-[13px] text-ink-500 px-0.5">
            {data.total} {pluralRu(data.total, ['объявление', 'объявления', 'объявлений'])}
          </li>
          {data.items.map((a) => (
            <li key={a.id} className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-3">
              <button onClick={() => onOpen(a.id)} className="w-full flex gap-3 text-left">
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                  {a.photos?.[0]?.url && <img src={thumbUrl(a.photos[0].url)} onError={fallbackToFull(a.photos[0].url)} alt="" loading="lazy" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <div className="font-semibold text-ink-900 line-clamp-2 flex-1">{a.title}</div>
                    {a.placedByAdmin && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap bg-accent-100 text-accent-800" title="Размещено администратором за пользователя">
                        за пользователя
                      </span>
                    )}
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="text-[13px] text-ink-900 font-bold">{formatPrice(a, { compact: true })}</div>
                  <div className="text-[12px] text-ink-500 truncate">
                    {getSection(a.section)?.name || a.section} · {cityName(a.cityId)} · {a.author?.name || a.author?.email}
                    {a.author?.blockedAt && <span className="text-rose-600 font-semibold"> · заблокирован</span>}
                  </div>
                  <div className="text-[12px] text-ink-500" suppressHydrationWarning>
                    {formatRelative(a.createdAt)} · {a.viewsCount} просм. · {a.favoritesCount} ♥
                    {a.reportsCount > 0 && <span className="text-rose-600 font-semibold"> · {a.reportsCount} жалоб</span>}
                  </div>
                  {(a.status === 'rejected' || a.status === 'hidden') && a.moderationNotes && (
                    <div className="text-[12px] text-rose-700 truncate">Причина: {a.moderationNotes}</div>
                  )}
                </div>
              </button>

              {asking?.id === a.id ? (
                <div className="mt-2">
                  <ReasonForm
                    title={ASK[asking.action].title}
                    confirmLabel={ASK[asking.action].confirm}
                    tone={asking.action === 'delete' ? 'rose' : 'amber'}
                    busy={busy}
                    onCancel={() => setAsking(null)}
                    onConfirm={(reason) =>
                      act(() =>
                        asking.action === 'delete'
                          ? adminDeleteAd(a.id, reason)
                          : adminSetAdStatus(a.id, asking.action === 'reject' ? 'rejected' : 'hidden', reason)
                      )
                    }
                  />
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {a.status !== 'approved' && (
                    <button onClick={() => act(() => adminSetAdStatus(a.id, 'approved'))} disabled={busy} className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold">
                      {a.status === 'pending' ? 'Одобрить' : 'Вернуть в ленту'}
                    </button>
                  )}
                  {a.status === 'pending' && (
                    <button onClick={() => setAsking({ id: a.id, action: 'reject' })} className="h-8 px-3 rounded-lg ring-1 ring-amber-300 text-amber-800 hover:bg-amber-50 text-[13px] font-semibold">
                      Отклонить
                    </button>
                  )}
                  {a.status === 'approved' && (
                    <button onClick={() => setAsking({ id: a.id, action: 'hide' })} className="h-8 px-3 rounded-lg ring-1 ring-amber-300 text-amber-800 hover:bg-amber-50 text-[13px] font-semibold">
                      Скрыть
                    </button>
                  )}
                  <Link href={adPath(a.id)} target="_blank" className="h-8 px-3 rounded-lg ring-1 ring-black/10 text-ink-700 hover:bg-slate-50 text-[13px] font-semibold inline-flex items-center">
                    На сайте
                  </Link>
                  <button onClick={() => setAsking({ id: a.id, action: 'delete' })} className="ml-auto h-8 w-8 grid place-items-center rounded-lg text-rose-600 hover:bg-rose-50" aria-label="Удалить">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {data && <Pager total={data.total} offset={offset} onOffset={setOffset} />}
    </div>
  );
}

// Разместить объявление за пользователя: сначала кто продавец, потом обычная форма подачи.
// Объявление публикуется от имени продавца сразу, ему уходит письмо со ссылкой.
function PlaceForUser({ open, onClose, onPlaced }) {
  const empty = { email: '', name: '', phone: '', contactMethod: 'chat' };
  const [seller, setSeller] = useState(empty);
  const [formOpen, setFormOpen] = useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(seller.email.trim()) && seller.name.trim().length >= 2;
  const phoneOk = seller.contactMethod !== 'phone' || seller.phone.replace(/\D/g, '').length >= 10;

  function close() {
    onClose();
    setSeller(empty);
  }

  return (
    <>
      <Modal open={open && !formOpen} onClose={close} size="sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid && phoneOk) setFormOpen(true);
          }}
          className="p-5 pb-6 space-y-3"
        >
          <div className="pr-10">
            <div className="text-xs uppercase tracking-wide text-accent-700 font-bold">Разместить за пользователя</div>
            <h3 className="text-xl font-extrabold text-ink-900 mt-1">Кто продавец?</h3>
          </div>
          <div className="rounded-xl bg-amber-50 ring-1 ring-amber-200 px-3 py-2 text-[13px] text-amber-900">
            Только с согласия человека. На его почту придёт письмо со ссылкой на объявление; управлять им он сможет,
            войдя на сайт по коду на эту почту.
          </div>
          <label className="block">
            <div className="text-[12px] font-semibold text-ink-700 mb-1">Почта продавца</div>
            <input
              type="email"
              value={seller.email}
              onChange={(e) => setSeller((f) => ({ ...f, email: e.target.value }))}
              placeholder="seller@mail.ru"
              className="w-full h-11 rounded-2xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-4 text-base"
            />
          </label>
          <label className="block">
            <div className="text-[12px] font-semibold text-ink-700 mb-1">Имя</div>
            <input
              value={seller.name}
              onChange={(e) => setSeller((f) => ({ ...f, name: e.target.value.slice(0, 80) }))}
              placeholder="Как подписать продавца"
              className="w-full h-11 rounded-2xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-4 text-base"
            />
          </label>
          <label className="block">
            <div className="text-[12px] font-semibold text-ink-700 mb-1">Телефон — если продавец хочет звонки</div>
            <input
              type="tel"
              value={seller.phone}
              onChange={(e) => setSeller((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+7 999 123-45-67"
              className="w-full h-11 rounded-2xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-4 text-base"
            />
          </label>
          <div className="flex gap-1.5">
            {[
              ['chat', 'Только сообщения'],
              ['phone', 'Показывать телефон']
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSeller((f) => ({ ...f, contactMethod: id }))}
                className={`chip chip-sm ${seller.contactMethod === id ? 'chip-on' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-ink-500">
            Если аккаунт с такой почтой уже есть — объявление добавится к нему, имя и телефон в профиле не изменятся.
            Продавцу без входа на сайт сообщения в чате видны не будут — лучше указать телефон.
          </p>
          <button type="submit" disabled={!valid || !phoneOk} className="w-full btn-primary h-11 rounded-2xl text-sm">
            Дальше — объявление
          </button>
        </form>
      </Modal>
      <PostAdModal
        open={open && formOpen}
        adminFor={{
          email: seller.email.trim(),
          name: seller.name.trim(),
          phone: seller.phone.trim() || undefined,
          contactMethod: seller.contactMethod
        }}
        onSaved={onPlaced}
        onClose={() => {
          setFormOpen(false);
          close();
        }}
      />
    </>
  );
}

// ── Жалобы ─────────────────────────────────────────────────────────

const REPORT_FILTERS = [
  { key: 'pending', label: 'Новые' },
  { key: 'resolved', label: 'Меры приняты' },
  { key: 'dismissed', label: 'Отклонённые' }
];

function ReportsTab({ onOpen, onChanged }) {
  const [status, setStatus] = useState('pending');
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems((await adminListReports(status)).items);
    } catch (err) {
      setError(err.message);
    }
  }, [status]);
  useEffect(() => {
    setItems(null);
    load();
  }, [load]);
  useAdminChanged(load);

  async function act(fn) {
    setBusy(true);
    try {
      await fn();
      await load();
      onChanged();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {REPORT_FILTERS.map((f) => (
          <button key={f.key} onClick={() => setStatus(f.key)} className={`chip chip-sm ${status === f.key ? 'chip-on' : ''}`}>
            {f.label}
          </button>
        ))}
      </div>
      <ErrorBox message={error} />
      {!items ? (
        <ListSkeleton />
      ) : items.length === 0 ? (
        <Empty>{status === 'pending' ? 'Новых жалоб нет 🎉' : 'Пусто.'}</Empty>
      ) : (
        <ul className="space-y-2">
          {items.map((r) => (
            <li key={r.id} className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  <Flag className="w-3 h-3" />
                  {REPORT_REASONS[r.reason] || r.reason}
                </span>
                <span className="text-[12px] text-ink-500" suppressHydrationWarning>
                  {formatRelative(r.createdAt)} · от {r.reporter?.name || r.reporter?.email || 'пользователя'}
                </span>
              </div>
              {r.comment && <p className="text-sm text-ink-800 whitespace-pre-line">«{r.comment}»</p>}
              {r.ad ? (
                <button onClick={() => onOpen(r.ad.id)} className="w-full flex items-center gap-3 rounded-xl bg-slate-50 p-2 text-left hover:bg-slate-100">
                  <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                    {r.ad.photos?.[0]?.url && <img src={thumbUrl(r.ad.photos[0].url)} onError={fallbackToFull(r.ad.photos[0].url)} alt="" loading="lazy" className="w-full h-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink-900 truncate">{r.ad.title}</div>
                    <div className="text-[12px] text-ink-500 truncate">
                      {r.ad.author?.name || r.ad.author?.email} · всего жалоб: {r.ad.reportsCount}
                    </div>
                  </div>
                  <StatusBadge status={r.ad.status} />
                </button>
              ) : (
                <div className="text-sm text-ink-500">Объявление уже удалено</div>
              )}
              {status === 'pending' && (
                <div className="flex flex-wrap gap-1.5">
                  {r.ad && (
                    <button onClick={() => onOpen(r.ad.id)} className="h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold">
                      Открыть и принять меры
                    </button>
                  )}
                  <button onClick={() => act(() => adminResolveReport(r.id, 'resolved'))} disabled={busy} className="h-8 px-3 rounded-lg ring-1 ring-black/10 text-ink-700 hover:bg-slate-50 text-[13px] font-semibold">
                    Меры приняты
                  </button>
                  <button onClick={() => act(() => adminResolveReport(r.id, 'dismissed'))} disabled={busy} className="h-8 px-3 rounded-lg ring-1 ring-black/10 text-ink-700 hover:bg-slate-50 text-[13px] font-semibold">
                    Жалоба не подтвердилась
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Пользователи ───────────────────────────────────────────────────

function UsersTab({ me, onShowAds, onChanged }) {
  const [q, setQ] = useState('');
  const [blockedOnly, setBlockedOnly] = useState(false);
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [blocking, setBlocking] = useState(null); // id пользователя, для которого открыта форма
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await adminListUsers({ limit: PAGE_SIZE, offset, q, blocked: blockedOnly }));
    } catch (err) {
      setError(err.message);
    }
  }, [offset, q, blockedOnly]);
  useEffect(() => {
    load();
  }, [load]);

  async function act(fn) {
    setBusy(true);
    try {
      await fn();
      setBlocking(null);
      await load();
      onChanged();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  function onDelete(u) {
    if (!window.confirm(`Удалить ${u.name || u.email}? Его объявления, переписки и отзывы тоже удалятся. Вернуть нельзя.`)) return;
    act(() => adminDeleteUser(u.id));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchBox value={q} onChange={(v) => { setOffset(0); setQ(v); }} placeholder="Имя, почта или ID" />
        <button onClick={() => { setOffset(0); setBlockedOnly((v) => !v); }} className={`chip chip-sm ${blockedOnly ? 'chip-on' : ''}`}>
          <Ban className="w-3.5 h-3.5" />
          Заблокированные
        </button>
      </div>
      <ErrorBox message={error} />
      {!data ? (
        <ListSkeleton />
      ) : data.items.length === 0 ? (
        <Empty>Никого не нашлось.</Empty>
      ) : (
        <ul className="space-y-2">
          <li className="text-[13px] text-ink-500 px-0.5">
            {data.total} {pluralRu(data.total, ['пользователь', 'пользователя', 'пользователей'])}
          </li>
          {data.items.map((u) => (
            <li key={u.id} className={`rounded-2xl bg-white ring-1 shadow-card p-3 ${u.blockedAt ? 'ring-rose-200' : 'ring-black/5'}`}>
              <div className="flex items-center gap-3">
                <Avatar person={{ name: u.name || u.email, avatar: u.avatar }} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-ink-900 truncate">{u.name || 'Без имени'}</span>
                    {(u.role === 'admin' || u.role === 'owner') && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">админ</span>
                    )}
                    {u.blockedAt && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800">заблокирован</span>
                    )}
                    {!u.onboardedAt && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">без профиля</span>
                    )}
                  </div>
                  <div className="text-[12px] text-ink-500 truncate">{u.email || u.phone || u.id}</div>
                  <div className="text-[12px] text-ink-500" suppressHydrationWarning>
                    {u.homeCityId ? cityName(u.homeCityId) : 'город не указан'} · {u._count?.ads ?? 0} объявл.
                    {u.reviewsCount > 0 && ` · ★ ${u.rating.toFixed(1)} (${u.reviewsCount})`} · с {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                  {u.blockedAt && u.blockReason && <div className="text-[12px] text-rose-700">Причина: {u.blockReason}</div>}
                </div>
              </div>

              {blocking === u.id ? (
                <div className="mt-2">
                  <ReasonForm
                    title="Заблокировать: не сможет публиковать, писать и оценивать"
                    confirmLabel="Заблокировать"
                    busy={busy}
                    onCancel={() => setBlocking(null)}
                    onConfirm={(reason) => act(() => adminBlockUser(u.id, true, reason))}
                  />
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button onClick={() => onShowAds(u)} className="h-8 px-3 rounded-lg ring-1 ring-black/10 text-ink-700 hover:bg-slate-50 text-[13px] font-semibold">
                    Объявления
                  </button>
                  {u.onboardedAt && !u.blockedAt && (
                    <Link href={`/user/${u.id}`} target="_blank" className="h-8 px-3 rounded-lg ring-1 ring-black/10 text-ink-700 hover:bg-slate-50 text-[13px] font-semibold inline-flex items-center">
                      Страница
                    </Link>
                  )}
                  {u.id !== me.id &&
                    (u.blockedAt ? (
                      <button onClick={() => act(() => adminBlockUser(u.id, false))} disabled={busy} className="h-8 px-3 rounded-lg ring-1 ring-emerald-300 text-emerald-800 hover:bg-emerald-50 text-[13px] font-semibold">
                        Разблокировать
                      </button>
                    ) : (
                      <button onClick={() => setBlocking(u.id)} className="h-8 px-3 rounded-lg ring-1 ring-rose-200 text-rose-700 hover:bg-rose-50 text-[13px] font-semibold">
                        Заблокировать
                      </button>
                    ))}
                  {u.id !== me.id && (
                    <button onClick={() => onDelete(u)} disabled={busy} className="ml-auto h-8 w-8 grid place-items-center rounded-lg text-rose-600 hover:bg-rose-50" aria-label="Удалить пользователя">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {data && <Pager total={data.total} offset={offset} onOffset={setOffset} />}
    </div>
  );
}

// ── Отзывы ─────────────────────────────────────────────────────────

function ReviewsTab({ onChanged }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems((await adminListReviews()).items);
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function remove(r) {
    if (!window.confirm('Удалить отзыв? Рейтинг пользователя пересчитается.')) return;
    try {
      await adminDeleteReview(r.id);
      await load();
      onChanged();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-3">
      <ErrorBox message={error} />
      {!items ? (
        <ListSkeleton />
      ) : items.length === 0 ? (
        <Empty>Отзывов пока нет.</Empty>
      ) : (
        <ul className="space-y-2">
          {items.map((r) => (
            <li key={r.id} className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-3">
              <div className="flex items-center gap-2 text-sm">
                <Stars value={r.rating} size="w-3.5 h-3.5" />
                <span className="text-ink-500 text-[12px]" suppressHydrationWarning>
                  {formatRelative(r.createdAt)}
                </span>
                <button onClick={() => remove(r)} className="ml-auto h-8 w-8 grid place-items-center rounded-lg text-rose-600 hover:bg-rose-50" aria-label="Удалить отзыв">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[13px] text-ink-700 mt-1">
                <Link href={`/user/${r.author.id}`} target="_blank" className="font-semibold hover:text-accent-700">
                  {r.author.name || 'Пользователь'}
                </Link>{' '}
                →{' '}
                <Link href={`/user/${r.target.id}`} target="_blank" className="font-semibold hover:text-accent-700">
                  {r.target.name || 'Пользователь'}
                </Link>
                <span className="text-ink-500"> · «{r.adTitle}»</span>
              </div>
              {r.text && <p className="mt-1 text-sm text-ink-800 whitespace-pre-line break-words">{r.text}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Настройки ──────────────────────────────────────────────────────
// Всё, что управляет лентой и модерацией; ключи и диапазоны задаёт API (/admin/settings).

function SettingsTab({ onChanged }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(null);
  const [draft, setDraft] = useState({});

  const load = useCallback(async () => {
    try {
      const data = await adminGetSettings();
      setItems(data.items);
      setDraft(Object.fromEntries(data.items.map((i) => [i.key, i.value])));
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function save(key, value) {
    setSaving(key);
    setError(null);
    try {
      await adminSetSetting(key, value);
      await load();
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  }

  if (!items) return error ? <ErrorBox message={error} /> : <ListSkeleton rows={3} />;
  // app.* — отдельным блоком «Приложение и уведомления»
  const general = items.filter((i) => !i.key.startsWith('app.'));
  const appItems = items.filter((i) => i.key.startsWith('app.'));
  const [toggles, numbers] = [general.filter((i) => i.type === 'bool'), general.filter((i) => i.type === 'number')];

  return (
    <div className="space-y-3">
      <ErrorBox message={error} />
      {toggles.map((s) => {
        const on = s.value === 'true';
        return (
          <div key={s.key} className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4 flex items-start gap-4">
            <div className="flex-1">
              <div className="font-bold text-ink-900">{s.label}</div>
              <p className="text-sm text-ink-500 mt-0.5">
                {s.key === 'moderation.autoApprove'
                  ? on
                    ? 'Включено: новые объявления сразу попадают в ленту. Следите за жалобами.'
                    : 'Выключено: новые объявления ждут одобрения в «Объявления → На модерации», вам приходит уведомление.'
                  : s.hint}
              </p>
            </div>
            <button
              onClick={() => save(s.key, !on)}
              disabled={saving === s.key}
              role="switch"
              aria-checked={on}
              aria-label={s.label}
              className={`relative w-12 h-7 rounded-full transition-colors shrink-0 disabled:opacity-50 ${on ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
        );
      })}

      <section className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4">
        <h3 className="font-bold text-ink-900">Лента и подъём</h3>
        <p className="text-[13px] text-ink-500 mt-0.5">
          Рейтинг объявления = свежесть × вес + качество × вес + доверие × вес + интерес × вес. Новые и поднятые
          первые сутки получают бонус. Изменения применяются в течение минуты.
        </p>
        <div className="mt-3 divide-y divide-slate-100">
          {numbers.map((s) => {
            const changed = String(draft[s.key]) !== String(s.value);
            return (
              <div key={s.key} className="py-3 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-ink-900">{s.label}</div>
                  {s.hint && <div className="text-[12px] text-ink-500">{s.hint}</div>}
                  <div className="text-[11px] text-ink-400">
                    от {s.min} до {s.max}, по умолчанию {s.default}
                  </div>
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  min={s.min}
                  max={s.max}
                  step={s.step || 'any'}
                  value={draft[s.key] ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, [s.key]: e.target.value }))}
                  className="w-20 h-9 rounded-xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-2 text-right tabular-nums"
                />
                <button
                  onClick={() => save(s.key, draft[s.key])}
                  disabled={!changed || saving === s.key}
                  className="h-9 px-3 rounded-xl btn-primary text-[13px]"
                >
                  {saving === s.key ? '…' : 'OK'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <AppPromptsSettings items={appItems} draft={draft} setDraft={setDraft} save={save} saving={saving} />
      <NeighborsSettings />
      <ContactsSettings />
      <LegalSettings />
    </div>
  );
}

// Когда показывать окно установки приложения и предложение уведомлений, тексты окна.
// Правила применяются на устройствах при следующем открытии сайта (кеш настроек — до 5 минут).
const APP_TEXT_INPUTS = [
  ['title', 'Заголовок', 'Установите приложение!'],
  ['subtitle', 'Подзаголовок', 'Бесплатно, без App Store и Google Play'],
  ['benefit1Title', 'Пункт 1 — заголовок', 'Ничего не пропустите'],
  ['benefit1Text', 'Пункт 1 — текст', 'ответы продавцов и покупателей сразу приходят уведомлением'],
  ['benefit2Title', 'Пункт 2 — заголовок', 'Скоро'],
  ['benefit2Text', 'Пункт 2 — текст', 'уведомления о новых объявлениях в любимых категориях']
];

function AppPromptsSettings({ items, draft, setDraft, save, saving }) {
  const { openInstallGuide } = useApp();
  const [texts, setTexts] = useState(null);
  const [savedTexts, setSavedTexts] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSiteSettings().then((s) => {
      const t = Object.fromEntries(APP_TEXT_INPUTS.map(([k]) => [k, s.app?.texts?.[k] || '']));
      setTexts(t);
      setSavedTexts(t);
    });
  }, []);

  async function saveTexts(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const t = await adminSetAppTexts(texts);
      const next = Object.fromEntries(APP_TEXT_INPUTS.map(([k]) => [k, t[k] || '']));
      setTexts(next);
      setSavedTexts(next);
      await loadAppConfig(); // чтобы «Показать окно» сразу показало новые тексты
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const textsChanged = texts && savedTexts && APP_TEXT_INPUTS.some(([k]) => texts[k] !== savedTexts[k]);

  return (
    <section className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4 space-y-3">
      <div>
        <h3 className="font-bold text-ink-900">Приложение и уведомления</h3>
        <p className="text-[13px] text-ink-500 mt-0.5">
          Когда сами появляются окно и баннер «Установите приложение!» и предложение включить уведомления. Уже установленным окно
          установки не показывается. Изменения доходят до телефонов в течение 5 минут.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((s) => {
          if (s.type === 'bool') {
            const on = s.value === 'true';
            return (
              <div key={s.key} className="py-3 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-ink-900">{s.label}</div>
                  {s.hint && <div className="text-[12px] text-ink-500">{s.hint}</div>}
                </div>
                <button
                  onClick={() => save(s.key, !on)}
                  disabled={saving === s.key}
                  role="switch"
                  aria-checked={on}
                  aria-label={s.label}
                  className={`relative w-12 h-7 rounded-full transition-colors shrink-0 disabled:opacity-50 ${on ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
            );
          }
          const changed = String(draft[s.key]) !== String(s.value);
          return (
            <div key={s.key} className="py-3 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-ink-900">{s.label}</div>
                {s.hint && <div className="text-[12px] text-ink-500">{s.hint}</div>}
                <div className="text-[11px] text-ink-400">
                  от {s.min} до {s.max}, по умолчанию {s.default}
                </div>
              </div>
              <input
                type="number"
                inputMode="numeric"
                min={s.min}
                max={s.max}
                step={s.step || 1}
                value={draft[s.key] ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [s.key]: e.target.value }))}
                className="w-20 h-9 rounded-xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-2 text-right tabular-nums"
              />
              <button
                onClick={() => save(s.key, draft[s.key])}
                disabled={!changed || saving === s.key}
                className="h-9 px-3 rounded-xl btn-primary text-[13px]"
              >
                {saving === s.key ? '…' : 'OK'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Диагностика на телефоне: почему окно показывается или нет именно на этом устройстве */}
      <div className="rounded-2xl bg-slate-50 ring-1 ring-black/5 p-3 space-y-2">
        <div className="text-sm font-bold text-ink-900">Проверка на телефоне — страница диагностики</div>
        <p className="text-[13px] text-ink-700">
          Откройте на нужном телефоне <b>доска-квн.рф/app-status</b>. Страница покажет, появится ли окно установки
          на этом устройстве и почему нет (пауза, уже установлено, выключено здесь), номер захода, состояние
          уведомлений. Там же кнопки «Показать окно», «Включить уведомления» и «Сбросить показы» — чтобы проверить
          правила заново. Ссылки на неё на сайте нет, в поиске она закрыта; данных пользователей не показывает.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/app-status" target="_blank" className="h-9 px-3.5 rounded-xl btn-primary text-[13px]">
            Открыть диагностику
          </Link>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/app-status`)}
            className="h-9 px-3.5 rounded-xl btn-outline text-[13px]"
          >
            Скопировать ссылку
          </button>
        </div>
      </div>

      <form onSubmit={saveTexts} className="space-y-2 pt-1">
        <div className="text-sm font-bold text-ink-900">Тексты окна установки</div>
        <div className="text-[12px] text-ink-500">Пустое поле — текст по умолчанию (виден серым).</div>
        <ErrorBox message={error} />
        {!texts ? (
          <div className="h-24 rounded-xl bg-slate-50 animate-pulse" />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {APP_TEXT_INPUTS.map(([k, label, ph]) => (
              <label key={k} className="block">
                <div className="text-[12px] font-semibold text-ink-700 mb-1">{label}</div>
                <input
                  value={texts[k]}
                  onChange={(e) => setTexts((t) => ({ ...t, [k]: e.target.value.slice(0, 120) }))}
                  placeholder={ph}
                  className="w-full h-10 rounded-xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-3 text-base"
                />
              </label>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={!textsChanged || busy} className="h-10 px-4 rounded-xl btn-primary text-sm">
            {busy ? 'Сохраняем…' : 'Сохранить тексты'}
          </button>
          <button type="button" onClick={() => openInstallGuide()} className="h-10 px-4 rounded-xl btn-outline text-sm">
            Показать окно сейчас
          </button>
        </div>
      </form>
    </section>
  );
}

// Соседи города для блока «В соседних городах» в ленте. Не задано — по умолчанию:
// остальные города того же региона и запущенные соседние регионы.
function NeighborsSettings() {
  const [neighbors, setNeighbors] = useState(null);
  const [cityId, setCityId] = useState(CITIES[0]?.id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSiteSettings().then((s) => setNeighbors(s.neighbors));
  }, []);

  async function save(list) {
    setBusy(true);
    setError(null);
    try {
      setNeighbors(await adminSetNeighbors(cityId, list));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const custom = neighbors?.[cityId];
  const city = CITIES.find((c) => c.id === cityId);
  const defaults = CITIES.filter((c) => c.regionId === city?.regionId && c.id !== cityId).map((c) => c.name);

  return (
    <section className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4 space-y-3">
      <div>
        <h3 className="font-bold text-ink-900">Соседние города</h3>
        <p className="text-[13px] text-ink-500 mt-0.5">
          Чьи объявления показывать в блоке «В соседних городах», когда в ленте выбран город.
        </p>
      </div>
      <ErrorBox message={error} />
      <div className="flex flex-wrap gap-1.5">
        {CITIES.map((c) => (
          <button key={c.id} onClick={() => setCityId(c.id)} className={`chip chip-sm ${c.id === cityId ? 'chip-on' : ''}`}>
            {c.name}
            {neighbors?.[c.id] && <span className="text-accent-700">•</span>}
          </button>
        ))}
      </div>
      {neighbors === null ? (
        <div className="h-16 rounded-xl bg-slate-50 animate-pulse" />
      ) : (
        <div className="rounded-xl bg-slate-50 p-3 space-y-2">
          <div className="text-[13px] text-ink-700">
            Соседи города <b>{city?.name}</b>:{' '}
            {custom ? (
              custom.length ? 'выбраны вручную' : 'не показывать блок'
            ) : (
              <>по умолчанию — {defaults.length ? defaults.join(', ') : 'нет'}</>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CITIES.filter((c) => c.id !== cityId).map((c) => {
              const list = custom || [];
              const on = list.includes(c.id);
              return (
                <button
                  key={c.id}
                  disabled={busy}
                  onClick={() => save(on ? list.filter((x) => x !== c.id) : [...list, c.id])}
                  className={`chip chip-sm ${on ? 'chip-on' : ''}`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
          {custom && (
            <button disabled={busy} onClick={() => save(null)} className="text-[13px] font-semibold text-accent-700 hover:underline">
              Вернуть по умолчанию
            </button>
          )}
        </div>
      )}
    </section>
  );
}

// Контакты в подвале сайта. Пустое поле не показывается.
const CONTACT_INPUTS = [
  ['email', 'Почта', 'hello@доска-квн.рф'],
  ['phone', 'Телефон', '+7 999 123-45-67'],
  ['telegram', 'Telegram', '@doska_kvn'],
  ['vk', 'VK', 'vk.com/doska_kvn']
];

const LEGAL_TABS = [
  ['terms', 'Правила сервиса', '/terms'],
  ['privacy', 'Политика конфиденциальности', '/privacy']
];

// Правила и политика конфиденциальности: правка текста, дата редакции, предпросмотр.
function LegalSettings() {
  const [doc, setDoc] = useState('terms');
  const [form, setForm] = useState(null); // { text, date }
  const [saved, setSaved] = useState(null);
  const [custom, setCustom] = useState(false);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const apply = (data) => {
    const d = LEGAL_DEFAULTS[doc];
    const next = data?.custom ? { text: data.text, date: data.date || d.date } : { text: d.text, date: d.date };
    setForm(next);
    setSaved(next);
    setCustom(!!data?.custom);
  };

  useEffect(() => {
    setForm(null);
    setError(null);
    setDone(false);
    setPreview(false);
    adminGetLegal(doc)
      .then(apply)
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc]);

  const changed = form && saved && (form.text !== saved.text || form.date !== saved.date);
  const page = LEGAL_TABS.find(([k]) => k === doc)[2];

  async function save() {
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      apply(await adminSetLegal(doc, form));
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    if (!window.confirm('Вернуть исходный текст? Ваши правки этого документа будут удалены.')) return;
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      apply(await adminResetLegal(doc));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4 space-y-3">
      <div>
        <h3 className="font-bold text-ink-900">Правила и политика</h3>
        <p className="text-[13px] text-ink-500 mt-0.5">
          Текст страниц «Правила сервиса» и «Политика конфиденциальности». На сайте обновляется в течение минуты после
          сохранения. Разметка: <code>## Заголовок</code>, <code>- пункт списка</code>, <code>**жирный**</code>,{' '}
          <code>[текст](/адрес)</code>; пустая строка — новый абзац.
        </p>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {LEGAL_TABS.map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              if (k === doc) return;
              if (changed && !window.confirm('Есть несохранённые правки. Перейти без сохранения?')) return;
              setDoc(k);
            }}
            className={`chip shrink-0 ${k === doc ? 'chip-on' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>
      <ErrorBox message={error} />
      {!form ? (
        <div className="h-64 rounded-xl bg-slate-50 animate-pulse" />
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <div className="text-[12px] font-semibold text-ink-700 mb-1">Дата редакции</div>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="h-10 rounded-xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-3 text-base"
              />
            </label>
            <div className="text-[13px] text-ink-500 pb-2">
              {custom ? 'Действует ваш текст' : 'Действует исходный текст'} · {form.text.length.toLocaleString('ru-RU')} знаков
            </div>
            <button type="button" onClick={() => setPreview((v) => !v)} className="btn-outline h-10 px-4 text-sm ml-auto">
              {preview ? 'К тексту' : 'Предпросмотр'}
            </button>
          </div>
          {preview ? (
            <div className="rounded-xl ring-1 ring-black/10 p-4 max-h-[70vh] overflow-y-auto">
              <LegalBody text={form.text} />
            </div>
          ) : (
            <textarea
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value.slice(0, 120000) }))}
              spellCheck={false}
              aria-label="Текст документа"
              className="w-full h-[60vh] rounded-xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none p-3 text-[14px] leading-relaxed font-mono"
            />
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={save} disabled={!changed || busy} className="h-10 px-4 rounded-xl btn-primary text-sm">
              {busy ? 'Сохраняем…' : 'Сохранить'}
            </button>
            {custom && (
              <button type="button" onClick={reset} disabled={busy} className="btn-outline h-10 px-4 text-sm">
                Вернуть исходный текст
              </button>
            )}
            <Link href={page} target="_blank" className="btn-outline h-10 px-4 text-sm">
              Открыть страницу
            </Link>
            {done && !changed && <span className="text-[13px] text-emerald-700">Сохранено</span>}
          </div>
        </>
      )}
    </div>
  );
}

function ContactsSettings() {
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSiteSettings().then((s) => {
      const c = Object.fromEntries(CONTACT_INPUTS.map(([k]) => [k, s.contacts[k] || '']));
      setForm(c);
      setSaved(c);
    });
  }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const c = await adminSetContacts(form);
      const next = Object.fromEntries(CONTACT_INPUTS.map(([k]) => [k, c[k] || '']));
      setForm(next);
      setSaved(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const changed = form && saved && CONTACT_INPUTS.some(([k]) => form[k] !== saved[k]);

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4 space-y-3">
      <div>
        <h3 className="font-bold text-ink-900">Контакты в подвале сайта</h3>
        <p className="text-[13px] text-ink-500 mt-0.5">Пустое поле не показывается. «Написать в поддержку» есть всегда.</p>
      </div>
      <ErrorBox message={error} />
      {!form ? (
        <div className="h-24 rounded-xl bg-slate-50 animate-pulse" />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {CONTACT_INPUTS.map(([k, label, ph]) => (
            <label key={k} className="block">
              <div className="text-[12px] font-semibold text-ink-700 mb-1">{label}</div>
              <input
                value={form[k]}
                onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value.slice(0, 200) }))}
                placeholder={ph}
                className="w-full h-10 rounded-xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-3 text-base"
              />
            </label>
          ))}
        </div>
      )}
      <button type="submit" disabled={!changed || busy} className="h-10 px-4 rounded-xl btn-primary text-sm">
        {busy ? 'Сохраняем…' : 'Сохранить контакты'}
      </button>
    </form>
  );
}

// ── Приложение: установки, активность, пуши, воронка окна установки ──

const PLATFORM_LABEL = { ios: 'iPhone', android: 'Android', desktop: 'Компьютер' };
const FUNNEL = [
  ['install_prompt_shown', 'Показали окно установки'],
  ['install_clicked', 'Нажали «Установить» (Android/ПК)'],
  ['install_accepted', 'Установили через системное окно'],
  ['install_dismissed', 'Окно: «Не показывать» или крестик'],
  ['banner_clicked', 'Баннер: нажали «Установить»'],
  ['banner_closed', 'Баннер: закрыли крестиком'],
  ['push_prompt_shown', 'Предложили уведомления'],
  ['push_enabled', 'Включили уведомления']
];

function AppStats() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const load = useCallback(() => adminAppStats().then(setData).catch((err) => setError(err.message)), []);
  useEffect(() => {
    load();
  }, [load]);
  async function reset() {
    if (!window.confirm('Обнулить метрики приложения: установки, открытия и воронку? Подписки на уведомления останутся.')) return;
    try {
      await adminResetAppStats();
      load();
    } catch (err) {
      setError(err.message);
    }
  }
  if (error) return <ErrorBox message={error} />;
  if (!data) return <div className="h-32 rounded-2xl bg-white ring-1 ring-black/5 animate-pulse" />;
  const platforms = Object.entries(data.byPlatform);

  return (
    <section className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4 space-y-3">
      <div>
        <h3 className="font-bold text-ink-900">Приложение</h3>
        <p className="text-[12px] text-ink-500">
          «Установлено» — открыли с иконки на экране (на iPhone другого способа узнать нет) или Android сообщил об установке.
          Удаление браузер не сообщает — смотрите на «пользуются за 7 дней».
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MiniStat label="Установили" value={data.total} hint={`+${data.new7d} за 7 дней`} />
        <MiniStat label="Пользуются" value={data.active7d} hint="открывали за 7 дней" />
        <MiniStat label="С уведомлениями" value={data.pushUsers} hint="пользователей" />
        <MiniStat
          label="Платформы"
          value={platforms.length ? platforms.map(([p, n]) => `${PLATFORM_LABEL[p] || p} ${n}`).join(' · ') : '—'}
          small
        />
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer font-semibold text-ink-700">Воронка за 30 дней</summary>
        <ul className="mt-2 divide-y divide-slate-100">
          {FUNNEL.map(([key, label]) => (
            <li key={key} className="py-1.5 flex justify-between gap-3">
              <span className="text-ink-700">{label}</span>
              <span className="font-bold tabular-nums">{data.funnel30d[key] || 0}</span>
            </li>
          ))}
        </ul>
      </details>
      <details className="text-sm">
        <summary className="cursor-pointer font-semibold text-ink-700">Кто установил ({data.devices.length})</summary>
        <ul className="mt-2 divide-y divide-slate-100">
          {data.devices.map((d) => (
            <li key={d.id} className="py-2 flex items-center gap-3">
              {d.user ? <Avatar person={d.user} size="xs" /> : <span className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />}
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-ink-900 truncate">
                  {d.user ? d.user.name || d.user.email : 'Гость (ещё не вошёл)'}
                </div>
                <div className="text-[12px] text-ink-500" suppressHydrationWarning>
                  {PLATFORM_LABEL[d.platform] || d.platform}
                  {d.browser ? ` · ${d.browser}` : ''} · установил {formatRelative(d.installedAt)} · открывал {formatRelative(d.lastOpenAt)} ·{' '}
                  {d.opens} {pluralRu(d.opens, ['раз', 'раза', 'раз'])}
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  d.push ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {d.push ? 'пуши вкл' : 'без пушей'}
              </span>
            </li>
          ))}
          {!data.devices.length && <li className="py-2 text-ink-500">Пока никто не установил</li>}
        </ul>
      </details>
      <button onClick={reset} className="text-[12px] font-semibold text-ink-500 hover:text-rose-700">
        Обнулить метрики (перед запуском — в них тестовые данные)
      </button>
    </section>
  );
}

function MiniStat({ label, value, hint, small }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-[12px] text-ink-500">{label}</div>
      <div className={`${small ? 'text-sm' : 'text-xl'} font-black text-ink-900 mt-0.5`}>{value}</div>
      {hint && <div className="text-[11px] text-ink-500">{hint}</div>}
    </div>
  );
}

// ── Поддержка ──────────────────────────────────────────────────────

const TICKET_TOPICS = { question: 'Вопрос', problem: 'Проблема', complaint: 'Жалоба на пользователя', idea: 'Предложение' };
const TICKET_FILTERS = [
  { key: 'open', label: 'Ждут ответа' },
  { key: 'answered', label: 'Отвечено' },
  { key: 'closed', label: 'Закрытые' },
  { key: '', label: 'Все' }
];

function SupportTab({ focusId, onChanged }) {
  const [status, setStatus] = useState('open');
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems((await adminListSupport(status)).items);
    } catch (err) {
      setError(err.message);
    }
  }, [status]);
  useEffect(() => {
    setItems(null);
    load();
  }, [load]);

  // Пришли по ссылке из уведомления — прокручиваем к обращению.
  useEffect(() => {
    if (!focusId || !items) return;
    document.getElementById(`ticket-${focusId}`)?.scrollIntoView({ block: 'center' });
  }, [focusId, items]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {TICKET_FILTERS.map((f) => (
          <button key={f.key || 'all'} onClick={() => setStatus(f.key)} className={`chip chip-sm ${status === f.key ? 'chip-on' : ''}`}>
            {f.label}
          </button>
        ))}
      </div>
      <ErrorBox message={error} />
      {!items ? (
        <ListSkeleton />
      ) : items.length === 0 ? (
        <Empty>{status === 'open' ? 'Все обращения отвечены 🎉' : 'Пусто.'}</Empty>
      ) : (
        <ul className="space-y-2">
          {items.map((t) => (
            <SupportTicket key={t.id} ticket={t} focused={t.id === focusId} onChanged={() => { load(); onChanged(); }} />
          ))}
        </ul>
      )}
    </div>
  );
}

function SupportTicket({ ticket, focused, onChanged }) {
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  async function run(fn) {
    setBusy(true);
    try {
      await fn();
      onChanged();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li id={`ticket-${ticket.id}`} className={`rounded-2xl bg-white ring-1 shadow-card p-3 space-y-2 ${focused ? 'ring-accent-400' : 'ring-black/5'}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-semibold text-ink-900">{TICKET_TOPICS[ticket.topic] || ticket.topic}</span>
        <span className="text-[12px] text-ink-500" suppressHydrationWarning>
          {ticket.user?.name || ticket.user?.email} · {formatRelative(ticket.updatedAt)}
        </span>
        {ticket.user?.blockedAt && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800">заблокирован</span>}
      </div>
      <div className="space-y-1.5">
        {ticket.messages.map((m) => (
          <div key={m.id} className={`flex ${m.fromAdmin ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                m.fromAdmin ? 'bg-accent-100 text-ink-900 rounded-br-sm' : 'bg-slate-100 text-ink-900 rounded-bl-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
      {ticket.status !== 'closed' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (reply.trim()) run(async () => { await adminReplySupport(ticket.id, reply.trim()); setReply(''); });
          }}
          className="space-y-2"
        >
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value.slice(0, 2000))}
            rows={2}
            placeholder="Ответ — придёт пользователю в уведомления и на почту"
            className="w-full rounded-xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-3 py-2 text-sm resize-none"
          />
          <div className="flex gap-1.5">
            <button type="submit" disabled={busy || !reply.trim()} className="h-8 px-3 rounded-lg btn-primary text-[13px]">
              Ответить
            </button>
            <button type="button" onClick={() => run(() => adminSetSupportStatus(ticket.id, 'closed'))} disabled={busy} className="h-8 px-3 rounded-lg ring-1 ring-black/10 text-ink-700 hover:bg-slate-50 text-[13px] font-semibold">
              Закрыть
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => run(() => adminSetSupportStatus(ticket.id, 'open'))} disabled={busy} className="h-8 px-3 rounded-lg ring-1 ring-black/10 text-ink-700 hover:bg-slate-50 text-[13px] font-semibold">
          Открыть заново
        </button>
      )}
    </li>
  );
}
