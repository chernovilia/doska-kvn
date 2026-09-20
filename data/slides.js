// Слайды главной. Отсюда легко управлять контентом баннера
// (в будущем — редактор в админке).
//
// Поля:
//   id           — стабильный id
//   eyebrow      — короткая надпись сверху, uppercase
//   title        — заголовок (на слайде подставится текущее «место»)
//   body         — короткое описание под заголовком (опционально)
//   ctaLabel     — текст основной кнопки
//   ctaKind      — действие: 'post' | 'pricing' | 'link'
//   ctaHref      — если 'link' — куда ведёт
//   accent       — 'brand' | 'amber' | 'emerald' — акцент градиента
//   emoji        — маленький значок слева от заголовка

export const HERO_SLIDES = [
  {
    id: 'hub',
    eyebrow: 'Единый цифровой хаб',
    title: '{place}',
    body: 'Объявления, услуги и афиша — всё в одном месте.',
    ctaLabel: 'Подать объявление',
    ctaKind: 'post',
    accent: 'brand',
    emoji: '✨'
  },
  {
    id: 'masters',
    eyebrow: 'Проверенные мастера',
    title: 'Электрики, ремонт, грузчики — рядом',
    body: 'Значок «Проверен через Подслушано» и живые отзывы клиентов.',
    ctaLabel: 'Смотреть услуги',
    ctaKind: 'link',
    ctaHref: '/?section=services',
    accent: 'emerald',
    emoji: '🛠'
  },
  {
    id: 'business',
    eyebrow: 'Для местного бизнеса',
    title: 'ТОП-Мастер и Сквозной КВН',
    body: 'От 500 ₽/мес — приоритет в поиске, аналитика и значок доверия.',
    ctaLabel: 'Смотреть тарифы',
    ctaKind: 'pricing',
    accent: 'amber',
    emoji: '📈'
  },
  {
    id: 'events',
    eyebrow: 'Афиша выходных',
    title: 'Куда сходить в КВН',
    body: 'Кино, ярмарки, концерты и мастер-классы — по местным ценам.',
    ctaLabel: 'Открыть афишу',
    ctaKind: 'link',
    ctaHref: '/?section=events',
    accent: 'brand',
    emoji: '🎟'
  }
];
