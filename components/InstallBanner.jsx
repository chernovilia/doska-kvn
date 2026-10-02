'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import {
  bannerPausedUntil,
  canPromptInstall,
  dismissBanner,
  getAppConfig,
  installSupported,
  promptInstall,
  trackAppEvent
} from '@/lib/pwa';

// Где баннер не показываем: вход и служебные страницы; чат занимает весь экран.
const HIDDEN_PATHS = /^\/(login|onboarding|admin|terms|privacy|messages|app-status)/;

/**
 * Узкий баннер «Установите приложение» над страницей: иконка, заголовок, «Установить», крестик.
 * Виден, пока сайт не установлен; крестик прячет на срок паузы из админки (как «Не показывать»
 * в окне). «Установить»: системное окно, где оно есть (Android, Chrome), иначе — окно-инструкция.
 * ready — настройки из админки загружены (до этого не рисуем, чтобы баннер не мигал).
 */
export default function InstallBanner({ ready, onOpenGuide }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const cfg = getAppConfig();
    setVisible(cfg['app.banner.enabled'] && installSupported() && bannerPausedUntil() <= Date.now());
  }, [ready]);

  if (!visible || HIDDEN_PATHS.test(pathname || '')) return null;
  const texts = getAppConfig().texts || {};

  async function install() {
    trackAppEvent('banner_clicked');
    if (canPromptInstall()) {
      const outcome = await promptInstall();
      if (outcome === 'accepted') setVisible(false);
      return;
    }
    onOpenGuide?.();
  }

  function close() {
    trackAppEvent('banner_closed');
    dismissBanner();
    setVisible(false);
  }

  return (
    <div className="bg-accent-50 border-b border-accent-200">
      <div className="max-w-6xl mx-auto px-3 md:px-6 h-11 flex items-center gap-2">
        <img src="/icons/icon-192.png" alt="" className="w-7 h-7 rounded-lg ring-1 ring-black/10 shrink-0" />
        <div className="min-w-0 flex-1 text-[12px] leading-tight font-bold text-ink-900 line-clamp-2">
          {texts.title || 'Установите приложение!'}
        </div>
        <button onClick={install} className="btn-primary h-8 px-3 rounded-full text-[13px] shrink-0">
          Установить
        </button>
        <button
          onClick={close}
          aria-label="Скрыть баннер"
          className="w-8 h-8 -mr-1.5 grid place-items-center rounded-full text-ink-500 hover:bg-accent-100 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
