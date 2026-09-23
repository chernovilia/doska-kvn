import './globals.css';
import { ToastProvider } from '@/components/Toast';

const BASE_URL = 'https://xn----7sbhf4acwc1a.xn--p1ai';

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
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4f46e5'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="min-h-screen font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
