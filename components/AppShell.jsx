'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BellRing } from 'lucide-react';
import Modal from './Modal';
import InstallGuide from './InstallGuide';
import { useToast } from './Toast';
import { useAuth } from '@/lib/auth';
import { useUnreadCount } from '@/lib/chats';
import {
  countVisit,
  touchVisit,
  dismissInstall,
  enablePush,
  installDismissedRecently,
  installSupported,
  isStandalone,
  markPushAsked,
  pushAskedRecently,
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

  const openInstallGuide = useCallback((reason = null) => setGuide({ open: true, reason }), []);

  // Каждый второй заход (2-й, 4-й, 6-й…) — через 8 секунд после начала захода.
  // Заход начинается и при возвращении в давно открытую вкладку (через 30+ минут).
  // Переходы по сайту таймер не сбрасывают; если в этот момент открыто другое окно — ждём.
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  const autoTimer = useRef(null);
  const scheduleAuto = useCallback(() => {
    let tries = 0;
    const attempt = () => {
      if (QUIET_PATHS.test(pathRef.current || '') || !installSupported() || installDismissedRecently()) return;
      // Открыто другое окно (Modal блокирует прокрутку страницы) — повторим позже, до 6 раз
      if (document.body.style.overflow === 'hidden') {
        if (tries++ < 6) autoTimer.current = setTimeout(attempt, 5000);
        return;
      }
      setGuide((g) => (g.open ? g : { open: true, reason: null }));
    };
    clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(attempt, 8000);
  }, []);

  useEffect(() => {
    const check = () => {
      const { visits, isNew } = countVisit();
      if (isNew && visits % 2 === 0) scheduleAuto();
    };
    check();
    const onVisibility = () => (document.visibilityState === 'visible' ? check() : touchVisit());
    document.addEventListener('visibilitychange', onVisibility);
    const keepAlive = setInterval(() => document.visibilityState === 'visible' && touchVisit(), 60_000);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(keepAlive);
      clearTimeout(autoTimer.current);
    };
  }, [scheduleAuto]);

  // После сообщения: сначала уведомления (если можно), иначе — установка
  const afterUsefulAction = useCallback(async () => {
    const state = await pushState();
    if (state === 'off' && user && !pushAskedRecently()) {
      markPushAsked();
      trackAppEvent('push_prompt_shown');
      setPushAsk(true);
      return;
    }
    if ((state === 'needs-install' || state === 'unsupported') && installSupported() && !installDismissedRecently()) {
      setGuide({ open: true, reason: state === 'needs-install' ? 'push' : null });
    }
  }, [user]);

  // После публикации объявления (или отправки на проверку) — окно установки каждый раз,
  // кроме 14 дней после «Не сейчас». Уже установлено или отказались — предложение уведомлений.
  const afterAdPublished = useCallback(() => {
    if (installSupported() && !installDismissedRecently()) setGuide({ open: true, reason: null });
    else afterUsefulAction();
  }, [afterUsefulAction]);

  async function turnOnPush() {
    setPushAsk(false);
    const state = await enablePush().catch(() => 'off');
    if (state === 'on') toast('Уведомления включены');
    else if (state === 'denied') toast('Уведомления запрещены в настройках браузера', { kind: 'error' });
  }

  return (
    <AppContext.Provider value={{ openInstallGuide, afterAdPublished, afterUsefulAction }}>
      {children}
      <InstallGuide
        open={guide.open}
        reason={guide.reason}
        onClose={() => setGuide({ open: false, reason: null })}
        onDismiss={dismissInstall}
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
          <button onClick={() => setPushAsk(false)} className="w-full h-10 text-sm font-semibold text-ink-500 hover:text-ink-800">
            Не сейчас
          </button>
        </div>
      </Modal>
    </AppContext.Provider>
  );
}
