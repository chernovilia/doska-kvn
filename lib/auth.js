'use client';

/**
 * Клиентский стор авторизации на базе httpOnly-cookies + REST API.
 *
 *   const { user, ready, requestCode, verifyCode, signOut } = useAuth();
 *
 * user === null означает «не залогинен». ready === false пока идёт первый /me.
 * Все запросы идут с credentials: 'include' — cookies отправляются автоматически.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';

const API_URL =
  (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL) ||
  'https://api.xn----7sbhf4acwc1a.xn--p1ai/v1';

// ── HTTP-помощник с credentials ────────────────────────────────────

async function api(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...(opts.headers || {})
    }
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const message =
      data?.message || data?.error || `HTTP ${res.status}`;
    const err = new Error(Array.isArray(message) ? message[0] : message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ── Public API вызовы ──────────────────────────────────────────────

export async function requestEmailCode(email) {
  return api('/auth/email/request', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export async function verifyEmailCode(email, code) {
  return api('/auth/email/verify', {
    method: 'POST',
    body: JSON.stringify({ email, code })
  });
}

export async function fetchMe() {
  try {
    return await api('/me');
  } catch (err) {
    if (err.status === 401) {
      // Пробуем refresh
      try {
        await api('/auth/refresh', { method: 'POST' });
        return await api('/me');
      } catch {
        return null;
      }
    }
    throw err;
  }
}

export async function updateMeApi(patch) {
  return api('/me', {
    method: 'PATCH',
    body: JSON.stringify(patch)
  });
}

export async function signOutApi() {
  try {
    await api('/auth/logout', { method: 'POST' });
  } catch {}
}

// ── React-hook ─────────────────────────────────────────────────────
// Единая точка правды о текущем юзере. Локально не кешируем — cookies handle.
// Для UX слегка помнём в sessionStorage, чтобы не показывать flash "не залогинен".

const SESSION_KEY = 'doska-kvn:me';

function readSessionCache() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSessionCache(user) {
  if (typeof window === 'undefined') return;
  try {
    if (user) window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else window.sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

// ── Context, чтобы все useAuth() видели один и тот же стейт ─────────
// Раньше useAuth создавал независимый useState в каждом компоненте, из-за
// чего OnboardingModal мог обновить своего user, а /profile — нет.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSessionCache());
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const me = await fetchMe().catch(() => null);
    setUser(me);
    writeSessionCache(me);
    return me;
  }, []);

  useEffect(() => {
    refresh().finally(() => setReady(true));
  }, [refresh]);

  const requestCode = useCallback(async (email) => {
    return requestEmailCode(email);
  }, []);

  const verifyCode = useCallback(async (email, code) => {
    const result = await verifyEmailCode(email, code);
    setUser(result.user);
    writeSessionCache(result.user);
    return result.user;
  }, []);

  const signOut = useCallback(async () => {
    await signOutApi();
    setUser(null);
    writeSessionCache(null);
  }, []);

  const updateMe = useCallback(async (patch) => {
    const updated = await updateMeApi(patch);
    setUser(updated);
    writeSessionCache(updated);
    return updated;
  }, []);

  const value = {
    user,
    ready,
    requestCode,
    verifyCode,
    signOut,
    refresh,
    updateMe
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}

export function isAuthed() {
  return !!readSessionCache();
}
