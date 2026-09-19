// Мок-профиля пользователя и связанные сущности.
// Поля совпадают с будущей схемой Postgres (lib/types.js).

const NOW = new Date('2026-09-19T14:00:00Z');
const iso = (offsetMin) => new Date(NOW.getTime() + offsetMin * 60_000).toISOString();
const minAgo = (m) => iso(-m);
const hoursAgo = (h) => iso(-h * 60);
const daysAgo = (d) => iso(-d * 60 * 24);

export const MOCK_USER = {
  id: 'u-ilya',
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
  type: 'shop',
  verified: true,
  rating: 4.9,
  reviewsCount: 34,
  dealsCount: 128,
  activeAdsCount: 6,
  shop: {
    name: 'Мастерская Ильи',
    description:
      'Ремонт стиральных машин, электрика и мелкий ремонт бытовой техники. Выезд по КВН.',
    categories: ['Ремонт техники', 'Электрик', 'Сантехник'],
    hours: 'Пн–Сб · 8:00–22:00',
    address: 'Выкса, ул. Ленина, 14'
  }
};

// Мои объявления (id должны существовать в ADS).
export const MY_AD_IDS = ['m-macbook-vyksa', 's-elec-kul', 'a-tires-kul', 's-washer-vyksa', 's-fridge-kul', 'a-vesta-vyksa'];

// Внутренние чаты.
export const MOCK_CHATS = [
  {
    id: 'c-dmitry-mac',
    peerName: 'Дмитрий',
    peerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&auto=format',
    adTitle: 'MacBook Pro 13" 2020',
    lastText: 'Отлично, встретимся в 18:00 у ТЦ',
    lastAt: minAgo(10),
    unread: 2,
    mine: false
  },
  {
    id: 'c-anna-stroller',
    peerName: 'Анна',
    peerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&auto=format',
    adTitle: 'Детская коляска 3 в 1',
    lastText: 'Скиньте видео, как складывается 🙏',
    lastAt: hoursAgo(1),
    unread: 0,
    mine: false
  },
  {
    id: 'c-roman-elec',
    peerName: 'Роман (Электрик)',
    peerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&auto=format',
    adTitle: 'Заявка на розетку',
    lastText: 'Мастер выехал, будет через час',
    lastAt: hoursAgo(3),
    unread: 1,
    mine: true
  },
  {
    id: 'c-dk-tickets',
    peerName: 'ДК Кулебаки',
    peerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&auto=format',
    adTitle: 'Билеты на «Ёлки-11»',
    lastText: 'Бронь подтверждена, ждём вас в субботу',
    lastAt: daysAgo(1),
    unread: 0,
    mine: false
  },
  {
    id: 'c-artem-gruz',
    peerName: 'Артём (Газель)',
    peerAvatar: 'https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?w=100&h=100&fit=crop&auto=format',
    adTitle: 'Грузоперевозки Выкса → Кулебаки',
    lastText: 'Могу забрать в 10 утра в среду',
    lastAt: hoursAgo(5),
    unread: 1,
    mine: false
  },
  {
    id: 'c-natalia-flat',
    peerName: 'Наталья',
    peerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&auto=format',
    adTitle: '1-к квартира Кулебаки',
    lastText: 'Спасибо! Готовы посмотреть в четверг',
    lastAt: daysAgo(2),
    unread: 0,
    mine: true
  },
  {
    id: 'c-viktor-fridge',
    peerName: 'Виктор',
    peerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&auto=format',
    adTitle: 'Ремонт холодильника',
    lastText: 'Проверил компрессор, нужна замена',
    lastAt: daysAgo(1),
    unread: 0,
    mine: false
  },
  {
    id: 'c-olga-toys',
    peerName: 'Ольга',
    peerAvatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&auto=format',
    adTitle: 'Пакет детских игрушек',
    lastText: 'Возьмём! Куда подъехать?',
    lastAt: hoursAgo(9),
    unread: 3,
    mine: false
  }
];

