'use client';

/**
 * /admin — базовая админ-панель.
 * Доступ только у юзеров с me.isAdmin === true (бэк проверяет через ADMIN_EMAILS).
 *
 * MVP: счётчики + просмотр Users / Ads с пагинацией + удаление конкретных
 * записей + красная кнопка «Стереть всех юзеров».
 * Позже добавим: BusinessProfiles, Wallets, модерация Ads (approve/reject),
 * промо, платежи.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  Users,
  ShoppingBag,
  RefreshCw,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Zap,
  Filter
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import {
  adminStats,
  adminListUsers,
  adminListAds,
  adminDeleteUser,
  adminDeleteAd,
  adminWipeAll,
  adminGetModeration,
  adminSetModeration,
  adminSetAdStatus
} from '@/lib/api';

const PAGE_SIZE = 50;

export default function AdminPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [tab, setTab] = useState('overview'); // 'overview' | 'users' | 'ads'

  useEffect(() => {
    if (ready && !user) {
      router.push('/login?returnTo=/admin');
    }
  }, [ready, user, router]);

  if (!ready) return <div className="min-h-screen" />;
  if (!user) return null;

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto w-14 h-14 grid place-items-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-ink-900 mt-3">
            Нет доступа
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            У вашего аккаунта нет прав администратора. Если это ошибка —
            свяжитесь с владельцем сайта.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5"
          >
            <ArrowLeft className="w-4 h-4" />
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-black/5 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 grid place-items-center rounded-full bg-white ring-1 ring-black/10 hover:bg-brand-50"
            aria-label="На главную"
          >
            <ArrowLeft className="w-4 h-4 text-ink-800" />
          </Link>
          <ShieldCheck className="w-5 h-5 text-brand-700" />
          <div className="font-black tracking-tight text-lg text-ink-900">
            Админка
          </div>
          <div className="ml-auto text-[12px] text-ink-500">
            {user.email}
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 md:px-6 pb-2 flex gap-1">
          <TabBtn active={tab === 'overview'} onClick={() => setTab('overview')}>
            Обзор
          </TabBtn>
          <TabBtn active={tab === 'users'} onClick={() => setTab('users')}>
            <Users className="w-4 h-4 inline mr-1 -mt-0.5" />
            Пользователи
          </TabBtn>
          <TabBtn active={tab === 'ads'} onClick={() => setTab('ads')}>
            <ShoppingBag className="w-4 h-4 inline mr-1 -mt-0.5" />
            Объявления
          </TabBtn>
          <TabBtn active={tab === 'settings'} onClick={() => setTab('settings')}>
            <Sliders className="w-4 h-4 inline mr-1 -mt-0.5" />
            Настройки
          </TabBtn>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {tab === 'overview' && <OverviewTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'ads' && <AdsTab />}
        {tab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}

function SettingsTab() {
  const [autoApprove, setAutoApprove] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetModeration();
      setAutoApprove(data.autoApprove);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function toggle() {
    setSaving(true);
    setError(null);
    try {
      const data = await adminSetModeration(!autoApprove);
      setAutoApprove(data.autoApprove);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-lg font-extrabold text-ink-900">Настройки платформы</h2>

      {error && <ErrorRow message={error} />}

      <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-5">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 grid place-items-center rounded-xl ${
            autoApprove ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {autoApprove ? <Zap className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-extrabold text-ink-900">
              Модерация объявлений
            </div>
            <div className="text-[12px] text-ink-500 mt-0.5">
              {loading
                ? 'Загрузка…'
                : autoApprove
                ? 'Автопубликация: новое объявление сразу видно всем.'
                : 'Ручная модерация: новые объявления получают статус «pending» и не появляются в ленте, пока их не одобрят.'}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={toggle}
                disabled={loading || saving || autoApprove === null}
                className={`relative w-12 h-6 rounded-full transition ${
                  autoApprove ? 'bg-emerald-500' : 'bg-slate-300'
                } disabled:opacity-50`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${
                    autoApprove ? 'left-6' : 'left-0.5'
                  }`}
                />
              </button>
              <div className="text-sm font-semibold text-ink-900">
                {autoApprove ? 'Автопубликация включена' : 'Требуется одобрение'}
              </div>
              {saving && <span className="text-[11px] text-ink-500">сохраняем…</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 ring-1 ring-black/5 p-4 text-[12px] text-ink-500">
        <b className="text-ink-800">Следующим этапом</b> добавим ИИ-модерацию —
        промежуточный режим, где нейросеть быстро проверяет объявление и
        пропускает без ручной проверки, если всё чисто.
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-t-xl text-sm font-semibold border-b-2 ${
        active
          ? 'border-brand-600 text-brand-700'
          : 'border-transparent text-ink-500 hover:text-ink-800'
      }`}
    >
      {children}
    </button>
  );
}

// ── Обзор + опасная зона ────────────────────────────────────────────

function OverviewTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wiping, setWiping] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setStats(await adminStats());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function wipe() {
    const confirmText = 'СТЕРЕТЬ';
    const input = window.prompt(
      `Это удалит ВСЕХ пользователей и все объявления. Восстановить нельзя.\n\nВведите ${confirmText}, чтобы подтвердить:`
    );
    if (input !== confirmText) return;
    setWiping(true);
    setError(null);
    try {
      const result = await adminWipeAll();
      alert('Готово! Удалено:\n' + JSON.stringify(result.deleted, null, 2));
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setWiping(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-extrabold text-ink-900">Обзор</h2>
        <button
          onClick={load}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-1 text-sm rounded-xl bg-white ring-1 ring-black/10 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      {error && <ErrorRow message={error} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Пользователи" value={stats?.users} icon={Users} />
        <Stat label="Объявления" value={stats?.ads} icon={ShoppingBag} />
        <Stat label="Опубликованы" value={stats?.approvedAds} />
        <Stat label="На модерации" value={stats?.pendingAds} />
        <Stat label="Фото" value={stats?.adPhotos} />
        <Stat label="Кошельки" value={stats?.wallets} />
        <Stat label="Бизнес-профили" value={stats?.businessProfiles} />
        <Stat label="Refresh-токены" value={stats?.refreshTokens} />
        <Stat label="Email-коды (активные)" value={stats?.emailCodes} />
        <Stat label="Подписки" value={stats?.subscriptions} />
        <Stat label="Платежи" value={stats?.payments} />
      </div>

      <div className="rounded-2xl bg-rose-50 ring-1 ring-rose-200 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-extrabold text-rose-900">
              Опасная зона
            </div>
            <div className="text-[12px] text-rose-800 mt-0.5">
              Полный сброс пользовательских данных. Справочники (Регионы, Города,
              Тарифы, Настройки) не трогает — их снова насыпет seed при следующем
              деплое.
            </div>
            <button
              onClick={wipe}
              disabled={wiping}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-4 py-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {wiping ? 'Удаляем…' : 'Стереть всех юзеров и объявления'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-3">
      <div className="text-[11px] uppercase tracking-wide text-ink-500 font-bold flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </div>
      <div className="text-2xl font-black text-ink-900 mt-1 tabular-nums">
        {value ?? '—'}
      </div>
    </div>
  );
}

// ── Пользователи ─────────────────────────────────────────────────────

function UsersTab() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminListUsers({ limit: PAGE_SIZE, offset });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [offset]);

  async function onDelete(id, email) {
    if (!window.confirm(`Удалить пользователя ${email || id}? Все его объявления тоже будут удалены.`)) return;
    try {
      await adminDeleteUser(id);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-3">
      <TableHead
        title="Пользователи"
        total={total}
        offset={offset}
        pageSize={PAGE_SIZE}
        onPrev={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
        onNext={() => setOffset((o) => o + PAGE_SIZE)}
        onReload={load}
        loading={loading}
      />

      {error && <ErrorRow message={error} />}

      <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card overflow-hidden overflow-x-auto">
        <table className="min-w-full text-[13px]">
          <thead className="bg-slate-50 text-ink-500 uppercase text-[10px] tracking-wide">
            <tr>
              <Th>Email</Th>
              <Th>Имя</Th>
              <Th>Роль</Th>
              <Th>Город</Th>
              <Th>Связь</Th>
              <Th>Онбординг</Th>
              <Th>Создан</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-t border-black/5 hover:bg-brand-50/40">
                <Td>{u.email || '—'}</Td>
                <Td>{u.name || <span className="text-ink-400">не заполнено</span>}</Td>
                <Td>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    u.role === 'admin' || u.role === 'owner'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {u.role}
                  </span>
                </Td>
                <Td>{u.homeCityId || '—'}</Td>
                <Td>{u.contactMethod}</Td>
                <Td>{u.onboardedAt ? '✓' : '—'}</Td>
                <Td>{new Date(u.createdAt).toLocaleString('ru-RU')}</Td>
                <Td>
                  <button
                    onClick={() => onDelete(u.id, u.email)}
                    className="text-rose-600 hover:text-rose-800"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-ink-400">Пусто</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Объявления ───────────────────────────────────────────────────────

function AdsTab() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminListAds({ limit: PAGE_SIZE, offset, status: status || null });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [offset, status]);

  // Сбрасываем offset при смене фильтра.
  useEffect(() => { setOffset(0); }, [status]);

  async function onDelete(id, title) {
    if (!window.confirm(`Удалить объявление «${title}»?`)) return;
    try {
      await adminDeleteAd(id);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function onSetStatus(id, newStatus) {
    try {
      await adminSetAdStatus(id, newStatus);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  const filters = [
    { key: '', label: 'Все' },
    { key: 'pending', label: 'На модерации' },
    { key: 'approved', label: 'Одобрены' },
    { key: 'rejected', label: 'Отклонены' },
    { key: 'archived', label: 'В архиве' }
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-extrabold text-ink-900">
          Объявления <span className="text-ink-400 font-bold">· {total}</span>
        </h2>
        <div className="flex flex-wrap gap-1 ml-2">
          {filters.map((f) => (
            <button
              key={f.key || 'all'}
              onClick={() => setStatus(f.key)}
              className={`text-xs font-semibold rounded-full px-3 py-1.5 ring-1 ${
                status === f.key
                  ? 'bg-brand-600 text-white ring-brand-600'
                  : 'bg-white text-ink-700 ring-black/10 hover:bg-brand-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <TableNav
            total={total}
            offset={offset}
            pageSize={PAGE_SIZE}
            onPrev={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            onNext={() => setOffset((o) => o + PAGE_SIZE)}
            onReload={load}
            loading={loading}
          />
        </div>
      </div>

      {error && <ErrorRow message={error} />}

      <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card overflow-hidden overflow-x-auto">
        <table className="min-w-full text-[13px]">
          <thead className="bg-slate-50 text-ink-500 uppercase text-[10px] tracking-wide">
            <tr>
              <Th>Заголовок</Th>
              <Th>Автор</Th>
              <Th>Раздел</Th>
              <Th>Цена</Th>
              <Th>Город</Th>
              <Th>Статус</Th>
              <Th>Создано</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-t border-black/5 hover:bg-brand-50/40">
                <Td>
                  <Link href={`/ad/${a.id}`} target="_blank" className="text-brand-700 hover:underline">
                    {a.title}
                  </Link>
                </Td>
                <Td className="text-ink-500 text-[11px]">
                  {a.author?.name || '—'}
                  <div className="text-ink-400">{a.author?.email}</div>
                </Td>
                <Td>{a.section}</Td>
                <Td className="tabular-nums">{a.price ? `${a.price} ₽` : 'даром'}</Td>
                <Td>{a.cityId}</Td>
                <Td>
                  <StatusBadge status={a.status} />
                </Td>
                <Td>{new Date(a.createdAt).toLocaleString('ru-RU')}</Td>
                <Td>
                  <div className="flex items-center gap-1">
                    {a.status !== 'approved' && (
                      <button
                        onClick={() => onSetStatus(a.id, 'approved')}
                        className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold px-2 py-1 rounded-lg hover:bg-emerald-50"
                        title="Одобрить"
                      >
                        ✓ Одобрить
                      </button>
                    )}
                    {a.status !== 'rejected' && a.status === 'pending' && (
                      <button
                        onClick={() => onSetStatus(a.id, 'rejected')}
                        className="text-amber-700 hover:text-amber-900 text-[11px] font-bold px-2 py-1 rounded-lg hover:bg-amber-50"
                        title="Отклонить"
                      >
                        ✕ Откл.
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(a.id, a.title)}
                      className="text-rose-600 hover:text-rose-800 p-1"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-ink-400">Пусто</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Компактная навигация без заголовка (используется когда заголовок кастомный)
function TableNav({ total, offset, pageSize, onPrev, onNext, onReload, loading }) {
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(total, offset + pageSize);
  return (
    <div className="flex items-center gap-1">
      <div className="text-[12px] text-ink-500 mr-2 tabular-nums">
        {from}–{to} из {total}
      </div>
      <button
        onClick={onPrev}
        disabled={offset === 0}
        className="w-8 h-8 grid place-items-center rounded-full ring-1 ring-black/10 hover:bg-slate-50 disabled:opacity-40"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={onNext}
        disabled={to >= total}
        className="w-8 h-8 grid place-items-center rounded-full ring-1 ring-black/10 hover:bg-slate-50 disabled:opacity-40"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <button
        onClick={onReload}
        disabled={loading}
        className="w-8 h-8 grid place-items-center rounded-full ring-1 ring-black/10 hover:bg-slate-50 disabled:opacity-40"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    approved: 'bg-emerald-100 text-emerald-800',
    pending: 'bg-amber-100 text-amber-800',
    rejected: 'bg-rose-100 text-rose-800',
    archived: 'bg-slate-100 text-slate-700'
  };
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${map[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
}

// ── Общие кусочки ────────────────────────────────────────────────────

function TableHead({ title, total, offset, pageSize, onPrev, onNext, onReload, loading }) {
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(total, offset + pageSize);
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-lg font-extrabold text-ink-900">
        {title} <span className="text-ink-400 font-bold">· {total}</span>
      </h2>
      <div className="ml-auto flex items-center gap-1 text-[12px] text-ink-500">
        {from}–{to} из {total}
      </div>
      <button
        onClick={onPrev}
        disabled={offset === 0}
        className="w-8 h-8 grid place-items-center rounded-full ring-1 ring-black/10 hover:bg-slate-50 disabled:opacity-40"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={onNext}
        disabled={to >= total}
        className="w-8 h-8 grid place-items-center rounded-full ring-1 ring-black/10 hover:bg-slate-50 disabled:opacity-40"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <button
        onClick={onReload}
        disabled={loading}
        className="w-8 h-8 grid place-items-center rounded-full ring-1 ring-black/10 hover:bg-slate-50 disabled:opacity-40"
        title="Обновить"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}

function Th({ children }) {
  return <th className="text-left px-3 py-2 font-bold">{children}</th>;
}
function Td({ children, className = '' }) {
  return <td className={`px-3 py-2 align-middle ${className}`}>{children}</td>;
}
function ErrorRow({ message }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-rose-50 ring-1 ring-rose-200 px-3 py-2 text-[13px] text-rose-800">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      <div>{message}</div>
    </div>
  );
}
