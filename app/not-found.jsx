import Link from 'next/link';
import { SearchX } from 'lucide-react';
import Logo from '@/components/Logo';

export const metadata = { title: 'Страница не найдена', robots: { index: false } };

// Любая неверная ссылка: понятный текст и дорога к объявлениям вместо голого «404».
export default function NotFound() {
  return <NotFoundScreen title="Страница не найдена" text="Возможно, ссылка устарела или в ней ошибка." />;
}

export function NotFoundScreen({ title, text }) {
  return (
    <div className="min-h-screen bg-slate-50 grid place-items-center px-4 py-10">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-block">
          <Logo className="text-ink-900" />
        </Link>
        <div className="mt-6 rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-6">
          <div className="mx-auto w-14 h-14 grid place-items-center rounded-2xl bg-slate-100 text-ink-500">
            <SearchX className="w-7 h-7" />
          </div>
          <h1 className="mt-3 text-xl font-extrabold text-ink-900">{title}</h1>
          <p className="mt-1 text-sm text-ink-500">{text}</p>
          <Link href="/" className="mt-5 btn-primary w-full h-11 rounded-2xl text-sm">
            Смотреть объявления
          </Link>
        </div>
      </div>
    </div>
  );
}
