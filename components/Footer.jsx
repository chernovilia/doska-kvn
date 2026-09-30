'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { SECTIONS } from '@/data/categories';
import { CITIES } from '@/data/regions';
import { getSiteSettings } from '@/lib/api';

const FOOTER_SECTIONS = ['auto', 'realty', 'jobs', 'services', 'events'];
const HOME_CITIES = CITIES.filter((c) => c.regionId === 'kvn');

// Ссылки из контактов, которые админ вводит как удобно: «@doska_kvn», «t.me/…», «vk.com/…».
function contactLinks(c) {
  const out = [];
  if (c.email) out.push({ label: c.email, href: `mailto:${c.email}` });
  if (c.phone) out.push({ label: c.phone, href: `tel:${c.phone.replace(/[^\d+]/g, '')}` });
  if (c.telegram) {
    const handle = c.telegram.replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '').replace(/^@/, '');
    out.push({ label: `Telegram: @${handle}`, href: `https://t.me/${encodeURIComponent(handle)}` });
  }
  if (c.vk) {
    const path = c.vk.replace(/^https?:\/\//i, '').replace(/^(m\.)?vk\.com\//i, '');
    out.push({ label: `VK: vk.com/${path}`, href: `https://vk.com/${encodeURIComponent(path)}` });
  }
  return out;
}

// Подвал на компьютере. Контакты — из админки (Настройки → Контакты), пустые не показываем.
export default function Footer() {
  const [contacts, setContacts] = useState(null);
  useEffect(() => {
    getSiteSettings().then((s) => setContacts(s.contacts));
  }, []);
  const links = contacts ? contactLinks(contacts) : [];

  return (
    <footer className="mt-14 border-t border-slate-200 bg-slate-100">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 grid gap-6 md:grid-cols-4">
        <div>
          <Logo className="text-ink-900" />
          <p className="mt-2 text-sm text-ink-600 max-w-xs">
            Объявления, услуги и афиша Кулебак, Выксы и Навашина.
          </p>
        </div>
        <div>
          <div className="text-sm font-bold text-ink-900 mb-2">Разделы</div>
          <ul className="space-y-1 text-sm text-ink-600">
            {FOOTER_SECTIONS.map((id) => {
              const s = SECTIONS.find((x) => x.id === id);
              return s ? (
                <li key={id}>
                  <Link href={`/?section=${id}`} className="hover:text-ink-900">
                    {s.name}
                  </Link>
                </li>
              ) : null;
            })}
          </ul>
        </div>
        <div>
          <div className="text-sm font-bold text-ink-900 mb-2">Города</div>
          <ul className="space-y-1 text-sm text-ink-600">
            {HOME_CITIES.map((c) => (
              <li key={c.id}>
                <Link href={`/${c.id}`} className="hover:text-ink-900">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-sm font-bold text-ink-900 mb-2">Контакты</div>
          <ul className="space-y-1 text-sm text-ink-600">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="hover:text-ink-900 break-all">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/help" className="hover:text-ink-900">
                Написать в поддержку
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 text-xs text-ink-500 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
          <div suppressHydrationWarning>© {new Date().getFullYear()} Доска/КВН</div>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-ink-900">
              Правила
            </Link>
            <Link href="/privacy" className="hover:text-ink-900">
              Конфиденциальность
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
