import { ArrowUpCircle, Crown, Flame, Palette } from 'lucide-react';

// Варианты продвижения. Работает только подъём (бесплатно, раз в ranking.bump_cooldown_days);
// остальные показываем как «скоро», цены появятся вместе с оплатой.
export const PROMO_OPTIONS = [
  {
    id: 'bump',
    name: 'Поднять в ленте',
    icon: ArrowUpCircle,
    iconCls: 'text-brand-600',
    price: 'Бесплатно',
    text: 'Объявление встанет наверх ленты, как новое, и сутки будет выше остальных.'
  },
  {
    id: 'urgent',
    name: 'Срочно',
    icon: Flame,
    iconCls: 'text-accent-600',
    soon: true,
    text: 'Яркая плашка «Срочно» на карточке — для тех, кому нужно продать быстро.'
  },
  {
    id: 'highlight',
    name: 'Выделить цветом',
    icon: Palette,
    iconCls: 'text-fuchsia-600',
    soon: true,
    text: 'Цветная карточка заметнее в ленте и поиске.'
  },
  {
    id: 'top',
    name: 'В топе раздела',
    icon: Crown,
    iconCls: 'text-amber-500',
    soon: true,
    text: 'Закрепим в первых строках раздела на несколько дней.'
  }
];
