'use client';

import CityLogo from './CityLogo';
import SearchBar from './SearchBar';
import NotificationsButton from './NotificationsButton';
import Link from 'next/link';
import { MessageCircle, User } from 'lucide-react';

export default function Header({ place, onPlaceChange, onSearchSelect }) {
  return (
    <header className="sticky top-0 z-40 hero-gradient border-b border-black/5 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <CityLogo value={place} onChange={onPlaceChange} />

          <div className="ml-auto flex items-center gap-2">
            <NotificationsButton />
            <Link
              href="/messages"
              className="hidden md:grid w-10 h-10 place-items-center rounded-full bg-white ring-1 ring-black/5 hover:bg-brand-50 shadow-card"
              aria-label="Сообщения"
            >
              <MessageCircle className="w-4.5 h-4.5 text-ink-800" />
            </Link>
            <Link
              href="/profile"
              className="w-10 h-10 grid place-items-center rounded-full bg-white ring-1 ring-black/5 hover:bg-brand-50 shadow-card"
              aria-label="Профиль"
            >
              <User className="w-4.5 h-4.5 text-ink-800" />
            </Link>
          </div>
        </div>

        <div className="mt-3">
          <SearchBar onSelect={onSearchSelect} />
        </div>
      </div>
    </header>
  );
}
