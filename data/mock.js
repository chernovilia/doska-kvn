// Мок-данные для демо-прототипа "доска/квн"
// Регион: Кулебаки • Выкса • Навашино

export const CITIES = [
  { id: 'all', name: 'Все города', short: 'КВН' },
  { id: 'kulebaki', name: 'Кулебаки', short: 'Кул' },
  { id: 'vyksa', name: 'Выкса', short: 'Вкс' },
  { id: 'navashino', name: 'Навашино', short: 'Нав' }
];

export const SECTIONS = [
  { id: 'market', name: 'Барахолка', emoji: '🛒', hint: 'Товары новых и б/у' },
  { id: 'services', name: 'Услуги и Мастера', emoji: '🛠', hint: 'Проверенные исполнители' },
  { id: 'realty', name: 'Недвижимость & Аренда', emoji: '🏠', hint: 'Квартиры, дома, гаражи' },
  { id: 'auto', name: 'Авто & Запчасти', emoji: '🚗', hint: 'Машины, шины, разбор' },
  { id: 'events', name: 'Афиша & События', emoji: '🎟', hint: 'Куда сходить в КВН' }
];

export const CHIPS = {
  market: ['Электроника', 'Детское', 'Одежда', 'Мебель', 'Спорт', 'Инструмент', 'Дача и сад'],
  services: ['Грузоперевозки', 'Электрик', 'Сантехник', 'Ремонт техники', 'Няня', 'Репетитор', 'Клининг'],
  realty: ['Сдам 1-к', 'Сдам 2-к', 'Продам дом', 'Гараж', 'Коммерческая', 'Посуточно'],
  auto: ['Легковые', 'Грузовые', 'Мото', 'Шины и диски', 'Запчасти', 'Работа на СТО'],
  events: ['Кино', 'Концерты', 'Дети', 'Спорт', 'Ярмарки', 'Мастер-классы']
};

// Пул фотографий (Unsplash — стабильные хостинги, для демо ок)
const IMG = {
  laptop: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&auto=format&fit=crop',
  phone: 'https://images.unsplash.com/photo-1512499617640-c2f999098c01?w=900&auto=format&fit=crop',
  stroller: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=900&auto=format&fit=crop',
  tires: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=900&auto=format&fit=crop',
  gazelle: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=900&auto=format&fit=crop',
  electric: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&auto=format&fit=crop',
  plumb: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=900&auto=format&fit=crop',
  washer: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=900&auto=format&fit=crop',
  flat: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&auto=format&fit=crop',
  flat2: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&auto=format&fit=crop',
  garage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop',
  house: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=900&auto=format&fit=crop',
  car: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&auto=format&fit=crop',
  moto: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=900&auto=format&fit=crop',
  cinema: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&auto=format&fit=crop',
  fair: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=900&auto=format&fit=crop',
  concert: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&auto=format&fit=crop',
  kids: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=900&auto=format&fit=crop',
  chair: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&auto=format&fit=crop',
  bike: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=900&auto=format&fit=crop',
  drill: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=900&auto=format&fit=crop'
};

// Помощник: время
const ago = (t) => t;

