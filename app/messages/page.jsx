'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Search, Info, Star, MoreVertical } from 'lucide-react';
import { getChats, getMessages, sendMessage, getAd } from '@/lib/api';
import { formatRelative } from '@/lib/format';
import { useAuth } from '@/lib/auth';

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, ready } = useAuth();
  const chatId = params.get('chat');
  const adId = params.get('ad');

  const [chats, setChats] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [draft, setDraft] = useState('');
  const [ad, setAd] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (ready && !user) router.push('/login?returnTo=/messages');
  }, [ready, user, router]);

  useEffect(() => {
    getChats().then(setChats);
  }, []);

  useEffect(() => {
    if (!chatId) {
      setMsgs([]);
      return;
    }
    getMessages(chatId).then(setMsgs);
  }, [chatId]);

  useEffect(() => {
    if (!adId) {
      setAd(null);
      return;
    }
    getAd(adId).then(setAd);
  }, [adId]);

  const active = chats.find((c) => c.id === chatId);

  async function onSend(e) {
    e.preventDefault();
    if (!draft.trim() || !chatId) return;
    const msg = await sendMessage(chatId, draft.trim());
    setMsgs((prev) => [...prev, msg]);
    setDraft('');
  }

  function openChat(id) {
    const q = new URLSearchParams();
    q.set('chat', id);
    if (adId) q.set('ad', adId);
    router.push(`/messages?${q.toString()}`);
  }

  const filteredChats = chats.filter((c) =>
    !query
      ? true
      : c.peerName.toLowerCase().includes(query.toLowerCase()) ||
        c.adTitle.toLowerCase().includes(query.toLowerCase()) ||
        c.lastText.toLowerCase().includes(query.toLowerCase())
  );

  if (!ready || !user) {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Шапка */}
      <div className="hero-gradient border-b border-black/5 shrink-0">
        <div className="max-w-full mx-auto px-3 md:px-5 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 grid place-items-center rounded-full bg-white ring-1 ring-black/5 hover:bg-brand-50 shadow-card"
            aria-label="Назад"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-ink-800" />
          </Link>
          <div className="font-black tracking-tight text-base md:text-lg text-ink-900">
            Сообщения
          </div>
          <div className="ml-auto text-[12px] text-ink-500">{chats.length} чат</div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid md:grid-cols-[340px_1fr]">
        {/* Левая колонка — список чатов */}
        <aside
          className={`bg-white border-r border-black/5 flex flex-col min-h-0 ${
            chatId ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-3 border-b border-black/5">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по чатам…"
                className="w-full rounded-full bg-slate-100 focus:bg-white ring-1 ring-transparent focus:ring-brand-400 outline-none pl-9 pr-4 py-2 text-sm"
              />
            </div>
          </div>

          <ul className="flex-1 overflow-y-auto">
            {filteredChats.map((c) => {
              const active = chatId === c.id;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => openChat(c.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-black/5 hover:bg-brand-50 ${
                      active ? 'bg-brand-50' : ''
                    }`}
                  >
                    <img
                      src={c.peerAvatar}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover ring-1 ring-black/5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-ink-900 truncate">
                          {c.peerName}
                        </div>
                        <div
                          className="ml-auto text-[11px] text-ink-500 shrink-0"
                          suppressHydrationWarning
                        >
                          {formatRelative(c.lastAt)}
                        </div>
                      </div>
                      <div className="text-[12px] text-ink-500 truncate">
                        <span className="text-brand-700">{c.adTitle}</span> · {c.lastText}
                      </div>
                    </div>
                    {c.unread > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 grid place-items-center rounded-full bg-accent-500 text-white text-[10px] font-bold">
                        {c.unread}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
            {filteredChats.length === 0 && (
              <li className="p-6 text-center text-sm text-ink-500">Ничего не найдено</li>
            )}
          </ul>
        </aside>

        {/* Правая колонка — диалог */}
        <section className={`min-h-0 flex flex-col ${chatId ? 'flex' : 'hidden md:flex'}`}>
          {active ? (
            <>
              {/* Шапка диалога */}
              <div className="bg-white border-b border-black/5">
                <div className="px-4 md:px-5 py-2.5 flex items-center gap-3">
                  <button
                    onClick={() => router.push('/messages')}
                    className="md:hidden w-9 h-9 grid place-items-center rounded-full hover:bg-slate-100"
                    aria-label="К списку"
                  >
                    <ArrowLeft className="w-4.5 h-4.5 text-ink-800" />
                  </button>
                  <img
                    src={active.peerAvatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-black/5"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink-900 truncate">
                      {active.peerName}
                    </div>
                    <div className="text-[11px] text-ink-500">был онлайн недавно</div>
                  </div>
                  <button
                    className="ml-auto w-9 h-9 grid place-items-center rounded-full hover:bg-slate-100"
                    aria-label="Ещё"
                  >
                    <MoreVertical className="w-4.5 h-4.5 text-ink-700" />
                  </button>
                </div>

                {/* Карточка объявления, по которому переписка */}
                <ListingHeader ad={ad} chat={active} />
              </div>

              {/* Лента сообщений */}
              <div className="flex-1 overflow-y-auto px-4 md:px-5 py-4 space-y-2 bg-slate-50">
                {msgs.length ? (
                  msgs.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                          m.from === 'me'
                            ? 'bg-brand-600 text-white rounded-br-sm'
                            : 'bg-white ring-1 ring-black/5 text-ink-900 rounded-bl-sm'
                        }`}
                      >
                        <div>{m.text}</div>
                        <div
                          className={`text-[10px] mt-0.5 ${
                            m.from === 'me' ? 'text-white/70' : 'text-ink-500'
                          }`}
                          suppressHydrationWarning
                        >
                          {formatRelative(m.at)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-ink-500 py-16">
                    Пока нет сообщений — начните переписку
                  </div>
                )}
              </div>

              <form
                onSubmit={onSend}
                className="p-3 border-t border-black/5 bg-white flex items-center gap-2"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Напишите сообщение…"
                  className="flex-1 rounded-full bg-slate-100 focus:bg-white ring-1 ring-transparent focus:ring-brand-400 outline-none px-4 py-2.5 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2.5"
                >
                  Отправить
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-center p-8">
              <div>
                <div className="text-5xl">💬</div>
                <div className="mt-3 font-extrabold text-ink-900 text-lg">
                  Выберите чат
                </div>
                <div className="text-sm text-ink-500 max-w-sm mx-auto mt-1">
                  Общайтесь с покупателями и мастерами прямо в приложении — без обмена
                  телефонами и без спама.
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ListingHeader({ ad, chat }) {
  if (!ad && !chat) return null;
  const title = ad?.title || chat?.adTitle || 'Объявление';
  const price = ad ? ad.price : null;
  const image = ad?.image || chat?.peerAvatar;

  return (
    <Link
      href={ad ? `/ad/${ad.id}` : '#'}
      className="mx-3 md:mx-5 mb-3 flex items-center gap-3 rounded-xl bg-brand-50 ring-1 ring-brand-100 hover:bg-brand-100 transition p-2"
    >
      {image && (
        <img
          src={image}
          alt=""
          className="w-11 h-11 rounded-lg object-cover ring-1 ring-black/5 shrink-0"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wide text-brand-700 font-bold flex items-center gap-1">
          <Info className="w-3 h-3" />
          Обсуждаемое объявление
        </div>
        <div className="text-sm font-semibold text-ink-900 truncate">{title}</div>
      </div>
      {price != null && (
        <div className="text-sm font-black text-brand-700 shrink-0">
          {price > 0
            ? `${new Intl.NumberFormat('ru-RU').format(price)} ${ad?.priceSuffix || '₽'}`
            : ad?.priceSuffix || 'Бесплатно'}
        </div>
      )}
    </Link>
  );
}
