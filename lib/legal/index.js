import { API_URL } from '@/lib/site';
import { TERMS_DATE, TERMS_TEXT } from './terms';
import { PRIVACY_DATE, PRIVACY_TEXT } from './privacy';

// Тексты по умолчанию; в админке их можно заменить (Настройки → «Правила и политика»).
export const LEGAL_DEFAULTS = {
  terms: { title: 'Правила сервиса', text: TERMS_TEXT.trim(), date: TERMS_DATE },
  privacy: { title: 'Политика конфиденциальности', text: PRIVACY_TEXT.trim(), date: PRIVACY_DATE }
};

// Для страниц /terms и /privacy: текст из админки, а если его нет или сервер не ответил — по умолчанию.
// Обновляется раз в минуту.
export async function loadLegal(doc) {
  const fallback = LEGAL_DEFAULTS[doc];
  try {
    const res = await fetch(`${API_URL}/legal/${doc}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data?.custom && data.text) return { ...fallback, text: data.text, date: data.date || fallback.date, custom: true };
    }
  } catch {}
  return { ...fallback, custom: false };
}
