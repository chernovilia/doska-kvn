'use client';

import CookieNotice from '@/components/CookieNotice';
import { getSiteSettings } from '@/lib/api';
import { goal, hit, initMetrika } from '@/lib/analytics';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BellRing } from 'lucide-react';
import Modal from './Modal';
import InstallGuide from './InstallGuide';
import InstallBanner from './InstallBanner';
import { useToast } from './Toast';
import { useAuth } from '@/lib/auth';
import { useUnreadCount } from '@/lib/chats';
import { isScrollLocked } from '@/lib/scrollLock';
import { markInAppNavigation } from '@/lib/nav';
import {
  countVisit,
  getAppConfig,
  loadAppConfig,
  touchVisit,
  dismissInstall,
  enablePush,
  installDismissedRecently,
  installSupported,
  isStandalone,
  markPushAsked,
  markPushShownThisSession,
  pushAskedRecently,
  pushShownThisSession,
  pushState,
  resyncPush,
  setAppBadge,
  trackAppEvent,
  trackAppOpen
} from '@/lib/pwa';

const AppContext = createContext({
  openInstallGuide: () => {},
  afterAdPublished: () => {},
  afterUsefulAction: () => {}
});

export function useApp() {
  return useContext(AppContext);
}

// Страницы, где окна приложения не показываем сами — там человек занят другим.
const QUIET_PATHS = /^\/(login|onboarding|admin|terms|privacy)/;

/**
 * Приложение (PWA) вокруг сайта:
 * - регистрирует service worker (пуши, счётчик на иконке);
 * - открытие с иконки — метрика «установлено/пользуется»;
 * - счётчик непрочитанных на иконке;
 * - окно установки: после каждого опубликованного (или отправленного на проверку) объявления
 *   и на каждый второй заход на сайт — если сайт ещё не установлен; «Не сейчас» — пауза 14 дней
 *   для всех автопоказов (из Настроек открывается всегда);
 * - после первого сообщения за заход — предложение включить уведомления (не чаще раза в 14 дней),
 *   на iPhone в браузере вместо него — окно установки (уведомления там только у приложения).
 */
