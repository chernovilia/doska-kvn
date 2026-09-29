'use client';

import { Heart, Home, MessageCircle, Plus, User, LogIn } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useUnreadCount } from '@/lib/chats';
import UnreadBadge from './UnreadBadge';

// Нижняя навигация. Показывается только на мобильных.
// onPost — открывает модалку подачи объявления (если залогинен).
export default function BottomNav({ onPost }) {
  const path = usePathname();
  const router = useRouter();
  const { user, ready } = useAuth();
  const unread = useUnreadCount(!!user);

  function go(next) {
    if (!ready) return; // не знаем статус — игнор
    if (!user) {
      router.push(`/login?returnTo=${encodeURIComponent(next)}`);
      return;
    }
    router.push(next);
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="relative flex items-stretch h-16">
        <Item href="/" icon={Home} label="Главная" active={path === '/'} />
        <Item
          icon={Heart}
          label="Избранное"
          active={path?.startsWith('/favorites')}
          onClick={() => go('/favorites')}
        />

        {/* Центральная плюс-кнопка */}
        <button
          onClick={() => {
            if (!ready) return;
            if (!user) router.push('/login?returnTo=/');
            else onPost?.();
          }}
          className="relative -mt-5 flex-1 flex items-start justify-center"
          aria-label="Подать объявление"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-accent-500 text-white shadow-soft ring-4 ring-white">
            <Plus className="h-7 w-7" />
          </span>
        </button>

        <Item
          icon={MessageCircle}
          label="Сообщения"
          active={path?.startsWith('/messages')}
          onClick={() => go('/messages')}
          badge={unread}
        />

        {user ? (
          <Item href="/profile" icon={User} label="Профиль" active={path === '/profile'} />
        ) : (
          <Item href="/login" icon={LogIn} label="Войти" active={path?.startsWith('/login')} />
        )}
      </div>
    </nav>
  );
}

function Item({ href, icon: Icon, label, active, onClick, badge = 0 }) {
  const content = (
    <>
      <span className="relative">
        <Icon className={`h-6 w-6 ${active ? 'text-accent-700' : 'text-ink-700'}`} strokeWidth={active ? 2.2 : 1.9} />
        {badge > 0 && <UnreadBadge count={badge} />}
      </span>
      <span>{label}</span>
    </>
  );
  const cls = `flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
    active ? 'text-accent-700' : 'text-ink-500'
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
}
