// Мок-данные профиля (как из VK OAuth)
export const MOCK_USER = {
  id: 'u1',
  vkId: '123456789',
  name: 'Илья Чернов',
  avatar:
    'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&h=200&fit=crop&auto=format',
  city: 'vyksa',
  cityName: 'Выкса',
  registeredAt: 'на Доска/КВН с апреля 2026',
  vkUrl: 'https://vk.com/id123456789',
  bio: 'Здравствуйте! Работаю в КВН более 10 лет. Помогаю с ремонтом техники и электрикой.',
  phone: '+7 (908) 123-45-67',
  // Тип аккаунта: 'personal' — обычный пользователь, 'shop' — магазин/бизнес
  type: 'shop',
  verified: true,
  rating: 4.9,
  reviewsCount: 34,
  dealsCount: 128,
  activeAdsCount: 6,
  // Бизнес-профиль (используется при type === 'shop')
  shop: {
    name: 'Мастерская Ильи',
    description:
      'Ремонт стиральных машин, электрика и мелкий ремонт бытовой техники. Выезд по КВН.',
    categories: ['Ремонт техники', 'Электрик', 'Сантехник'],
    hours: 'Пн–Сб · 8:00–22:00',
    address: 'Выкса, ул. Ленина, 14'
  }
};

// Мои объявления — берём по id из общего ADS
export const MY_AD_IDS = ['m1', 's2', 'a1', 's3'];

// Внутренние чаты
export const MOCK_CHATS = [
  {
    id: 'c1',
    name: 'Дмитрий',
    ad: 'MacBook Pro 13" 2020',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&auto=format',
    last: 'Отлично, встретимся в 18:00 у ТЦ',
    time: '10 мин',
    unread: 2,
    mine: false
  },
  {
    id: 'c2',
    name: 'Анна',
    ad: 'Детская коляска 3 в 1',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&auto=format',
    last: 'Скиньте видео, как складывается 🙏',
    time: '1 ч',
    unread: 0,
    mine: false
  },
  {
    id: 'c3',
    name: 'Роман (Электрик)',
    ad: 'Заявка на розетку',
    avatar:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&auto=format',
    last: 'Мастер выехал, будет через час',
    time: '3 ч',
    unread: 1,
    mine: true
  },
  {
    id: 'c4',
    name: 'ДК Кулебаки',
    ad: 'Билеты на «Ёлки-11»',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&auto=format',
    last: 'Бронь подтверждена, ждём вас в субботу',
    time: 'вчера',
    unread: 0,
    mine: false
  }
];

// Пример переписки — открывается при клике на чат
export const MOCK_MESSAGES = {
  c1: [
    { id: 1, from: 'them', text: 'Здравствуйте! MacBook ещё продаётся?', time: '17:12' },
    { id: 2, from: 'me', text: 'Да, актуально. Забирать в Выксе, у меня', time: '17:14' },
    { id: 3, from: 'them', text: 'Могу подъехать сегодня к 18:00?', time: '17:20' },
    { id: 4, from: 'me', text: 'Отлично, встретимся в 18:00 у ТЦ', time: '17:22' }
  ]
};

// Публичные отзывы о пользователе / магазине
export const MOCK_REVIEWS = [
  {
    id: 'rv1',
    from: 'Ольга',
    fromCity: 'Выкса',
    rating: 5,
    text: 'Всё быстро, чётко. Мастер приехал в течение часа, починил стиралку за 40 минут. Спасибо!',
    time: '3 дня назад',
    adTitle: 'Ремонт стиральных машин на дому'
  },
  {
    id: 'rv2',
    from: 'Роман',
    fromCity: 'Кулебаки',
    rating: 5,
    text: 'Приятный собеседник, товар как в описании. Рекомендую!',
    time: 'неделю назад',
    adTitle: 'MacBook Pro 13" 2020'
  },
  {
    id: 'rv3',
    from: 'Наталья',
    fromCity: 'Навашино',
    rating: 4,
    text: 'Задержался на 20 минут, но по итогу — работа сделана хорошо.',
    time: '2 недели назад',
    adTitle: 'Электрик с выездом'
  }
];
