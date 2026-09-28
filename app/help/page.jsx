'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LifeBuoy, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { createTicket, getMyTickets, sendTicketMessage } from '@/lib/api';
import { formatRelative } from '@/lib/format';
import { useToast } from '@/components/Toast';
import BottomNav from '@/components/BottomNav';
import PostAdModal from '@/components/PostAdModal';

const TOPICS = [
  ['question', 'Вопрос'],
  ['problem', 'Проблема на сайте'],
  ['complaint', 'Жалоба на пользователя'],
  ['idea', 'Предложение']
];
const TOPIC_LABEL = Object.fromEntries(TOPICS);

const STATUS = {
  open: ['Ждёт ответа', 'bg-amber-100 text-amber-800'],
  answered: ['Есть ответ', 'bg-emerald-100 text-emerald-800'],
  closed: ['Закрыто', 'bg-slate-100 text-slate-700']
};

// «Помощь»: обращение уходит администрации, ответ приходит сюда, в колокольчик и на почту.
export default function HelpPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState(null);
  const [topic, setTopic] = useState('question');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [postOpen, setPostOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace('/login?returnTo=/help');
  }, [ready, user, router]);

  const load = useCallback(() => {
    getMyTickets()
      .then(setTickets)
      .catch(() => setTickets([]));
  }, []);
  useEffect(() => {
    if (user) load();
  }, [user, load]);

  async function submit(e) {
    e.preventDefault();
    if (text.trim().length < 5) return;
    setSending(true);
    try {
      await createTicket(topic, text.trim());
      setText('');
      toast('Обращение отправлено — ответим здесь и на почту');
      load();
    } catch (err) {
      toast(err.message || 'Не удалось отправить', { kind: 'error' });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-2 md:px-6 h-14 flex items-center gap-1">
          <button
            onClick={() => router.back()}
            aria-label="Назад"
            className="w-10 h-10 grid place-items-center rounded-full text-ink-800 hover:bg-slate-100"
          >
            <ArrowLeft className="w-[22px] h-[22px]" />
          </button>
          <h1 className="font-extrabold text-lg text-ink-900">Помощь</h1>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-4 space-y-4">
        <form onSubmit={submit} className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-accent-500 text-white grid place-items-center shrink-0">
              <LifeBuoy className="w-5 h-5" />
            </span>
            <div>
              <div className="font-bold text-ink-900">Новое обращение</div>
              <div className="text-[13px] text-ink-500">Отвечаем обычно в течение дня</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TOPICS.map(([id, label]) => (
              <button key={id} type="button" onClick={() => setTopic(id)} className={`chip chip-sm ${topic === id ? 'chip-on' : ''}`}>
                {label}
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 2000))}
            rows={4}
            placeholder={
              topic === 'complaint'
                ? 'Кто и что сделал? Приложите ссылку на объявление или профиль'
                : 'Опишите, что случилось или что хотите спросить'
            }
            className="w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-base resize-none"
          />
          <button
            type="submit"
            disabled={sending || text.trim().length < 5}
            className="w-full rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white px-4 py-3 font-semibold"
          >
            {sending ? 'Отправляем…' : 'Отправить'}
          </button>
        </form>

        <section className="space-y-2">
          <h2 className="font-extrabold text-ink-900 px-0.5">Мои обращения</h2>
          {tickets === null ? (
            <div className="h-24 rounded-2xl bg-white ring-1 ring-black/5 animate-pulse" />
          ) : tickets.length === 0 ? (
            <div className="rounded-2xl bg-white ring-1 ring-black/5 p-6 text-center text-sm text-ink-500">
              Обращений пока нет.
            </div>
          ) : (
            tickets.map((t) => <Ticket key={t.id} ticket={t} onChanged={load} />)
          )}
        </section>
      </main>

      <PostAdModal open={postOpen} onClose={() => setPostOpen(false)} />
      <BottomNav onPost={() => setPostOpen(true)} />
    </div>
  );
}

function Ticket({ ticket, onChanged }) {
  const { toast } = useToast();
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [label, cls] = STATUS[ticket.status] || STATUS.open;

  async function send(e) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await sendTicketMessage(ticket.id, reply.trim());
      setReply('');
      onChanged();
    } catch (err) {
      toast(err.message || 'Не удалось отправить', { kind: 'error' });
    } finally {
      setSending(false);
    }
  }

  return (
    <article className="rounded-2xl bg-white ring-1 ring-black/5 shadow-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-ink-900">{TOPIC_LABEL[ticket.topic] || 'Обращение'}</span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
        <span className="ml-auto text-[12px] text-ink-500" suppressHydrationWarning>
          {formatRelative(ticket.updatedAt)}
        </span>
      </div>
      <div className="space-y-2">
        {ticket.messages.map((m) => (
          <div key={m.id} className={`flex ${m.fromAdmin ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                m.fromAdmin ? 'bg-accent-50 ring-1 ring-accent-200 text-ink-900 rounded-bl-sm' : 'bg-brand-600 text-white rounded-br-sm'
              }`}
            >
              {m.fromAdmin && <div className="text-[11px] font-bold text-accent-700 mb-0.5">Поддержка</div>}
              {m.text}
            </div>
          </div>
        ))}
      </div>
      {ticket.status !== 'closed' && (
        <form onSubmit={send} className="flex items-end gap-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value.slice(0, 2000))}
            rows={1}
            placeholder="Ответить"
            className="flex-1 max-h-32 resize-none rounded-2xl bg-slate-100 focus:bg-white ring-1 ring-transparent focus:ring-brand-400 outline-none px-4 py-2.5 text-base"
          />
          <button
            type="submit"
            disabled={!reply.trim() || sending}
            className="w-11 h-11 shrink-0 grid place-items-center rounded-full bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-40"
            aria-label="Отправить"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      )}
    </article>
  );
}
