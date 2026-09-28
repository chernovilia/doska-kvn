'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { addFavorite, getFavoriteIds, removeFavorite } from '@/lib/api';

// Одно множество id избранного на всю вкладку: сердечко в карточке, на странице
// объявления и вкладка «Избранное» в профиле всегда показывают одно и то же.
let ids = new Set();
let loadedFor = null; // id пользователя, чьё избранное загружено
let loading = null;
const listeners = new Set();

function emit() {
  const snapshot = new Set(ids);
  listeners.forEach((l) => l(snapshot));
}

function load(userId) {
  if (loadedFor === userId || loading) return;
  loading = getFavoriteIds()
    .then((r) => {
      ids = new Set(r.ids);
      loadedFor = userId;
      emit();
    })
    .catch(() => {})
    .finally(() => {
      loading = null;
    });
}

/**
 * { isFavorite(id), toggle(ad) → Promise<'added' | 'removed' | 'login'> }.
 * Гостя toggle отправляет на вход и возвращает на ту же страницу.
 */
export function useFavorites() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [set, setSet] = useState(ids);

  useEffect(() => {
    listeners.add(setSet);
    setSet(new Set(ids));
    return () => listeners.delete(setSet);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      if (loadedFor) {
        ids = new Set();
        loadedFor = null;
        emit();
      }
      return;
    }
    load(user.id);
  }, [ready, user]);

  const toggle = useCallback(
    async (ad) => {
      if (!user) {
        router.push(`/login?returnTo=${encodeURIComponent(pathname || '/')}`);
        return 'login';
      }
      const was = ids.has(ad.id);
      // Сразу красим сердечко, при ошибке откатываем.
      if (was) ids.delete(ad.id);
      else ids.add(ad.id);
      emit();
      try {
        if (was) await removeFavorite(ad.id);
        else await addFavorite(ad.id);
        return was ? 'removed' : 'added';
      } catch (err) {
        if (was) ids.add(ad.id);
        else ids.delete(ad.id);
        emit();
        throw err;
      }
    },
    [user, router, pathname]
  );

  const isFavorite = useCallback((id) => set.has(id), [set]);
  return { isFavorite, toggle, userId: user?.id || null };
}
