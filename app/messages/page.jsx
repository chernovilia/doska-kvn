'use client';

import Avatar from '@/components/Avatar';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Search, Info, Send, MessageCircle, Star, X } from 'lucide-react';
import { listConversations, getConversationMessages, sendChatMessage, getReviewEligibility } from '@/lib/api';
import { ReviewModal } from '@/components/Reviews';
import { useApp } from '@/components/AppShell';
import { formatRelative } from '@/lib/format';
import { useAuth } from '@/lib/auth';
import { refreshUnread } from '@/lib/chats';

const CHAT_POLL_MS = 5_000;
const LIST_POLL_MS = 15_000;

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <MessagesContent />
    </Suspense>
  );
}

// iOS и встроенные браузеры (ВК) при открытии клавиатуры не уменьшают страницу, а
// прокручивают её вверх — шапка с диалогом уезжают. Держим экран чата ровно в видимой
// над клавиатурой области: шапка на месте, список сжимается, поле ввода над клавиатурой.
function useFitToVisualViewport(ref, enabled) {
  useEffect(() => {
    const vv = window.visualViewport;
    const el = ref.current;
    if (!enabled || !vv || !el) return;
    const update = () => {
      el.style.height = `${vv.height}px`;
      el.style.transform = `translateY(${vv.offsetTop}px)`;
    };
    // iOS сдвигает экран, пока выезжает клавиатура, а resize/scroll приходят только в конце —
    // из-за этого экран на мгновение уезжал вверх. Пока клавиатура едет, подстраиваемся каждый кадр.
    let raf = 0;
    let until = 0;
    const follow = () => {
      update();
      if (performance.now() < until) raf = requestAnimationFrame(follow);
      else raf = 0;
    };
    const track = () => {
      until = performance.now() + 800;
      if (!raf) raf = requestAnimationFrame(follow);
    };
    // iOS прокручивает и саму страницу к полю ввода — возвращаем её на место.
    const pinScroll = () => {
      if (window.scrollY) window.scrollTo(0, 0);
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', pinScroll);
    el.addEventListener('focusin', track);
    el.addEventListener('focusout', track);
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(raf);
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', pinScroll);
      el.removeEventListener('focusin', track);
      el.removeEventListener('focusout', track);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [ref, enabled]);
}

// iPhone/iPad (и iPad, который притворяется Mac).
function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// Фокус без сдвига экрана на iOS.
// Когда поле внизу получает фокус, iOS сама сдвигает страницу вверх, чтобы поле не закрыла
// клавиатура, — до всех наших событий, поэтому подстроиться «после» нельзя: виден прыжок.
// Прячем поле наверху экрана на время фокуса — iOS видит, что поле и так над клавиатурой,
// и ничего не двигает. Возвращаем его, когда экран уже ужат до высоты над клавиатурой.
function focusWithoutPan(el) {
  const vv = window.visualViewport;
  el.style.transform = `translateY(${-el.getBoundingClientRect().top}px)`;
  el.style.opacity = '0';
  el.focus({ preventScroll: true });
  let done = false;
  const restore = () => {
    if (done) return;
    done = true;
    el.style.transform = '';
    el.style.opacity = '';
    vv?.removeEventListener('resize', onResize);
  };
  // useFitToVisualViewport слушает resize раньше нас — даём ему применить высоту.
  const onResize = () => setTimeout(restore, 50);
  vv?.addEventListener('resize', onResize);
  setTimeout(restore, 700); // клавиатура не выехала (внешняя клавиатура) — всё равно вернём
}

// Опрос сервера: замирает на свёрнутой вкладке и сразу обновляется при возврате на неё.
function useVisiblePolling(fn, ms, enabled) {
  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      if (!document.hidden) fn();
    };
    const t = setInterval(tick, ms);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [fn, ms, enabled]);
}

function MessagesContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, ready } = useAuth();
  const chatId = params.get('chat');

  const [chats, setChats] = useState([]);
  const [chatsState, setChatsState] = useState('loading'); // loading | ok | error
  const [query, setQuery] = useState('');
  const screenRef = useRef(null);
  useFitToVisualViewport(screenRef, ready && !!user);

  useEffect(() => {
    if (ready && !user) {
      const back = chatId ? `/messages?chat=${chatId}` : '/messages';
      router.replace(`/login?returnTo=${encodeURIComponent(back)}`);
    }
  }, [ready, user, chatId, router]);

  const loadChats = useCallback(async () => {
    try {
      setChats(await listConversations());
      setChatsState('ok');
    } catch {
      setChatsState((s) => (s === 'ok' ? 'ok' : 'error'));
    }
  }, []);

  useEffect(() => {
    if (user) loadChats();
  }, [user, loadChats]);
  useVisiblePolling(loadChats, LIST_POLL_MS, !!user);

  if (!ready || !user) return <div className="min-h-screen" />;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? chats.filter(
        (c) =>
          c.other.name?.toLowerCase().includes(q) ||
          c.ad.title.toLowerCase().includes(q) ||
          c.lastMessage?.text.toLowerCase().includes(q)
      )
    : chats;

  return (
    <div ref={screenRef} className="chat-h fixed inset-x-0 top-0 flex flex-col bg-slate-50">
      {/* Шапка как PageHeader на остальных страницах: белая, «назад» и заголовок */}
      <div className={`bg-white border-b border-slate-100 shrink-0 ${chatId ? 'hidden md:block' : ''}`}>
        <div className="px-2 md:px-5 h-14 flex items-center gap-1">
          <Link
            href="/"
            className="w-10 h-10 grid place-items-center rounded-full text-ink-800 hover:bg-slate-100 shrink-0"
            aria-label="На главную"
          >
            <ArrowLeft className="w-[22px] h-[22px]" />
          </Link>
          <h1 className="font-extrabold text-lg text-ink-900">Сообщения</h1>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[340px_minmax(0,1fr)]">
        <aside
          className={`bg-white border-r border-black/5 flex-col min-h-0 ${
            chatId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {chats.length > 0 && (
            <div className="p-3 border-b border-black/5">
              <div className="relative">
                <Search className="w-4 h-4 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск по перепискам"
                  className="w-full rounded-full bg-slate-100 focus:bg-white ring-1 ring-transparent focus:ring-accent-400 outline-none pl-9 pr-4 py-2 text-base"
                />
              </div>
            </div>
          )}

          <ul className="flex-1 overflow-y-auto">
            {chatsState === 'loading' && (
              <li className="p-6 text-center text-sm text-ink-500">Загружаем…</li>
            )}
            {chatsState === 'error' && (
              <li className="p-6 text-center text-sm text-ink-500">
                Не удалось загрузить переписки.{' '}
                <button onClick={loadChats} className="text-accent-700 underline">
                  Повторить
                </button>
              </li>
            )}
            {chatsState === 'ok' && chats.length === 0 && (
              <li className="p-8 text-center">
                <MessageCircle className="w-8 h-8 mx-auto text-ink-300" />
                <div className="mt-2 font-bold text-ink-900">Пока нет переписок</div>
                <div className="text-sm text-ink-500 mt-1">
                  Нажмите «Написать» в любом объявлении — диалог появится здесь.
                </div>
              </li>
            )}
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => router.push(`/messages?chat=${c.id}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-black/5 hover:bg-accent-50 ${
                    chatId === c.id ? 'bg-accent-50' : ''
                  }`}
                >
                  <Avatar person={c.other} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-ink-900 truncate">
                        {c.other.name || 'Пользователь'}
                      </div>
                      {c.lastMessage && (
                        <div className="ml-auto text-[11px] text-ink-500 shrink-0" suppressHydrationWarning>
                          {formatRelative(c.lastMessage.createdAt)}
                        </div>
                      )}
                    </div>
                    <div className="text-[12px] text-ink-500 truncate">
                      <span className="text-accent-700">{c.ad.title}</span>
                      {c.lastMessage && (
                        <>
                          {' · '}
                          {c.lastMessage.senderId === user.id ? 'Вы: ' : ''}
                          {c.lastMessage.text}
                        </>
                      )}
                    </div>
                  </div>
                  {c.unread > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 grid place-items-center rounded-full bg-accent-500 text-white text-[10px] font-bold">
                      {c.unread}
                    </span>
                  )}
                </button>
              </li>
            ))}
            {chatsState === 'ok' && chats.length > 0 && filtered.length === 0 && (
              <li className="p-6 text-center text-sm text-ink-500">Ничего не найдено</li>
            )}
          </ul>
        </aside>

        <section className={`min-h-0 flex-col ${chatId ? 'flex' : 'hidden md:flex'}`}>
          {chatId ? (
            <ChatView key={chatId} chatId={chatId} me={user} onActivity={loadChats} />
          ) : (
            <div className="flex-1 grid place-items-center text-center p-8">
              <div>
                <MessageCircle className="w-10 h-10 mx-auto text-ink-300" />
                <div className="mt-3 font-extrabold text-ink-900 text-lg">Выберите переписку</div>
                <div className="text-sm text-ink-500 max-w-sm mx-auto mt-1">
                  Общайтесь с продавцами и покупателями прямо на сайте — номер телефона не нужен.
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ChatView({ chatId, me, onActivity }) {
  const router = useRouter();
  const { afterUsefulAction } = useApp();
  const [conv, setConv] = useState(null);
  const [review, setReview] = useState(null); // { eligible, reason, review, need, readyAt } с сервера
  const [reviewOpen, setReviewOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [state, setState] = useState('loading'); // loading | ok | notfound | error
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const listRef = useRef(null);
  const lastAtRef = useRef(null);
  const inputRef = useRef(null);
  const touchRef = useRef(null);

  // Тап по полю на iOS — фокусируем сами, без сдвига экрана (см. focusWithoutPan).
  // Свайп по полю и тап по уже активному полю (переставить курсор) не трогаем.
  function onInputTouchStart(e) {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  }
  function onInputTouchEnd(e) {
    const el = inputRef.current;
    const start = touchRef.current;
    const t = e.changedTouches[0];
    if (!el || !start || !isIOS() || document.activeElement === el) return;
    if (Math.abs(t.clientX - start.x) > 10 || Math.abs(t.clientY - start.y) > 10) return;
    e.preventDefault();
    focusWithoutPan(el);
  }

  // Поле растёт вместе с текстом до max-h-32, дальше прокручивается.
  function fitInput() {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }
  useEffect(fitInput, [draft]);

  const append = useCallback((incoming) => {
    if (!incoming.length) return;
    setMsgs((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const merged = [...prev, ...incoming.filter((m) => !seen.has(m.id))];
      lastAtRef.current = merged[merged.length - 1].createdAt;
      return merged;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    getConversationMessages(chatId)
      .then((res) => {
        if (cancelled) return;
        setConv(res.conversation);
        append(res.messages);
        setState('ok');
        refreshUnread();
        onActivity();
      })
      .catch((err) => {
        if (!cancelled) setState(err.status === 404 ? 'notfound' : 'error');
      });
    return () => {
      cancelled = true;
    };
  }, [chatId, append, onActivity]);

  const poll = useCallback(async () => {
    try {
      const res = await getConversationMessages(chatId, lastAtRef.current);
      if (res.messages.length) {
        append(res.messages);
        refreshUnread();
        onActivity();
      }
    } catch {
      // Следующий опрос попробует снова.
    }
  }, [chatId, append, onActivity]);
  useVisiblePolling(poll, CHAT_POLL_MS, state === 'ok');

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs.length]);

  // Отзыв открывается, когда каждый написал need.messages сообщений и с первого прошло need.hours.
  // Порог и время знает сервер; перепрашиваем, когда по сообщениям в чате порог достигнут,
  // а если ждём только времени — ставим таймер до readyAt.
  const [reviewTick, setReviewTick] = useState(0);
  const askedRef = useRef('');
  const myCount = msgs.filter((m) => m.senderId === me.id).length;
  const theirCount = msgs.length - myCount;
  useEffect(() => {
    if (state !== 'ok') return;
    let cancelled = false;
    getReviewEligibility(chatId)
      .then((r) => !cancelled && setReview(r))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [chatId, state, reviewTick]);

  const countsReady = !!review?.need && myCount >= review.need.messages && theirCount >= review.need.messages;
  useEffect(() => {
    if (!review || !countsReady || review.eligible || review.reason === 'already') return;
    if (review.reason === 'no_dialog') {
      const key = `${myCount}:${theirCount}`;
      if (askedRef.current === key) return;
      askedRef.current = key;
      setReviewTick((t) => t + 1);
      return;
    }
    if (review.reason === 'too_early' && review.readyAt) {
      const wait = Math.max(0, new Date(review.readyAt).getTime() - Date.now()) + 1000;
      const t = setTimeout(() => setReviewTick((x) => x + 1), Math.min(wait, 2 ** 31 - 1));
      return () => clearTimeout(t);
    }
  }, [review, countsReady, myCount, theirCount]);

  // Приглашение оценить можно скрыть — тогда остаётся кнопка в шапке.
  const [promptHidden, setPromptHidden] = useState(false);
  useEffect(() => {
    try {
      setPromptHidden(localStorage.getItem(`review-prompt-hidden:${chatId}`) === '1');
    } catch {
      setPromptHidden(false);
    }
  }, [chatId]);
  function hidePrompt() {
    setPromptHidden(true);
    try {
      localStorage.setItem(`review-prompt-hidden:${chatId}`, '1');
    } catch {}
  }

  // Клавиатура открылась — список сжался; держим последние сообщения в кадре.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const keepBottom = () => {
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    };
    vv.addEventListener('resize', keepBottom);
    return () => vv.removeEventListener('resize', keepBottom);
  }, []);

  async function onSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const msg = await sendChatMessage(chatId, text);
      append([msg]);
      setDraft('');
      onActivity();
      // Первое сообщение за сессию — предложить уведомления (или установку на iPhone), чтобы не пропустить ответ
      try {
        if (!sessionStorage.getItem('app.afterMessage')) {
          sessionStorage.setItem('app.afterMessage', '1');
          setTimeout(() => afterUsefulAction(), 1500);
        }
      } catch {}
    } catch (err) {
      setSendError(err.message || 'Не удалось отправить');
    } finally {
      setSending(false);
    }
  }

  if (state === 'loading') {
    return <div className="flex-1 grid place-items-center text-sm text-ink-500">Загружаем…</div>;
  }
  if (state !== 'ok') {
    return (
      <div className="flex-1 grid place-items-center text-center p-8">
        <div>
          <div className="font-bold text-ink-900">
            {state === 'notfound' ? 'Переписка не найдена' : 'Не удалось загрузить переписку'}
          </div>
          <button
            onClick={() => router.push('/messages')}
            className="mt-3 text-sm text-accent-700 underline"
          >
            К списку переписок
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border-b border-black/5 shrink-0">
        <div className="px-3 md:px-5 py-2.5 flex items-center gap-3">
          <button
            onClick={() => router.push('/messages')}
            className="md:hidden w-9 h-9 grid place-items-center rounded-full hover:bg-slate-100"
            aria-label="К списку"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-ink-800" />
          </button>
          <Avatar person={conv.other} size="md" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink-900 truncate">
              {conv.other.name || 'Пользователь'}
            </div>
            <div className="text-[11px] text-ink-500">
              {conv.role === 'buyer' ? 'Продавец' : 'Покупатель'}
            </div>
          </div>
          {review?.eligible && promptHidden && (
            <button onClick={() => setReviewOpen(true)} className="ml-auto btn-outline h-9 px-3 text-[13px] shrink-0">
              <Star className="w-4 h-4 text-amber-500" />
              Оценить
            </button>
          )}
          {review?.review && (
            <span className="ml-auto inline-flex items-center gap-1 text-[12px] text-ink-500 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              Ваш отзыв: {review.review.rating}
            </span>
          )}
        </div>
        <ListingHeader ad={conv.ad} />
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-3 md:px-5 py-4 space-y-2 bg-slate-50">
        {msgs.length === 0 ? (
          <div className="text-center text-sm text-ink-500 py-16">
            {conv.role === 'buyer'
              ? 'Напишите продавцу — например, актуально ли объявление.'
              : 'Сообщений пока нет.'}
          </div>
        ) : (
          msgs.map((m) => {
            const mine = m.senderId === me.id;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                    mine
                      ? 'bg-accent-100 text-ink-900 rounded-br-sm'
                      : 'bg-white ring-1 ring-black/5 text-ink-900 rounded-bl-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">{m.text}</div>
                  <div
                    className={`text-[10px] mt-0.5 text-right text-ink-500`}
                    suppressHydrationWarning
                  >
                    {formatMessageTime(m.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {review?.eligible && !promptHidden && (
        <div className="shrink-0 border-t border-amber-100 bg-amber-50 px-3 md:px-5 py-2.5 flex items-center gap-3">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold text-ink-900">Оцените собеседника</div>
            <div className="text-[12px] text-ink-500 truncate">Отзыв поможет другим покупателям и продавцам</div>
          </div>
          <button onClick={() => setReviewOpen(true)} className="h-8 px-3.5 rounded-full btn-primary text-[13px] font-bold shrink-0">
            Оценить
          </button>
          <button
            onClick={hidePrompt}
            aria-label="Скрыть приглашение"
            className="w-8 h-8 grid place-items-center rounded-full text-ink-500 hover:bg-amber-100 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        conversationId={chatId}
        targetName={conv.other.name}
        onDone={(r) => {
          setReviewOpen(false);
          setReview({ eligible: false, reason: 'already', review: r });
        }}
      />

      <form onSubmit={onSend} className="shrink-0 border-t border-black/5 bg-white p-3 pb-4">
        {sendError && <div className="text-[12px] text-rose-700 mb-2">{sendError}</div>}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 2000))}
            onTouchStart={onInputTouchStart}
            onTouchEnd={onInputTouchEnd}
            onKeyDown={(e) => {
              // Enter — отправить, Shift+Enter — перенос строки (на телефоне Enter переносит).
              if (e.key === 'Enter' && !e.shiftKey && window.matchMedia('(hover: hover)').matches) {
                e.preventDefault();
                onSend(e);
              }
            }}
            rows={1}
            placeholder="Сообщение"
            className="flex-1 max-h-32 resize-none rounded-2xl bg-slate-100 focus:bg-white ring-1 ring-transparent focus:ring-accent-400 outline-none px-4 py-2.5 text-base"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            className="w-11 h-11 shrink-0 grid place-items-center rounded-full btn-primary disabled:opacity-40"
            aria-label="Отправить"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </>
  );
}


function ListingHeader({ ad }) {
  const body = (
    <>
      {ad.photo && (
        <img src={ad.photo} alt="" className="w-11 h-11 rounded-lg object-cover ring-1 ring-black/5 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wide text-ink-500 font-bold flex items-center gap-1">
          <Info className="w-3 h-3" />
          {ad.available ? 'Объявление' : 'Объявление снято'}
        </div>
        <div className="text-sm font-semibold text-ink-900 truncate">{ad.title}</div>
      </div>
      {ad.available && ad.price != null && (
        <div className="text-sm font-black text-ink-900 shrink-0">
          {ad.price > 0 ? `${new Intl.NumberFormat('ru-RU').format(ad.price)} ₽` : 'Даром'}
        </div>
      )}
    </>
  );
  const cls = 'mx-3 md:mx-5 mb-3 flex items-center gap-3 rounded-xl bg-slate-50 ring-1 ring-black/5 p-2';
  return ad.available && ad.id ? (
    <Link href={`/ad/${ad.id}`} className={`${cls} hover:bg-slate-100 transition`}>
      {body}
    </Link>
  ) : (
    <div className={`${cls} opacity-70`}>{body}</div>
  );
}

// Сегодня — «14:05», иначе — «12 сент., 14:05».
function formatMessageTime(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay ? time : `${d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}, ${time}`;
}
