'use client';

import CityLogo from './CityLogo';
import SearchBar from './SearchBar';
import NotificationsButton from './NotificationsButton';
import Link from 'next/link';
import { MessageCircle, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function Header({ place, onPlaceChange, onSearchSelect }) {
  const { user, ready } = useAuth();

  return (
    <header className="sticky top-0 z-40 hero-gradient border-b border-black/5 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <CityLogo value={place} onChange={onPlaceChange} />

          <div className="ml-auto flex items-center gap-2">
            {user && <NotificationsButton />}
            {user && (
              <Link
                href="/messages"
                className="hidden md:grid w-10 h-10 place-items-center rounded-full bg-white ring-1 ring-black/5 hover:bg-brand-50 shadow-card"
                aria-label="Сообщения"
              >
                <MessageCircle className="w-4.5 h-4.5 text-ink-800" />
              </Link>
            )}

            {!ready ? (
              // Skeleton пока не знаем статус — избегаем flash
              <div className="w-10 h-10 rounded-full bg-white/70 ring-1 ring-black/5" />
            ) : user ? (
              <Link
                href="/profile"
                className="w-10 h-10 rounded-full bg-brand-600 text-white ring-2 ring-white shadow-card grid place-items-center font-black text-sm hover:bg-brand-700"
                aria-label="Профиль"
                title={user.name || 'Профиль'}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  (user.name || 'A').slice(0, 1).toUpperCase()
                )}
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-card"
              >
                <LogIn className="w-4 h-4" />
                Войти
              </Link>
            )}
          </div>
        </div>

        <div className="mt-3">
          <SearchBar onSelect={onSearchSelect} />
        </div>
      </div>
    </header>
  );
}
