'use client';

/**
 * Хелпер для копирования ссылки / открытия системного Share Sheet.
 * Возвращает статус: 'shared' | 'copied' | 'error'.
 * Основной поток на мобильных — Web Share API (нативные share options).
 * На десктопе — clipboard + подсказка.
 */
export async function shareOrCopy({ url, title, text }) {
  const fullUrl = url.startsWith('http')
    ? url
    : typeof window !== 'undefined'
    ? `${window.location.origin}${url}`
    : url;

  // 1. Web Share API — приоритет на мобильных
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text, url: fullUrl });
      return 'shared';
    } catch (err) {
      // Пользователь мог отменить — это не ошибка
      if (err && err.name === 'AbortError') return 'error';
      // Иначе — падаем в clipboard-fallback
    }
  }

  // 2. Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(fullUrl);
      return 'copied';
    } catch {
      return 'error';
    }
  }

  // 3. Legacy fallback (например, старые Safari)
  if (typeof document !== 'undefined') {
    try {
      const ta = document.createElement('textarea');
      ta.value = fullUrl;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok ? 'copied' : 'error';
    } catch {
      return 'error';
    }
  }

  return 'error';
}
