'use client';

import { Home, LayoutGrid, MessageCircle, Plus, User, LogIn } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import CatalogSheet from './CatalogSheet';
import { useUnreadCount } from '@/lib/chats';
import UnreadBadge from './UnreadBadge';

// Нижняя навигация. Показывается только на мобильных.
// Пропсы: onPost — открывает модалку подачи объявления (если залогинен);
// feedPath — путь ленты, если мы на ней: раздел переключается без перехода.
export default function BottomNav({ onPost, feedPath = null }) {
  const path = usePathname();
  const router = useRouter();
  const { user, ready } = useAuth();
  const unread = useUnreadCount(!!user);
  const [sectionsOpen, setSectionsOpen] = useState(false);

  function openSection(id, group) {
    setSectionsOpen(false);
    const qs = new URLSearchParams({ section: id });
    if (group) qs.set('group', group);
    if (feedPath) window.history.pushState(null, '', `${feedPath}?${qs}`);
    else router.push(`/?${qs}`);
  }

  const Item = ({ href, icon: Icon, label, active, onClick, badge = 0 }) => {
    const content = (
      <>
        <span className="relative">
          <Icon className={`h-5 w-5 ${active ? 'text-brand-700' : 'text-ink-700'}`} />
          {badge > 0 && <UnreadBadge count={badge} />}
        </span>
        <span>{label}</span>
      </>
    );
    const cls = `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold ${
      active ? 'text-brand-700' : 'text-ink-500'
    }`;
    if (onClick) {
      return (
        <button type="button" onClick={onClick} className={cls}>
          {content}
        </button>
      );
    }
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  };

  function requireAuth(next, action) {
    if (!ready) return; // не знаем статус — игнор
    if (!user) {
      router.push(`/login?returnTo=${encodeURIComponent(next)}`);
      return;
    }
    action();
  }

  // Шторка — вне <nav>: backdrop-blur делает nav контейнером для fixed-потомков.
  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="relative flex items-stretch">
          <Item href="/" icon={Home} label="Главная" active={path === '/'} />
          <Item
            icon={LayoutGrid}
            label="Разделы"
            active={sectionsOpen}
            onClick={() => setSectionsOpen(true)}
          />

          {/* Центральная плюс-кнопка */}
          <button
            onClick={() => requireAuth('/', () => onPost?.())}
            className="relative -mt-6 flex-1 flex items-start justify-center"
            aria-label="Подать объявление"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-accent-500 text-white shadow-soft ring-4 ring-white">
              <Plus className="h-6 w-6" />
            </span>
          </button>

          <Item
            icon={MessageCircle}
            label="Сообщения"
            active={path?.startsWith('/messages')}
            onClick={() => requireAuth('/messages', () => router.push('/messages'))}
            badge={unread}
          />

          {user ? (
            <Item
              href="/profile"
              icon={User}
              label="Профиль"
              active={path === '/profile'}
            />
          ) : (
            <Item
              href="/login"
              icon={LogIn}
              label="Войти"
              active={path?.startsWith('/login')}
            />
          )}
        </div>
      </nav>

      <CatalogSheet open={sectionsOpen} onClose={() => setSectionsOpen(false)} onPick={openSection} />
    </>
  );
}
