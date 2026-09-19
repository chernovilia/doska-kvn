'use client';

import { Home, LayoutGrid, MessageCircle, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Нижняя навигация. Показывается только на мобильных.
// Пропсы: onPost — открывает модалку подачи объявления.
export default function BottomNav({ onPost }) {
  const path = usePathname();

  const Item = ({ href, icon: Icon, label, active }) => (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold ${
        active ? 'text-brand-700' : 'text-ink-500'
      }`}
    >
      <Icon className={`h-5 w-5 ${active ? 'text-brand-700' : 'text-ink-700'}`} />
      <span>{label}</span>
    </Link>
  );

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="relative flex items-stretch">
        <Item href="/" icon={Home} label="Главная" active={path === '/'} />
        <Item
          href="/?section=1"
          icon={LayoutGrid}
          label="Разделы"
          active={false}
        />

        {/* Центральная плюс-кнопка */}
        <button
          onClick={onPost}
          className="relative -mt-6 flex-1 flex items-start justify-center"
          aria-label="Подать объявление"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-accent-500 text-white shadow-soft ring-4 ring-white">
            <Plus className="h-6 w-6" />
          </span>
        </button>

        <Item
          href="/profile?tab=messages"
          icon={MessageCircle}
          label="Сообщения"
          active={path === '/profile'}
        />
        <Item
          href="/profile"
          icon={User}
          label="Профиль"
          active={path === '/profile'}
        />
      </div>
    </nav>
  );
}
