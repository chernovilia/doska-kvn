'use client';

/**
 * Простой клиентский стор авторизации на localStorage.
 * Позже подменим на JWT-cookie из бэка — интерфейс останется тем же.
 *
 *   const { user, ready, signInWithEmail, signInWithVK, signOut } = useAuth();
 *
 * user === null означает «не залогинен». ready === false пока стор не поднят
 * (важно для SSR — на сервере всегда false, чтобы не флешить состояние).
 */

import { useEffect, useState, useCallback } from 'react';

const KEY = 'doska-kvn:auth';

function readStored() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStored(user) {
  if (typeof window === 'undefined') return;
  try {
    if (user) window.localStorage.setItem(KEY, JSON.stringify(user));
    else window.localStorage.removeItem(KEY);
  } catch {}
  // Оповещаем другие вкладки/компоненты.
  window.dispatchEvent(new CustomEvent('doska-kvn:auth', { detail: user }));
}

const AVATAR_FALLBACK =
  'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&h=200&fit=crop&auto=format';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readStored());
    setReady(true);
    function onChange(e) {
      setUser(e.detail || null);
    }
    window.addEventListener('doska-kvn:auth', onChange);
    return () => window.removeEventListener('doska-kvn:auth', onChange);
  }, []);

  const signInWithEmail = useCallback(async (email) => {
    // Позже — POST /auth/email → JWT. Сейчас просто мок.
    const u = {
      id: 'u-me',
      name: (email.split('@')[0] || 'Гость').replace(/[._-]/g, ' '),
      email,
      avatar: AVATAR_FALLBACK,
      via: 'email'
    };
    writeStored(u);
    setUser(u);
    return u;
  }, []);

  const signInWithVK = useCallback(async () => {
    const u = {
      id: 'u-me',
      name: 'Илья Чернов',
      vkId: '123456789',
      avatar: AVATAR_FALLBACK,
      via: 'vk'
    };
    writeStored(u);
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(() => {
    writeStored(null);
    setUser(null);
  }, []);

  return { user, ready, signInWithEmail, signInWithVK, signOut };
}

export function isAuthed() {
  return !!readStored();
}
