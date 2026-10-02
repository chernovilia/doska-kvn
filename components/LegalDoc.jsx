import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

// Правила и политика: текст в простой разметке (его можно править в админке).
//   ## Заголовок раздела        **жирный**        [текст ссылки](/адрес или https://…)
//   - пункт списка              пустая строка — новый абзац
// HTML не поддерживается намеренно: текст приходит из базы и выводится только как текст.

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

export function formatLegalDate(date) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || '');
  if (!m) return '';
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]} года`;
}

// Ссылки — только на свои страницы, https и почту
function safeHref(href) {
  if (/^\/[^/\\]/.test(href) || href === '/') return href;
  if (/^https:\/\/[^\s]+$/.test(href) || /^mailto:[^\s]+$/.test(href)) return href;
  return null;
}

function inline(text, keyPrefix) {
  const out = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyPrefix}-${i++}`;
    if (m[1] != null) {
      out.push(<strong key={key} className="font-bold text-ink-900">{m[1]}</strong>);
    } else {
      const href = safeHref(m[3]);
      if (!href) out.push(m[2]);
      else if (href.startsWith('/')) out.push(<Link key={key} href={href} className="text-accent-700 underline">{m[2]}</Link>);
      else out.push(<a key={key} href={href} target="_blank" rel="noopener noreferrer" className="text-accent-700 underline">{m[2]}</a>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function parseLegal(text) {
  const blocks = [];
  let list = null;
  for (const raw of String(text || '').split('\n')) {
    const line = raw.trim();
    if (!line) {
      list = null;
      continue;
    }
    if (line.startsWith('## ')) {
      list = null;
      blocks.push({ type: 'h2', text: line.slice(3).trim() });
    } else if (line.startsWith('# ')) {
      list = null; // заголовок документа берём из страницы
    } else if (/^[-•]\s+/.test(line)) {
      if (!list) {
        list = { type: 'ul', items: [] };
        blocks.push(list);
      }
      list.items.push(line.replace(/^[-•]\s+/, ''));
    } else {
      list = null;
      blocks.push({ type: 'p', text: line });
    }
  }
  return blocks;
}

export function LegalBody({ text }) {
  const blocks = parseLegal(text);
  return (
    <div className="space-y-3 text-[15px] text-ink-800 leading-relaxed break-words">
      {blocks.map((b, i) =>
        b.type === 'h2' ? (
          <h2 key={i} className="text-lg font-extrabold text-ink-900 pt-4">{inline(b.text, i)}</h2>
        ) : b.type === 'ul' ? (
          <ul key={i} className="list-disc pl-6 space-y-1">
            {b.items.map((it, k) => (
              <li key={k}>{inline(it, `${i}-${k}`)}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{inline(b.text, i)}</p>
        )
      )}
    </div>
  );
}

export default function LegalDoc({ title, date, text, related }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-black/5 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 grid place-items-center rounded-full ring-1 ring-black/10 hover:bg-accent-50 shrink-0"
            aria-label="На главную"
          >
            <ArrowLeft className="w-4 h-4 text-ink-800" />
          </Link>
          <ShieldCheck className="w-5 h-5 text-accent-700 shrink-0" />
          <h1 className="font-black tracking-tight text-lg text-ink-900">{title}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        {formatLegalDate(date) && <p className="text-ink-500 text-sm mb-4">Редакция от {formatLegalDate(date)}.</p>}
        <LegalBody text={text} />
        {related && (
          <div className="pt-8 text-sm text-ink-500">
            Смежный документ:{' '}
            <Link href={related.href} className="text-accent-700 underline">
              {related.label}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