export const ADS = [
  // === БАРАХОЛКА ===
  {
    id: 'm1',
    section: 'market',
    title: 'MacBook Pro 13" 2020, M1, 16/512',
    price: 78000,
    city: 'vyksa',
    address: 'Выкса, ул. Ленина',
    date: ago('3 дня назад'),
    image: IMG.laptop,
    gallery: [IMG.laptop, IMG.drill],
    verified: true,
    top: true,
    author: { name: 'Дмитрий', rating: 4.9, deals: 34 },
    phone: '+7 (908) 123-45-67',
    tg: 'https://t.me/example',
    avitoUrl: 'https://www.avito.ru/vyksa/noutbuki',
    description:
      'Ноутбук в идеальном состоянии, циклов зарядки 87. Полный комплект: коробка, зарядка. Куплен в DNS Выкса.'
  },
  {
    id: 'm2',
    section: 'market',
    title: 'Детская коляска 3 в 1, Anex',
    price: 22500,
    city: 'kulebaki',
    address: 'Кулебаки, мкр. Северный',
    date: ago('вчера'),
    image: IMG.stroller,
    gallery: [IMG.stroller, IMG.kids],
    verified: true,
    urgent: true,
    author: { name: 'Анна', rating: 5.0, deals: 8 },
    phone: '+7 (930) 555-11-22',
    description:
      'Коляска 3 в 1: люлька, прогулка, автокресло. Пользовались 8 месяцев, всё чистое. Торг уместен.'
  },
  {
    id: 'm3',
    section: 'market',
    title: 'iPhone 13, 128 Gb, синий',
    price: 42000,
    city: 'navashino',
    address: 'Навашино, ул. Трудовая',
    date: ago('2 часа назад'),
    image: IMG.phone,
    gallery: [IMG.phone],
    verified: false,
    author: { name: 'Игорь', rating: 4.6, deals: 12 },
    phone: '+7 (952) 222-33-44',
    description: 'Аккумулятор 89%. Без сколов и царапин. Комплект: коробка, кабель.'
  },
  {
    id: 'm4',
    section: 'market',
    title: 'Кресло-качалка ротанговое',
    price: 9500,
    city: 'vyksa',
    address: 'Выкса, ул. Красных Зорь',
    date: ago('5 дней назад'),
    image: IMG.chair,
    gallery: [IMG.chair],
    verified: true,
    author: { name: 'Ольга', rating: 4.8, deals: 21 }
  },
  {
    id: 'm5',
    section: 'market',
    title: 'Велосипед горный Stels, 26"',
    price: 12500,
    city: 'kulebaki',
    address: 'Кулебаки, центр',
    date: ago('неделю назад'),
    image: IMG.bike,
    gallery: [IMG.bike],
    verified: false,
    author: { name: 'Сергей', rating: 4.5, deals: 6 }
  },
  {
    id: 'm6',
    section: 'market',
    title: 'Перфоратор Bosch GBH 2-26, с кейсом',
    price: 6800,
    city: 'navashino',
    address: 'Навашино, ул. Заводская',
    date: ago('3 дня назад'),
    image: IMG.drill,
    gallery: [IMG.drill],
    verified: true,
    author: { name: 'Виктор', rating: 4.9, deals: 41 }
  },

  // === УСЛУГИ ===
  {
    id: 's1',
    section: 'services',
    title: 'Грузоперевозки по КВН, Газель тент 4м',
    price: 700,
    priceSuffix: '₽/час',
    city: 'vyksa',
    address: 'Выкса → Кулебаки, Навашино',
    date: ago('онлайн сейчас'),
    image: IMG.gazelle,
    gallery: [IMG.gazelle],
    verified: true,
    top: true,
    author: { name: 'Артём (ИП)', rating: 4.9, deals: 214 },
    phone: '+7 (930) 700-70-70',
    tg: 'https://t.me/example',
    description:
      'Переезды по трём городам. Грузчики от 400₽/час. Работаю ежедневно 8:00–22:00. Официальный чек.'
  },
  {
    id: 's2',
    section: 'services',
    title: 'Электрик с выездом Кулебаки / Выкса',
    price: 500,
    priceSuffix: 'от, ₽',
    city: 'kulebaki',
    address: 'Кулебаки и район',
    date: ago('онлайн сейчас'),
    image: IMG.electric,
    gallery: [IMG.electric],
    verified: true,
    top: true,
    author: { name: 'Роман', rating: 5.0, deals: 156 },
    phone: '+7 (920) 111-22-33',
    description:
      'Установка розеток, замена проводки, штробление. Опыт 14 лет. Выезд в день обращения.'
  },
  {
    id: 's3',
    section: 'services',
    title: 'Ремонт стиральных машин на дому',
    price: 800,
    priceSuffix: 'диагностика бесплатно',
    city: 'vyksa',
    address: 'Выкса, весь город',
    date: ago('4 часа назад'),
    image: IMG.washer,
    gallery: [IMG.washer],
    verified: true,
    author: { name: 'СервисВыкса', rating: 4.8, deals: 512 },
    phone: '+7 (908) 222-11-33'
  },
  {
    id: 's4',
    section: 'services',
    title: 'Сантехник — установка, замена, ремонт',
    price: 600,
    priceSuffix: 'от, ₽',
    city: 'navashino',
    address: 'Навашино',
    date: ago('вчера'),
    image: IMG.plumb,
    gallery: [IMG.plumb],
    verified: true,
    author: { name: 'Николай', rating: 4.7, deals: 88 }
  },

  // === НЕДВИЖИМОСТЬ ===
  {
    id: 'r1',
    section: 'realty',
    title: 'Сдам 2-к квартиру в центре Выксы',
    price: 18000,
    priceSuffix: '₽/мес',
    city: 'vyksa',
    address: 'Выкса, ул. Островского, 42',
    date: ago('сегодня'),
    image: IMG.flat,
    gallery: [IMG.flat, IMG.flat2],
    verified: true,
    top: true,
    author: { name: 'Собственник Ирина', rating: 4.9, deals: 3 },
    phone: '+7 (930) 999-88-77',
    description:
      '52 м², 3/5 эт., кирпич. Мебель, техника, интернет. Рядом парк, школа №8. Без животных. Депозит 50%.'
  },
  {
    id: 'r2',
    section: 'realty',
    title: 'Сдам 1-к квартиру, ремонт',
    price: 13000,
    priceSuffix: '₽/мес',
    city: 'kulebaki',
    address: 'Кулебаки, мкр. Восточный',
    date: ago('2 дня назад'),
    image: IMG.flat2,
    gallery: [IMG.flat2],
    verified: true,
    author: { name: 'Наталья', rating: 4.6, deals: 5 }
  },
  {
    id: 'r3',
    section: 'realty',
    title: 'Сдам гараж, охрана 24/7',
    price: 3500,
    priceSuffix: '₽/мес',
    city: 'navashino',
    address: 'Навашино, ГСК «Волна»',
    date: ago('3 дня назад'),
    image: IMG.garage,
    gallery: [IMG.garage],
    verified: false,
    author: { name: 'Владимир', rating: 4.4, deals: 2 }
  },
  {
    id: 'r4',
    section: 'realty',
    title: 'Продам дом 90 м² с участком 8 сот.',
    price: 3200000,
    city: 'vyksa',
    address: 'Выкса, ул. Полевая',
    date: ago('неделю назад'),
    image: IMG.house,
    gallery: [IMG.house],
    verified: true,
    author: { name: 'АН «Ваш Дом»', rating: 4.8, deals: 74 }
  },

  // === АВТО ===
  {
    id: 'a1',
    section: 'auto',
    title: 'Продам зимнюю резину R15, комплект 4 шт.',
    price: 8500,
    city: 'kulebaki',
    address: 'Кулебаки, ул. Труда',
    date: ago('вчера'),
    image: IMG.tires,
    gallery: [IMG.tires],
    verified: true,
    urgent: true,
    author: { name: 'Алексей', rating: 4.7, deals: 19 }
  },
  {
    id: 'a2',
    section: 'auto',
    title: 'Lada Vesta 2019, 1.6, МКПП',
    price: 720000,
    city: 'vyksa',
    address: 'Выкса, ул. Ленина',
    date: ago('3 дня назад'),
    image: IMG.car,
    gallery: [IMG.car],
    verified: true,
    top: true,
    author: { name: 'Максим', rating: 4.9, deals: 4 },
    avitoUrl: 'https://www.avito.ru/vyksa/avtomobili'
  },
  {
    id: 'a3',
    section: 'auto',
    title: 'Мотоцикл Kawasaki Ninja 300',
    price: 320000,
    city: 'navashino',
    address: 'Навашино',
    date: ago('5 дней назад'),
    image: IMG.moto,
    gallery: [IMG.moto],
    verified: false,
    author: { name: 'Артур', rating: 4.6, deals: 2 }
  },

  // === АФИША ===
  {
    id: 'e1',
    section: 'events',
    title: 'Киносеанс «Ёлки-11» в ДК Кулебаки',
    price: 250,
    priceSuffix: '₽/билет',
    city: 'kulebaki',
    address: 'Кулебаки, ДК Кулебаки, Большой зал',
    date: ago('сб, 24 авг · 19:00'),
    eventDate: 'сб, 24 авг · 19:00',
    image: IMG.cinema,
    gallery: [IMG.cinema],
    verified: true,
    top: true,
    author: { name: 'ДК Кулебаки', rating: 4.9, deals: 0 },
    description:
      'Премьера в маленьком городе — атмосфера настоящего кинотеатра. Попкорн и лимонад в фойе.'
  },
  {
    id: 'e2',
    section: 'events',
    title: 'Гаражная распродажа, Выкса',
    price: 0,
    priceSuffix: 'вход бесплатно',
    city: 'vyksa',
    address: 'Выкса, парковка у ТЦ «Волна»',
    date: ago('вс, 25 авг · 10:00'),
    eventDate: 'вс, 25 авг · 10:00',
    image: IMG.fair,
    gallery: [IMG.fair],
    verified: true,
    author: { name: 'Соседи Выксы', rating: 4.8, deals: 0 }
  },
  {
    id: 'e3',
    section: 'events',
    title: 'Концерт группы «ТриО» в парке',
    price: 400,
    priceSuffix: '₽/билет',
    city: 'navashino',
    address: 'Навашино, Городской парк',
    date: ago('пт, 30 авг · 20:00'),
    eventDate: 'пт, 30 авг · 20:00',
    image: IMG.concert,
    gallery: [IMG.concert],
    verified: false,
    author: { name: 'Городской парк', rating: 4.7, deals: 0 }
  },
  {
    id: 'e4',
    section: 'events',
    title: 'Мастер-класс для детей: роспись по дереву',
    price: 350,
    priceSuffix: '₽/ребёнок',
    city: 'vyksa',
    address: 'Выкса, «Арт-Овраг»',
    date: ago('сб, 24 авг · 12:00'),
    eventDate: 'сб, 24 авг · 12:00',
    image: IMG.kids,
    gallery: [IMG.kids],
    verified: true,
    author: { name: 'Арт-Овраг', rating: 5.0, deals: 0 }
  }
];

// Быстрый счётчик объявлений по секциям для табов
export function countBySection(city) {
  const map = {};
  for (const s of SECTIONS) map[s.id] = 0;
  for (const a of ADS) {
    if (city === 'all' || a.city === city) map[a.section] += 1;
  }
  return map;
}

export function formatPrice(a) {
  if (a.price === 0) return 'Бесплатно';
  const num = new Intl.NumberFormat('ru-RU').format(a.price);
  return `${num} ${a.priceSuffix ? a.priceSuffix : '₽'}`;
}

export function cityName(id) {
  return CITIES.find((c) => c.id === id)?.name || '';
}