export default function AppShell({ children }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { toast } = useToast();
  const unread = useUnreadCount(!!user);
  const [guide, setGuide] = useState({ open: false, reason: null });
  const [pushAsk, setPushAsk] = useState(false);
  const [configReady, setConfigReady] = useState(false);
  const [metrikaOn, setMetrikaOn] = useState(false);

  // Яндекс.Метрика: номер счётчика — из админки; без номера не подключается
  useEffect(() => {
    getSiteSettings().then((s) => {
      if (!s.analytics?.metrikaId) return;
      initMetrika({ id: s.analytics.metrikaId, webvisor: s.analytics.webvisor });
      setMetrikaOn(true);
    });
  }, []);

  // Service worker и «открыто с иконки» — один раз за запуск
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    if (isStandalone()) {
      try {
        if (!sessionStorage.getItem('app.openTracked')) {
          sessionStorage.setItem('app.openTracked', '1');
          trackAppOpen('standalone');
        }
      } catch {
        trackAppOpen('standalone');
      }
    }
  }, []);

  // Вошёл — напомнить серверу подписку на пуши (новый аккаунт на том же телефоне и т. п.)
  useEffect(() => {
    if (user) resyncPush();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setAppBadge(unread);
  }, [unread]);

  // Открыто вручную (Настройки, админка, диагностика) — закрытие не ставит паузу «Не сейчас»
  const openInstallGuide = useCallback((reason = null) => setGuide({ open: true, reason, manual: true }), []);

  // Каждый второй заход (2-й, 4-й, 6-й…) — через 8 секунд после начала захода.
  // Заход начинается и при возвращении в давно открытую вкладку (через 30+ минут).
  // Переходы по сайту таймер не сбрасывают; если в этот момент открыто другое окно — ждём.
  const pathRef = useRef(pathname);
  // Переход между страницами сайта — значит, у «Назад» есть куда возвращаться (lib/nav.js)
  useEffect(() => {
    if (pathRef.current !== pathname) markInAppNavigation();
    pathRef.current = pathname;
    // Просмотр страницы в Метрике — чуть позже, когда у страницы уже свой заголовок
    const t = setTimeout(hit, 400);
    return () => clearTimeout(t);
  }, [pathname]);
  const autoTimer = useRef(null);
  const scheduleAuto = useCallback(() => {
    let tries = 0;
    const attempt = () => {
      const cfg = getAppConfig();
      if (!cfg['app.install.enabled'] || QUIET_PATHS.test(pathRef.current || '') || !installSupported() || installDismissedRecently()) return;
      // Открыто другое окно (Modal блокирует прокрутку страницы) — повторим позже, до 6 раз
      if (isScrollLocked()) {
        if (tries++ < 6) autoTimer.current = setTimeout(attempt, 5000);
        return;
      }
      setGuide((g) => (g.open ? g : { open: true, reason: null }));
    };
    clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(attempt, getAppConfig()['app.install.delay_sec'] * 1000);
  }, []);

  useEffect(() => {
    let alive = true;
    // Правила показа — из админки; до ответа сервера заход не считаем
    const check = () => {
      const { visits, isNew } = countVisit();
      const n = getAppConfig()['app.install.every_nth_visit'];
      if (isNew && n > 0 && visits % n === 0) scheduleAuto();
    };
    loadAppConfig().then(() => {
      if (!alive) return;
      setConfigReady(true);
      check();
    });
    const onVisibility = () => (document.visibilityState === 'visible' ? check() : touchVisit());
    document.addEventListener('visibilitychange', onVisibility);
    const keepAlive = setInterval(() => document.visibilityState === 'visible' && touchVisit(), 60_000);
    return () => {
      alive = false;
      document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(keepAlive);
      clearTimeout(autoTimer.current);
    };
  }, [scheduleAuto]);

  // Окно «Включить уведомления?». Пауза на N дней ставится только по «Не сейчас»;
  // закрыли крестиком или тапом мимо — спросим в следующий заход.
  const askPush = useCallback(() => {
    markPushShownThisSession();
    trackAppEvent('push_prompt_shown');
    setPushAsk(true);
  }, []);
  const canAskPush = useCallback(
    async () => !!user && !pushAskedRecently() && !pushShownThisSession() && (await pushState()) === 'off',
    [user]
  );

  // После сообщения: сначала уведомления (если можно), иначе — установка.
  // noGuide — окно установки только что показывали, второй раз не открываем.
  const afterUsefulAction = useCallback(async ({ source = 'message', noGuide = false } = {}) => {
    const cfg = getAppConfig();
    const pushAllowed = source === 'publish' ? cfg['app.push.after_publish'] : cfg['app.push.after_message'];
    if (pushAllowed && (await canAskPush())) {
      askPush();
      return;
    }
    if (noGuide) return;
    const state = await pushState();
    if (
      cfg['app.install.enabled'] &&
      (state === 'needs-install' || state === 'unsupported') &&
      installSupported() &&
      !installDismissedRecently()
    ) {
      setGuide({ open: true, reason: state === 'needs-install' ? 'push' : null });
    }
  }, [canAskPush, askPush]);

  // Установленное приложение открыли (или вошли в нём), а уведомления выключены — спрашиваем
  // через пару секунд. В браузере так не делаем: там вопрос с порога только раздражает.
  useEffect(() => {
    if (!user || !configReady || !isStandalone()) return;
    if (!getAppConfig()['app.push.on_app_open']) return;
    let tries = 0;
    let timer = setTimeout(async function attempt() {
      if (QUIET_PATHS.test(pathRef.current || '')) return;
      // Открыто другое окно — подождём
      if (isScrollLocked()) {
        if (tries++ < 6) timer = setTimeout(attempt, 5000);
        return;
      }
      if (await canAskPush()) askPush();
    }, 2500);
    return () => clearTimeout(timer);
  }, [user?.id, configReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // После публикации объявления (или отправки на проверку) — окно установки каждый раз,
  // кроме 14 дней после «Не сейчас». Уже установлено или отказались — предложение уведомлений.
  const afterAdPublished = useCallback(() => {
    goal('ad_published');
    const cfg = getAppConfig();
    if (cfg['app.install.enabled'] && cfg['app.install.after_publish'] && installSupported() && !installDismissedRecently()) {
      // Сначала окно установки, после его закрытия — уведомления (там, где они работают и без установки)
      setGuide({ open: true, reason: null, thenPush: true });
    } else afterUsefulAction({ source: 'publish' });
  }, [afterUsefulAction]);

  async function turnOnPush() {
    setPushAsk(false);
    const state = await enablePush().catch(() => 'off');
    if (state === 'on') toast('Уведомления включены');
    else if (state === 'denied') toast('Уведомления запрещены в настройках браузера', { kind: 'error' });
  }

  return (
    <AppContext.Provider value={{ openInstallGuide, afterAdPublished, afterUsefulAction }}>
      <InstallBanner ready={configReady} onOpenGuide={() => openInstallGuide()} />
      <CookieNotice enabled={metrikaOn} />
      {children}
      <InstallGuide
        open={guide.open}
        reason={guide.reason}
        onClose={() => {
          const thenPush = guide.thenPush;
          setGuide({ open: false, reason: null });
          if (thenPush) setTimeout(() => afterUsefulAction({ source: 'publish', noGuide: true }), 600);
        }}
        onDismiss={guide.manual ? undefined : dismissInstall}
      />
      <Modal open={pushAsk} onClose={() => setPushAsk(false)} size="sm">
        <div className="p-5 pb-6 space-y-4">
          <div className="flex items-center gap-3 pr-10">
            <span className="w-12 h-12 rounded-2xl bg-accent-100 text-accent-700 grid place-items-center shrink-0">
              <BellRing className="w-6 h-6" />
            </span>
            <div>
              <div className="font-extrabold text-lg text-ink-900 leading-tight">Включить уведомления?</div>
              <div className="text-[13px] text-ink-500">Ответ придёт сразу — даже когда сайт закрыт</div>
            </div>
          </div>
          <button onClick={turnOnPush} className="w-full btn-primary h-12 rounded-2xl text-[15px]">
            Включить
          </button>
          <button
            onClick={() => {
              markPushAsked();
              setPushAsk(false);
            }}
            className="w-full h-10 text-sm font-semibold text-ink-500 hover:text-ink-800"
          >
            Не сейчас
          </button>
        </div>
      </Modal>
    </AppContext.Provider>
  );
}
