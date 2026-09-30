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
 * - когда предложить установку: со второго визита или после полезного действия
 *   (опубликовал объявление, написал), «Не сейчас» — пауза 14 дней;
 * - после полезного действия — предложение включить уведомления (раз в 14 дней).
 */
export default function AppShell({ children }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { toast } = useToast();
  const unread = useUnreadCount(!!user);
  const [guide, setGuide] = useState({ open: false, reason: null });
  const [pushAsk, setPushAsk] = useState(false);
  const autoTried = useRef(false);

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

  // Со второго визита, через несколько секунд после загрузки — не мешая первому впечатлению
  useEffect(() => {
    if (autoTried.current || QUIET_PATHS.test(pathname || '')) return;
    autoTried.current = true;
    const visits = countVisit();
    if (visits < 2 || installDismissedRecently() || !installSupported()) return;
    const t = setTimeout(() => setGuide((g) => (g.open ? g : { open: true, reason: null })), 8000);
    return () => clearTimeout(t);
  }, [pathname]);

  // После полезного действия: сначала уведомления (если можно), иначе — установка
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

  async function turnOnPush() {
    setPushAsk(false);
    const state = await enablePush().catch(() => 'off');
    if (state === 'on') toast('Уведомления включены');
    else if (state === 'denied') toast('Уведомления запрещены в настройках браузера', { kind: 'error' });
  }

  return (
    <AppContext.Provider value={{ openInstallGuide, afterUsefulAction }}>
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
