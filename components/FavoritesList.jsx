'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { getFavorites } from '@/lib/api';
import { useFavorites } from '@/lib/favorites';
import AdCard from './AdCard';
import AdCardSkeleton from './AdCardSkeleton';

// Избранное: список с сервера, а снятые сердечки пропадают сразу — по общему стору.
export default function FavoritesList() {
  const [items, setItems] = useState(null);
  const [failed, setFailed] = useState(false);
  const { isFavorite } = useFavorites();

  useEffect(() => {
    getFavorites()
      .then(setItems)
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return (
      <div className="rounded-2xl bg-white ring-1 ring-black/5 p-6 text-center text-sm text-ink-500">
        Не удалось загрузить избранное. Проверьте интернет и обновите страницу.
      </div>
    );
  }
  if (!items) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <AdCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  const visible = items.filter((ad) => isFavorite(ad.id));
  if (!visible.length) {
    return (
      <div className="rounded-2xl bg-white ring-1 ring-black/5 p-8 text-center">
        <Heart className="w-8 h-8 mx-auto text-ink-300" />
        <div className="mt-2 font-extrabold text-ink-900">Пока пусто</div>
        <div className="text-sm text-ink-500">Нажмите на сердечко в объявлении — оно появится здесь.</div>
        <Link href="/" className="mt-3 btn-outline h-10 px-4 text-sm">
          К объявлениям
        </Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr">
      {visible.map((ad) => (
        <div key={ad.id} className="h-full">
          <AdCard ad={ad} />
        </div>
      ))}
    </div>
  );
}
