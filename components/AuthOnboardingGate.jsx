'use client';

/**
 * Показывает OnboardingModal поверх любой страницы, если юзер залогинен,
 * но ещё не прошёл онбординг. Вешается один раз в app/layout.jsx.
 */

import { useAuth } from '@/lib/auth';
import OnboardingModal from './OnboardingModal';

export default function AuthOnboardingGate() {
  const { user, ready } = useAuth();
  if (!ready || !user || user.onboardedAt) return null;
  return <OnboardingModal me={user} />;
}
