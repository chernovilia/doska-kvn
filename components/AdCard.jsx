'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BadgeCheck, Calendar, Camera, Crown, ExternalLink, Flame, Heart, Link as LinkIcon, Trash2 } from 'lucide-react';
import { cityName, getSection } from '@/lib/api';
import { formatPrice, formatRelative, formatEventDate } from '@/lib/format';
import { accountTypeLabel, accountTypeEmoji, accountTypeBadgeClass, isBusiness } from '@/lib/accountType';
import { shareOrCopy } from '@/lib/share';
import { useToast } from './Toast';

/**
 * Карточка объявления: квадратное фото, под ним цена, заголовок, город и время.
 *
 * Вся карточка — ссылка на /ad/[id] (Next сам подгружает страницу, когда карточка на экране).
 * Кнопки действий лежат рядом со ссылкой, а не внутри неё: вложенные интерактивные
 * элементы ломают разметку и чтение с экрана.
 *
 * @param {Object}   props.ad
 * @param {boolean}  [props.showShare] — кнопка «скопировать ссылку» (в профиле)
 * @param {Function} [props.onDelete]  — кнопка удаления (в профиле)
 */
export default function AdCard({ ad, showShare = false, onDelete }) {
  const [liked, setLiked] = useState(false);
  const { toast } = useToast();
  const isEvent = ad.section === 'events';
  const photos = ad.gallery?.length || (ad.image ? 1 : 0);
  // Тип автора — снапшот на момент публикации.
  const authorType = ad.authorType || ad.author?.type || null;
  const showType = isBusiness(authorType) && accountTypeLabel(authorType);

  async function onCopyLink() {
    const status = await shareOrCopy({
      url: `/ad/${ad.id}`,
      title: ad.title,
      text: `${ad.title} — ${formatPrice(ad)}`
    });
    if (status === 'copied') toast('Ссылка скопирована');
    else if (status === 'shared') toast('Отправлено');
    else if (status === 'error') toast('Не удалось скопировать', { kind: 'error' });
  }

  return (
    <div
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 transition-shadow hover:shadow-soft ${
        ad.top ? 'ring-amber-300' : 'ring-black/5'
      }`}
    >
      <Link href={`/ad/${ad.id}`} className="flex flex-1 flex-col text-left">
        <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
          {ad.image ? (
            <img
              src={ad.image}
              alt={ad.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <NoPhoto section={ad.section} />
          )}

          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {ad.top && (
              <Badge className="top-badge">
                <Crown className="h-3 w-3" />
                TOP
              </Badge>
            )}
            {ad.urgent && (
              <Badge className="bg-accent-500 text-white">
                <Flame className="h-3 w-3" />
                Срочно
              </Badge>
            )}
            {ad.avitoUrl && (
              <Badge className="bg-emerald-600 text-white">
                <ExternalLink className="h-3 w-3" />
                Авито
              </Badge>
            )}
            {showType && (
              <Badge className={`ring-1 ${accountTypeBadgeClass(authorType)}`}>
                <span>{accountTypeEmoji(authorType)}</span>
                {accountTypeLabel(authorType)}
              </Badge>
            )}
          </div>

          {photos > 1 && (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
              <Camera className="h-3 w-3" />
              {photos}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-2.5 md:p-3">
          <div className="truncate text-[15px] font-extrabold leading-tight text-ink-900 md:text-base">
            {formatPrice(ad, { compact: true })}
          </div>
          <div className="line-clamp-2 min-h-[2.5em] text-[13px] leading-snug text-ink-800 md:text-sm">
            {ad.title}
          </div>
          <div
            className="mt-auto flex items-center gap-1 pt-0.5 text-[11px] text-ink-500 md:text-[12px]"
            suppressHydrationWarning
          >
            {ad.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-label="Проверен" />}
            {isEvent && <Calendar className="h-3 w-3 shrink-0" />}
            <span className="truncate">
              {cityName(ad.city)} · {isEvent ? formatEventDate(ad.eventDate) : formatRelative(ad.createdAt)}
            </span>
          </div>
        </div>
      </Link>

      {/* Действия — поверх фото, но вне ссылки */}
      <div className="absolute right-2 top-2 flex flex-col gap-1.5">
        <IconButton label={liked ? 'Убрать из избранного' : 'В избранное'} onClick={() => setLiked((v) => !v)}>
          <Heart className={`h-4 w-4 ${liked ? 'fill-rose-500 text-rose-500' : 'text-ink-700'}`} />
        </IconButton>
        {showShare && (
          <IconButton label="Скопировать ссылку" onClick={onCopyLink}>
            <LinkIcon className="h-4 w-4 text-ink-700" />
          </IconButton>
        )}
        {onDelete && (
          <IconButton label="Удалить" onClick={() => onDelete(ad)}>
            <Trash2 className="h-4 w-4 text-rose-600" />
          </IconButton>
        )}
      </div>
    </div>
  );
}

function Badge({ className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold shadow ${className}`}>
      {children}
    </span>
  );
}

function IconButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-8 w-8 place-items-center rounded-full bg-white/95 shadow-card ring-1 ring-black/5 hover:bg-white"
    >
      {children}
    </button>
  );
}

// Без фото — иконка раздела на его цвете, а не битая картинка.
function NoPhoto({ section }) {
  const s = getSection(section);
  const Icon = s?.icon || Camera;
  return (
    <div className={`grid h-full w-full place-items-center ${s?.tile || 'bg-slate-100 text-ink-500'}`}>
      <Icon className="h-10 w-10 opacity-60" strokeWidth={1.5} />
    </div>
  );
}
