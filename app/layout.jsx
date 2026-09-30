import './globals.css';
import AppShell from '@/components/AppShell';
import { ToastProvider } from '@/components/Toast';
import { AuthProvider } from '@/lib/auth';
import AuthOnboardingGate from '@/components/AuthOnboardingGate';
import { SITE_URL as BASE_URL } from '@/lib/site';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Доска/КВН — объявления Кулебаки • Выкса • Навашино',
    template: '%s — Доска/КВН'
  },
  description:
    'Единый цифровой хаб объявлений, услуг и афиши агломерации Кулебаки — Выкса — Навашино. Проверенные мастера, живая афиша, местная барахолка.',
  keywords: [
    'объявления',
    'услуги',
    'Кулебаки',
    'Выкса',
    'Навашино',
    'мастера',
    'КВН',
    'афиша',
    'доска',
    'нижегородская область'
  ],
  authors: [{ name: 'Доска/КВН' }],
  openGraph: {
    title: 'Доска/КВН — объявления Кулебаки • Выкса • Навашино',
    description:
      'Единый цифровой хаб объявлений, услуг и афиши агломерации Кулебаки — Выкса — Навашино.',
    url: BASE_URL,
    siteName: 'Доска/КВН',
    locale: 'ru_RU',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Доска/КВН — объявления Кулебаки • Выкса • Навашино',
    description:
      'Единый цифровой хаб объявлений, услуг и афиши агломерации Кулебаки — Выкса — Навашино.'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  alternates: {
    canonical: '/'
  },
  // iPhone: сайт, добавленный на экран «Домой», открывается как приложение
  appleWebApp: {
    capable: true,
    title: 'Доска/КВН',
    statusBarStyle: 'default'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="min-h-screen font-sans">
        <AuthProvider>
          <ToastProvider>
            <AppShell>
              {children}
              <AuthOnboardingGate />
            </AppShell>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
