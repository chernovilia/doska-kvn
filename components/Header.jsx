'use client';

import PlacePicker from './PlacePicker';
import SearchBar from './SearchBar';
import NotificationsButton from './NotificationsButton';
import Link from 'next/link';
import { Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useUnreadCount } from '@/lib/chats';
import UnreadBadge from './UnreadBadge';

// Шапка ленты: логотип, место, уведомления, вход/профиль и поиск.
// Лента разделов идёт сразу под ней (AdsView) на том же белом фоне.
export default function Header({ place, onPlaceChange, search, onSearchSubmit, onSearchSelect }) {
  const { user, ready } = useAuth();
  const unread = useUnreadCount(!!user);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_1px_0_rgba(15,23,42,0.06)]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-2 md:pt-3 pb-3">
        <div className="flex items-center gap-2 h-12">
          <Link
            href="/"
            className="font-black tracking-tight text-[24px] md:text-[28px] leading-none text-ink-900 shrink-0"
          >
            <span>Доска</span>
            <span className="brand-slash">/</span>
            <span>КВН</span>
          </Link>

          <div className="ml-auto flex items-center gap-1.5 md:gap-2.5 min-w-0">
            <PlacePicker value={place} onChange={onPlaceChange} />
            {user && <NotificationsButton />}
            {user && (
              <Link
                href="/favorites"
                className="hidden md:grid w-9 h-9 place-items-center rounded-full hover:bg-slate-100"
                aria-label="Избранное"
              >
                <Heart className="w-[22px] h-[22px] text-ink-700" strokeWidth={1.8} />
              </Link>
            )}
            {user && (
              <Link
                href="/messages"
                className="relative hidden md:grid w-9 h-9 place-items-center rounded-full hover:bg-slate-100"
                aria-label={unread ? `Сообщения, непрочитанных: ${unread}` : 'Сообщения'}
              >
                <MessageCircle className="w-[22px] h-[22px] text-ink-700" strokeWidth={1.8} />
                {unread > 0 && <UnreadBadge count={unread} />}
              </Link>
            )}

            {!ready ? (
              // Пока не знаем, вошёл ли пользователь, — место под кнопку, чтобы шапка не прыгала
              <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
            ) : user ? (
              <Link
                href="/profile"
                className="w-9 h-9 shrink-0 rounded-full bg-brand-600 text-white grid place-items-center font-black text-sm hover:bg-brand-700 overflow-hidden"
                aria-label="Профиль"
                title={user.name || 'Профиль'}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  (user.name || 'A').slice(0, 1).toUpperCase()
                )}
              </Link>
            ) : (
              <Link href="/login" className="btn-outline h-10 px-4 text-[15px] shrink-0">
                Войти
              </Link>
            )}
          </div>
        </div>

        <div className="mt-2">
          <SearchBar value={search} onSubmit={onSearchSubmit} onSelect={onSearchSelect} />
        </div>
      </div>
    </header>
  );
}
