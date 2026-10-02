'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, RotateCcw } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useApp } from '@/components/AppShell';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/auth';
import {
  appLocalState,
  canPromptInstall,
  detectPlatform,
  enablePush,
  installSupported,
  isStandalone,
  loadAppConfig,
  pushState,
  resetAppLocalState
} from '@/lib/pwa';

const OS = { ios: 'iPhone / iPad', android: 'Android', desktop: 'Компьютер' };
const PUSH = {
  on: 'включены',
  off: 'выключены (можно включить)',
  denied: 'запрещены в настройках браузера',
  'needs-install': 'только в установленном приложении (iPhone)',
  unsupported: 'не поддерживаются здесь или выключены на сервере'
};

function fmt(ts) {
  return ts ? new Date(ts).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '—';
}

/**
 * /app-status — диагностика окна установки и уведомлений на этом устройстве:
 * почему окно показывается или нет, какие правила действуют, кнопки для проверки.
 * Для тестов на телефонах; в меню ссылки нет (есть в админке).
 */
export default function AppStatusPage() {
  const { user } = useAuth();
  const { openInstallGuide } = useApp();
  const { toast } = useToast();
  const [d, setD] = useState(null);

  const load = useCallback(async () => {
    const cfg = await loadAppConfig();
    // Даём AppShell засчитать заход (он тоже ждёт настройки), затем читаем состояние
    await new Promise((r) => setTimeout(r, 400));
    const local = appLocalState();
    setD({ cfg, local, platform: detectPlatform(), standalone: isStandalone(), supported: installSupported(), canPrompt: canPromptInstall(), push: await pushState() });
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (!d) return <div className="min-h-screen bg-slate-50" />;
  const { cfg, local } = d;
  const n = cfg['app.install.every_nth_visit'];
  const paused = local.installPausedUntil > Date.now();

  // Почему окно установки не покажется само — первая причина, которая сработала
  const blocker = d.standalone
    ? 'Сайт открыт как установленное приложение — окно не нужно'
    : !d.supported
      ? 'На этом устройстве и в этом браузере установить нельзя'
      : !cfg['app.install.enabled']
        ? 'Показ окна выключен в админке'
        : paused
          ? `Пауза после «Не показывать» до ${fmt(local.installPausedUntil)}`
          : null;
  const nextVisit = n > 0 ? Math.floor(local.visits / n) * n + n : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <PageHeader title="Диагностика приложения" backHref="/profile?tab=settings" maxWidth="max-w-2xl" />
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        <Card title="Итог: окно установки">
          {blocker ? (
            <p className="text-sm text-rose-700 font-semibold">Само не покажется: {blocker}</p>
          ) : (
            <p className="text-sm text-emerald-700 font-semibold">
              {n > 0 ? `Покажется на заходе № ${nextVisit} (через ${cfg['app.install.delay_sec']} с)` : 'На заходах не показывается'}
              {cfg['app.install.after_publish'] ? ' и после публикации объявления' : ''}
            </p>
          )}
        </Card>

        <Card title="Устройство">
          <Row k="Система" v={OS[d.platform.os]} />
          <Row k="Браузер" v={`${d.platform.browser}${d.platform.inApp ? ' (встроенный в приложение)' : ''}`} />
          <Row k="Открыто как приложение" v={d.standalone ? 'да' : 'нет'} />
          <Row k="Установка в одно нажатие" v={d.canPrompt ? 'доступна' : 'нет (по инструкции)'} />
          <Row k="Вход" v={user ? user.name || user.email : 'не выполнен'} />
        </Card>

        <Card title="Заходы">
          <Row k="Текущий заход" v={`№ ${local.visits}`} />
          <Row k="Последняя активность" v={fmt(local.lastSeen)} />
          <Row k="Новый заход — после перерыва" v={`${cfg['app.install.visit_gap_min']} мин`} />
        </Card>

        <Card title="Правила (из админки)">
          <Row k="Окно установки само" v={cfg['app.install.enabled'] ? 'включено' : 'выключено'} />
          <Row k="После публикации" v={cfg['app.install.after_publish'] ? 'да' : 'нет'} />
          <Row k="Каждый N-й заход" v={n > 0 ? `каждый ${n}-й` : 'выключено'} />
          <Row k="Пауза после «Не показывать»" v={`${cfg['app.install.dismiss_days']} дн.${paused ? ` — идёт до ${fmt(local.installPausedUntil)}` : ''}`} />
          <Row
            k="Баннер вверху страниц"
            v={!cfg['app.banner.enabled'] ? 'выключен' : local.bannerPausedUntil > Date.now() ? `закрыт до ${fmt(local.bannerPausedUntil)}` : 'показывается'}
          />
          <Row k="Уведомления после сообщения / публикации" v={`${cfg['app.push.after_message'] ? 'да' : 'нет'} / ${cfg['app.push.after_publish'] ? 'да' : 'нет'}`} />
          <Row k="Предлагать уведомления не чаще" v={`раз в ${cfg['app.push.ask_every_days']} дн.`} />
        </Card>

        <Card title="Уведомления">
          <Row k="На этом устройстве" v={PUSH[d.push]} />
          <Row k="Следующее предложение" v={local.pushAskPausedUntil > Date.now() ? `после ${fmt(local.pushAskPausedUntil)}` : 'можно сейчас'} />
        </Card>

        <div className="grid gap-2">
          <button onClick={() => openInstallGuide()} className="btn-primary h-11 rounded-2xl text-sm">
            Показать окно установки
          </button>
          {d.push === 'off' && (
            <button
              onClick={async () => {
                const st = await enablePush().catch(() => 'off');
                toast(st === 'on' ? 'Уведомления включены' : 'Не включились: ' + (PUSH[st] || st));
                load();
              }}
              className="btn-outline h-11 rounded-2xl text-sm"
            >
              Включить уведомления
            </button>
          )}
          <button
            onClick={() => {
              resetAppLocalState();
              toast('Показы на этом устройстве сброшены');
              load();
            }}
            className="btn-outline h-11 rounded-2xl text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Сбросить показы на этом устройстве
          </button>
          <button onClick={load} className="h-10 text-sm font-semibold text-ink-500 inline-flex items-center justify-center gap-1.5">
            <RefreshCw className="w-4 h-4" />
            Обновить
          </button>
        </div>
      </main>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-500 mb-2">{title}</h2>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-ink-500">{k}</span>
      <span className="font-semibold text-ink-900 text-right">{v}</span>
    </div>
  );
}
