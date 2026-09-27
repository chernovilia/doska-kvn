'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

// /login пропускаем: страница входа сама уводит на returnTo, а гейт сработает уже там.
const ALLOWED = ['/onboarding', '/login', '/terms', '/privacy'];

// Пока юзер не прошёл онбординг, с любой страницы уводим на /onboarding и потом возвращаем.
export default function AuthOnboardingGate() {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready || !user || user.onboardedAt || ALLOWED.includes(pathname)) return;
    router.replace(`/onboarding?returnTo=${encodeURIComponent(pathname)}`);
  }, [ready, user, pathname, router]);

  return null;
}