// Пример переписок — открывается при клике на чат.
export const MOCK_MESSAGES = {
  'c-dmitry-mac': [
    { id: 'msg1', chatId: 'c-dmitry-mac', from: 'them', text: 'Здравствуйте! MacBook ещё продаётся?', at: hoursAgo(5) },
    { id: 'msg2', chatId: 'c-dmitry-mac', from: 'me', text: 'Да, актуально. Забирать в Выксе, у меня', at: hoursAgo(5) },
    { id: 'msg3', chatId: 'c-dmitry-mac', from: 'them', text: 'Могу подъехать сегодня к 18:00?', at: hoursAgo(4) },
    { id: 'msg4', chatId: 'c-dmitry-mac', from: 'me', text: 'Отлично, встретимся в 18:00 у ТЦ', at: minAgo(10) }
  ],
  'c-anna-stroller': [
    { id: 'msg5', chatId: 'c-anna-stroller', from: 'them', text: 'Добрый день! Коляска ещё в наличии?', at: hoursAgo(6) },
    { id: 'msg6', chatId: 'c-anna-stroller', from: 'me', text: 'Да, свободна. Могу показать сегодня', at: hoursAgo(6) },
    { id: 'msg7', chatId: 'c-anna-stroller', from: 'them', text: 'Скиньте видео, как складывается 🙏', at: hoursAgo(1) }
  ],
  'c-artem-gruz': [
    { id: 'msg8', chatId: 'c-artem-gruz', from: 'me', text: 'Нужна Газель Выкса → Кулебаки, диван перевезти', at: hoursAgo(6) },
    { id: 'msg9', chatId: 'c-artem-gruz', from: 'them', text: 'Понял. Один грузчик хватит?', at: hoursAgo(6) },
    { id: 'msg10', chatId: 'c-artem-gruz', from: 'me', text: 'Двое, тяжёлый', at: hoursAgo(5) },
    { id: 'msg11', chatId: 'c-artem-gruz', from: 'them', text: 'Могу забрать в 10 утра в среду', at: hoursAgo(5) }
  ],
  'c-viktor-fridge': [
    { id: 'msg12', chatId: 'c-viktor-fridge', from: 'them', text: 'Приехал, посмотрел', at: daysAgo(1) },
    { id: 'msg13', chatId: 'c-viktor-fridge', from: 'them', text: 'Проверил компрессор, нужна замена', at: daysAgo(1) }
  ]
};

// Публичные отзывы.
export const MOCK_REVIEWS = [
  {
    id: 'rv-olga', fromName: 'Ольга', fromCity: 'Выкса', rating: 5,
    text: 'Всё быстро, чётко. Мастер приехал в течение часа, починил стиралку за 40 минут. Спасибо!',
    at: daysAgo(3), adTitle: 'Ремонт стиральных машин на дому'
  },
  {
    id: 'rv-roman', fromName: 'Роман', fromCity: 'Кулебаки', rating: 5,
    text: 'Приятный собеседник, товар как в описании. Рекомендую!',
    at: daysAgo(7), adTitle: 'MacBook Pro 13" 2020'
  },
  {
    id: 'rv-natalia', fromName: 'Наталья', fromCity: 'Навашино', rating: 4,
    text: 'Задержался на 20 минут, но по итогу — работа сделана хорошо.',
    at: daysAgo(14), adTitle: 'Электрик с выездом'
  },
  {
    id: 'rv-pavel', fromName: 'Павел', fromCity: 'Выкса', rating: 5,
    text: 'Установил люстру и три розетки. Аккуратно, чисто. Цена как договаривались.',
    at: daysAgo(20), adTitle: 'Электрик с выездом'
  },
  {
    id: 'rv-igor', fromName: 'Игорь', fromCity: 'Навашино', rating: 5,
    text: 'Стиралка была не в лучшем состоянии, но после ремонта работает как новая. Гарантия 6 мес — приятный бонус.',
    at: daysAgo(25), adTitle: 'Ремонт стиральных машин на дому'
  },
  {
    id: 'rv-tatyana', fromName: 'Татьяна', fromCity: 'Выкса', rating: 5,
    text: 'Заказывала полный ремонт проводки в квартире. Илья с бригадой сделал за 2 дня, всё аккуратно, штробы и провода — идеально.',
    at: daysAgo(35), adTitle: 'Электрик с выездом'
  },
  {
    id: 'rv-sergey', fromName: 'Сергей', fromCity: 'Кулебаки', rating: 4,
    text: 'Всё нормально. Единственное — пришлось перезванивать, чтобы уточнить время.',
    at: daysAgo(45), adTitle: 'Ремонт холодильников'
  },
  {
    id: 'rv-anna', fromName: 'Анна', fromCity: 'Выкса', rating: 5,
    text: 'Спасибо большое! Установили посудомойку быстро и качественно.',
    at: daysAgo(52), adTitle: 'Сантехник'
  }
];

// Уведомления в шапке.
export const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Новый мастер в Выксе',
    text: '«Электрик Роман» появился в вашем городе',
    at: minAgo(2),
    unread: true
  },
  {
    id: 'n2',
    title: 'Отклик на объявление',
    text: 'Игорь заинтересовался MacBook Pro 13"',
    at: hoursAgo(1),
    unread: true
  },
  {
    id: 'n3',
    title: 'Афиша на выходные',
    text: 'Кино в ДК Кулебаки — вс, 19:00',
    at: hoursAgo(3),
    unread: true
  },
  {
    id: 'n4',
    title: 'Новый отзыв 5★',
    text: 'Ольга оставила отзыв о ремонте стиралки',
    at: daysAgo(1),
    unread: false
  },
  {
    id: 'n5',
    title: 'Тариф ТОП-Мастер продлён',
    text: 'Списано 500 ₽. Активен до 19.10.2026',
    at: daysAgo(2),
    unread: false
  }
];
