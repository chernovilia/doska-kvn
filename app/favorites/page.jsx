'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import FavoritesList from '@/components/FavoritesList';
import BottomNav from '@/components/BottomNav';
import PostAdModal from '@/components/PostAdModal';
import { goBack } from '@/lib/nav';

export default function FavoritesPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [postOpen, setPostOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace('/login?returnTo=/favorites');
  }, [ready, user, router]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
      <div className="sticky top-[var(--banner-h,0px)] z-30 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-2 md:px-6 h-14 flex items-center gap-1">
          <button
            onClick={() => goBack(router)}
            aria-label="Назад"
            className="w-10 h-10 grid place-items-center rounded-full text-ink-800 hover:bg-slate-100"
          >
            <ArrowLeft className="w-[22px] h-[22px]" />
          </button>
          <h1 className="font-extrabold text-lg text-ink-900">Избранное</h1>
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
        {ready && user ? <FavoritesList /> : <div className="h-40 rounded-2xl bg-white ring-1 ring-black/5 animate-pulse" />}
      </main>
      <PostAdModal open={postOpen} onClose={() => setPostOpen(false)} />
      <BottomNav onPost={() => setPostOpen(true)} />
    </div>
  );
}
