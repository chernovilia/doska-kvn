import './globals.css';

export const metadata = {
  title: 'Доска/КВН — Кулебаки • Выкса • Навашино',
  description:
    'Единый цифровой хаб объявлений, услуг и афиши агломерации Кулебаки — Выкса — Навашино.'
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4f46e5'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
