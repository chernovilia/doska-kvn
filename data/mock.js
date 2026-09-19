// Мок-данные для демо-прототипа "Доска/КВН"
// Регион: Кулебаки • Выкса • Навашино
// Структура полей совпадает с будущей схемой Postgres — см. lib/types.js

export const CITIES = [
  { id: 'all', name: 'Все города', short: 'КВН' },
  { id: 'kulebaki', name: 'Кулебаки', short: 'Кул' },
  { id: 'vyksa', name: 'Выкса', short: 'Вкс' },
  { id: 'navashino', name: 'Навашино', short: 'Нав' }
];

export const SECTIONS = [
  { id: 'market', name: 'Барахолка', emoji: '🛒', hint: 'Товары новые и б/у' },
  { id: 'services', name: 'Услуги и Мастера', emoji: '🛠', hint: 'Проверенные исполнители' },
  { id: 'realty', name: 'Недвижимость & Аренда', emoji: '🏠', hint: 'Квартиры, дома, гаражи' },
  { id: 'auto', name: 'Авто & Запчасти', emoji: '🚗', hint: 'Машины, шины, разбор' },
  { id: 'events', name: 'Афиша & События', emoji: '🎟', hint: 'Куда сходить в КВН' }
];

export const CHIPS = {
  market: ['Электроника', 'Детское', 'Одежда', 'Мебель', 'Спорт', 'Инструмент', 'Дача и сад', 'Книги'],
  services: ['Грузоперевозки', 'Электрик', 'Сантехник', 'Ремонт техники', 'Няня', 'Репетитор', 'Клининг', 'Красота'],
  realty: ['Сдам 1-к', 'Сдам 2-к', 'Продам дом', 'Гараж', 'Коммерческая', 'Посуточно', 'Продам участок'],
  auto: ['Легковые', 'Грузовые', 'Мото', 'Шины и диски', 'Запчасти', 'Работа на СТО', 'Прицепы'],
  events: ['Кино', 'Концерты', 'Дети', 'Спорт', 'Ярмарки', 'Мастер-классы', 'Выставки']
};

// Стабильные картинки (Unsplash). Пул нужен, чтобы визуальные ассеты не разъезжались между рендерами.
const IMG = {
  laptop: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&auto=format&fit=crop',
  laptop2: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=900&auto=format&fit=crop',
  phone: 'https://images.unsplash.com/photo-1512499617640-c2f999098c01?w=900&auto=format&fit=crop',
  phone2: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=900&auto=format&fit=crop',
  tablet: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=900&auto=format&fit=crop',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop',
  camera: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900&auto=format&fit=crop',
  stroller: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=900&auto=format&fit=crop',
  kidsToys: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=900&auto=format&fit=crop',
  kidsCloth: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=900&auto=format&fit=crop',
  crib: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&auto=format&fit=crop',
  chair: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&auto=format&fit=crop',
  sofa: 'https://images.unsplash.com/photo-1555041469-6b8b5c7f8b3f?w=900&auto=format&fit=crop',
  table: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=900&auto=format&fit=crop',
  bed: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&auto=format&fit=crop',
  bike: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=900&auto=format&fit=crop',
  skis: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=900&auto=format&fit=crop',
  fitness: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&auto=format&fit=crop',
  drill: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=900&auto=format&fit=crop',
  tools: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=900&auto=format&fit=crop',
  garden: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&auto=format&fit=crop',
  books: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&auto=format&fit=crop',
  jacket: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&auto=format&fit=crop',
  gazelle: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=900&auto=format&fit=crop',
  truck: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=900&auto=format&fit=crop',
  electric: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&auto=format&fit=crop',
  plumb: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=900&auto=format&fit=crop',
  washer: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=900&auto=format&fit=crop',
  fridge: 'https://images.unsplash.com/photo-1571175351651-2c1dc19bf8b5?w=900&auto=format&fit=crop',
  cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&auto=format&fit=crop',
  tutor: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&auto=format&fit=crop',
  nanny: 'https://images.unsplash.com/photo-1587616211892-f743fcca64f5?w=900&auto=format&fit=crop',
  hairdo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&auto=format&fit=crop',
  flat1: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&auto=format&fit=crop',
  flat2: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&auto=format&fit=crop',
  flat3: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&auto=format&fit=crop',
  flat4: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop',
  garage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop',
  house: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=900&auto=format&fit=crop',
  house2: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&auto=format&fit=crop',
  cottage: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=900&auto=format&fit=crop',
  land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop',
  office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&auto=format&fit=crop',
  tires: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=900&auto=format&fit=crop',
  car1: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&auto=format&fit=crop',
  car2: 'https://images.unsplash.com/photo-1493238792000-8113da705763?w=900&auto=format&fit=crop',
  car3: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&auto=format&fit=crop',
  moto: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=900&auto=format&fit=crop',
  moto2: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=900&auto=format&fit=crop',
  trailer: 'https://images.unsplash.com/photo-1613690399151-65ea69478674?w=900&auto=format&fit=crop',
  cinema: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&auto=format&fit=crop',
  fair: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=900&auto=format&fit=crop',
  concert: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&auto=format&fit=crop',
  concert2: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=900&auto=format&fit=crop',
  exhibition: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=900&auto=format&fit=crop',
  sport: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&auto=format&fit=crop',
  masterclass: 'https://images.unsplash.com/photo-1509721434272-b79147e0e708?w=900&auto=format&fit=crop'
};

// Базовая дата — стабильная точка отсчёта для всех временных меток.
// SSR и клиент видят одинаковый ISO, что исключает hydration mismatch.
const NOW = new Date('2026-09-19T14:00:00Z');

function iso(offsetMinutes) {
  return new Date(NOW.getTime() + offsetMinutes * 60_000).toISOString();
}
const minAgo = (m) => iso(-m);
const hoursAgo = (h) => iso(-h * 60);
const daysAgo = (d) => iso(-d * 60 * 24);
const daysAhead = (d, hourUTC = 16, minute = 0) => {
  const t = new Date(NOW.getTime() + d * 86_400_000);
  t.setUTCHours(hourUTC, minute, 0, 0);
  return t.toISOString();
};

// Авторы — переиспользуем на разных объявлениях.
const AUTHORS = {
  ilya: { id: 'u-ilya', name: 'Илья', rating: 4.9, deals: 128, type: 'shop' },
  dmitry: { id: 'u-dmitry', name: 'Дмитрий', rating: 4.9, deals: 34 },
  anna: { id: 'u-anna', name: 'Анна', rating: 5.0, deals: 8 },
  igor: { id: 'u-igor', name: 'Игорь', rating: 4.6, deals: 12 },
  olga: { id: 'u-olga', name: 'Ольга', rating: 4.8, deals: 21 },
  sergey: { id: 'u-sergey', name: 'Сергей', rating: 4.5, deals: 6 },
  viktor: { id: 'u-viktor', name: 'Виктор', rating: 4.9, deals: 41 },
  artem: { id: 'u-artem', name: 'Артём (ИП)', rating: 4.9, deals: 214, type: 'shop' },
  roman: { id: 'u-roman', name: 'Роман', rating: 5.0, deals: 156, type: 'shop' },
  serviceVyksa: { id: 'u-service-vyksa', name: 'СервисВыкса', rating: 4.8, deals: 512, type: 'shop' },
  nikolay: { id: 'u-nikolay', name: 'Николай', rating: 4.7, deals: 88 },
  irina: { id: 'u-irina', name: 'Ирина', rating: 4.9, deals: 3 },
  natalia: { id: 'u-natalia', name: 'Наталья', rating: 4.6, deals: 5 },
  vladimir: { id: 'u-vladimir', name: 'Владимир', rating: 4.4, deals: 2 },
  agencyDom: { id: 'u-agency-dom', name: 'АН «Ваш Дом»', rating: 4.8, deals: 74, type: 'shop' },
  alexey: { id: 'u-alexey', name: 'Алексей', rating: 4.7, deals: 19 },
  maxim: { id: 'u-maxim', name: 'Максим', rating: 4.9, deals: 4 },
  artur: { id: 'u-artur', name: 'Артур', rating: 4.6, deals: 2 },
  dkKul: { id: 'u-dk-kul', name: 'ДК Кулебаки', rating: 4.9, deals: 0, type: 'shop' },
  soseditVyksa: { id: 'u-sosedi', name: 'Соседи Выксы', rating: 4.8, deals: 0, type: 'shop' },
  gorPark: { id: 'u-park', name: 'Городской парк', rating: 4.7, deals: 0, type: 'shop' },
  artOvrag: { id: 'u-artovrag', name: 'Арт-Овраг', rating: 5.0, deals: 0, type: 'shop' },
  ekaterina: { id: 'u-ekaterina', name: 'Екатерина', rating: 4.9, deals: 17 },
  tatyana: { id: 'u-tatyana', name: 'Татьяна', rating: 4.7, deals: 11 },
  pavel: { id: 'u-pavel', name: 'Павел', rating: 4.8, deals: 23 }
};

// Хелпер для краткости.
const ad = (data) => data;

export const ADS = [
  // === БАРАХОЛКА (15) ===
  ad({
    id: 'm-macbook-vyksa', section: 'market',
    title: 'MacBook Pro 13" 2020, M1, 16/512',
    price: 78000, city: 'vyksa', address: 'Выкса, ул. Ленина',
    createdAt: daysAgo(3),
    image: IMG.laptop, gallery: [IMG.laptop, IMG.laptop2],
    verified: true, top: true, avitoUrl: 'https://www.avito.ru/vyksa/noutbuki',
    author: AUTHORS.dmitry, phone: '+7 (908) 123-45-67', tg: 'https://t.me/example',
    description: 'Ноутбук в идеальном состоянии, циклов зарядки 87. Полный комплект: коробка, зарядка. Куплен в DNS Выкса.'
  }),
  ad({
    id: 'm-stroller-kul', section: 'market',
    title: 'Детская коляска 3 в 1, Anex',
    price: 22500, city: 'kulebaki', address: 'Кулебаки, мкр. Северный',
    createdAt: daysAgo(1),
    image: IMG.stroller, gallery: [IMG.stroller, IMG.kidsCloth],
    verified: true, urgent: true,
    author: AUTHORS.anna, phone: '+7 (930) 555-11-22',
    description: 'Коляска 3 в 1: люлька, прогулка, автокресло. Пользовались 8 месяцев, всё чистое. Торг уместен.'
  }),
  ad({
    id: 'm-iphone-nav', section: 'market',
    title: 'iPhone 13, 128 Gb, синий',
    price: 42000, city: 'navashino', address: 'Навашино, ул. Трудовая',
    createdAt: hoursAgo(2),
    image: IMG.phone, gallery: [IMG.phone, IMG.phone2],
    verified: false,
    author: AUTHORS.igor, phone: '+7 (952) 222-33-44',
    description: 'Аккумулятор 89%. Без сколов и царапин. Комплект: коробка, кабель.'
  }),
  ad({
    id: 'm-chair-vyksa', section: 'market',
    title: 'Кресло-качалка ротанговое',
    price: 9500, city: 'vyksa', address: 'Выкса, ул. Красных Зорь',
    createdAt: daysAgo(5),
    image: IMG.chair, gallery: [IMG.chair],
    verified: true, author: AUTHORS.olga
  }),
  ad({
    id: 'm-bike-kul', section: 'market',
    title: 'Велосипед горный Stels, 26"',
    price: 12500, city: 'kulebaki', address: 'Кулебаки, центр',
    createdAt: daysAgo(7),
    image: IMG.bike, gallery: [IMG.bike],
    verified: false, author: AUTHORS.sergey
  }),
  ad({
    id: 'm-drill-nav', section: 'market',
    title: 'Перфоратор Bosch GBH 2-26, с кейсом',
    price: 6800, city: 'navashino', address: 'Навашино, ул. Заводская',
    createdAt: daysAgo(3),
    image: IMG.drill, gallery: [IMG.drill, IMG.tools],
    verified: true, author: AUTHORS.viktor
  }),
  ad({
    id: 'm-headphones-vyksa', section: 'market',
    title: 'Наушники Sony WH-1000XM4, чёрные',
    price: 15500, city: 'vyksa', address: 'Выкса, мкр. Гоголя',
    createdAt: hoursAgo(6),
    image: IMG.headphones, gallery: [IMG.headphones],
    verified: true, author: AUTHORS.pavel,
    description: 'В идеальном состоянии, чехол, кабель, коробка. Отличное шумоподавление.'
  }),
  ad({
    id: 'm-camera-kul', section: 'market',
    title: 'Sony Alpha A6000 + объектив 16-50',
    price: 24000, city: 'kulebaki', address: 'Кулебаки, ул. Труда',
    createdAt: daysAgo(4),
    image: IMG.camera, gallery: [IMG.camera],
    verified: true, top: true,
    author: AUTHORS.ekaterina,
    description: 'Пробег ~7000 кадров. Ремень, зарядка, батарея.'
  }),
  ad({
    id: 'm-tablet-nav', section: 'market',
    title: 'iPad 10.2 2021, 64 ГБ, Wi-Fi',
    price: 21000, city: 'navashino', address: 'Навашино, центр',
    createdAt: daysAgo(2),
    image: IMG.tablet, gallery: [IMG.tablet],
    verified: false, author: AUTHORS.alexey
  }),
  ad({
    id: 'm-crib-vyksa', section: 'market',
    title: 'Детская кроватка + матрас Askona',
    price: 4900, city: 'vyksa', address: 'Выкса, ул. Островского',
    createdAt: daysAgo(6),
    image: IMG.crib, gallery: [IMG.crib],
    verified: true, author: AUTHORS.tatyana
  }),
  ad({
    id: 'm-toys-kul', section: 'market',
    title: 'Пакет детских игрушек 3-5 лет',
    price: 1500, city: 'kulebaki', address: 'Кулебаки, ул. Мира',
    createdAt: daysAgo(2),
    image: IMG.kidsToys, gallery: [IMG.kidsToys],
    verified: false, author: AUTHORS.olga
  }),
  ad({
    id: 'm-sofa-vyksa', section: 'market',
    title: 'Диван угловой еврокнижка, серый',
    price: 18000, city: 'vyksa', address: 'Выкса, ул. Красных Зорь',
    createdAt: daysAgo(10),
    image: IMG.sofa, gallery: [IMG.sofa, IMG.table],
    verified: true, urgent: true,
    author: AUTHORS.natalia,
    description: 'Переезжаем. Состояние отличное, чехол снимается. Самовывоз.'
  }),
  ad({
    id: 'm-skis-nav', section: 'market',
    title: 'Лыжи беговые Fischer 195см + палки',
    price: 4500, city: 'navashino', address: 'Навашино',
    createdAt: daysAgo(14),
    image: IMG.skis, gallery: [IMG.skis],
    verified: false, author: AUTHORS.sergey
  }),
  ad({
    id: 'm-books-kul', section: 'market',
    title: 'Библиотека приключений: 20 книг',
    price: 2000, city: 'kulebaki', address: 'Кулебаки, ул. Труда',
    createdAt: daysAgo(3),
    image: IMG.books, gallery: [IMG.books],
    verified: false, author: AUTHORS.olga
  }),
  ad({
    id: 'm-jacket-vyksa', section: 'market',
    title: 'Пуховик мужской Bask, размер M',
    price: 6500, city: 'vyksa', address: 'Выкса, ул. Ленина',
    createdAt: daysAgo(1),
    image: IMG.jacket, gallery: [IMG.jacket],
    verified: true, author: AUTHORS.pavel
  }),

  // === УСЛУГИ (10) ===
  ad({
    id: 's-gruz-vyksa', section: 'services',
    title: 'Грузоперевозки по КВН, Газель тент 4м',
    price: 700, priceSuffix: '₽/час',
    city: 'vyksa', address: 'Выкса → Кулебаки, Навашино',
    createdAt: minAgo(15),
    image: IMG.gazelle, gallery: [IMG.gazelle, IMG.truck],
    verified: true, top: true,
    author: AUTHORS.artem, phone: '+7 (930) 700-70-70', tg: 'https://t.me/example',
    description: 'Переезды по трём городам. Грузчики от 400₽/час. Работаю ежедневно 8:00–22:00. Официальный чек.'
  }),
  ad({
    id: 's-elec-kul', section: 'services',
    title: 'Электрик с выездом Кулебаки / Выкса',
    price: 500, priceSuffix: 'от, ₽',
    city: 'kulebaki', address: 'Кулебаки и район',
    createdAt: minAgo(30),
    image: IMG.electric, gallery: [IMG.electric],
    verified: true, top: true,
    author: AUTHORS.roman, phone: '+7 (920) 111-22-33',
    description: 'Установка розеток, замена проводки, штробление. Опыт 14 лет. Выезд в день обращения.'
  }),
  ad({
    id: 's-washer-vyksa', section: 'services',
    title: 'Ремонт стиральных машин на дому',
    price: 800, priceSuffix: 'диагностика бесплатно',
    city: 'vyksa', address: 'Выкса, весь город',
    createdAt: hoursAgo(4),
    image: IMG.washer, gallery: [IMG.washer],
    verified: true,
    author: AUTHORS.serviceVyksa, phone: '+7 (908) 222-11-33'
  }),
  ad({
    id: 's-plumb-nav', section: 'services',
    title: 'Сантехник — установка, замена, ремонт',
    price: 600, priceSuffix: 'от, ₽',
    city: 'navashino', address: 'Навашино',
    createdAt: daysAgo(1),
    image: IMG.plumb, gallery: [IMG.plumb],
    verified: true, author: AUTHORS.nikolay
  }),
  ad({
    id: 's-fridge-kul', section: 'services',
    title: 'Ремонт холодильников с выездом',
    price: 900, priceSuffix: 'от, ₽',
    city: 'kulebaki', address: 'Кулебаки, Выкса, Навашино',
    createdAt: hoursAgo(3),
    image: IMG.fridge, gallery: [IMG.fridge],
    verified: true, top: true,
    author: AUTHORS.viktor,
    description: 'Гарантия на работу — 12 месяцев. Всегда с оригинальными запчастями.'
  }),
  ad({
    id: 's-clean-vyksa', section: 'services',
    title: 'Клининг квартир: генеральная уборка',
    price: 2500, priceSuffix: 'от, ₽',
    city: 'vyksa', address: 'Выкса',
    createdAt: daysAgo(2),
    image: IMG.cleaning, gallery: [IMG.cleaning],
    verified: true,
    author: AUTHORS.ekaterina,
    description: 'Всё своё оборудование и химия. После нас — как в новой квартире.'
  }),
  ad({
    id: 's-tutor-vyksa', section: 'services',
    title: 'Репетитор по математике, 5-11 класс',
    price: 800, priceSuffix: '₽/час',
    city: 'vyksa', address: 'Выкса, онлайн и офлайн',
    createdAt: hoursAgo(20),
    image: IMG.tutor, gallery: [IMG.tutor],
    verified: true,
    author: AUTHORS.tatyana,
    description: 'Магистр НГТУ, 6 лет опыта. Подготовка к ОГЭ/ЕГЭ. Первое занятие пробное.'
  }),
  ad({
    id: 's-nanny-kul', section: 'services',
    title: 'Няня на пару часов в день',
    price: 350, priceSuffix: '₽/час',
    city: 'kulebaki', address: 'Кулебаки, центр',
    createdAt: daysAgo(3),
    image: IMG.nanny, gallery: [IMG.nanny],
    verified: true,
    author: AUTHORS.olga
  }),
  ad({
    id: 's-hair-nav', section: 'services',
    title: 'Парикмахер — стрижка, окрашивание',
    price: 800, priceSuffix: 'от, ₽',
    city: 'navashino', address: 'Навашино, ул. Советская',
    createdAt: hoursAgo(8),
    image: IMG.hairdo, gallery: [IMG.hairdo],
    verified: false,
    author: AUTHORS.natalia
  }),
  ad({
    id: 's-truck-vyksa', section: 'services',
    title: 'Грузчики от 400 ₽/час, весь КВН',
    price: 400, priceSuffix: '₽/час/чел',
    city: 'vyksa', address: 'Выкса и агломерация',
    createdAt: daysAgo(1),
    image: IMG.truck, gallery: [IMG.truck],
    verified: true,
    author: AUTHORS.pavel,
    description: 'От 2-х человек. Опыт, аккуратность, ремни и стропы свои.'
  }),

  // === НЕДВИЖИМОСТЬ (10) ===
  ad({
    id: 'r-2k-vyksa', section: 'realty',
    title: 'Сдам 2-к квартиру в центре Выксы',
    price: 18000, priceSuffix: '₽/мес',
    city: 'vyksa', address: 'Выкса, ул. Островского, 42',
    createdAt: hoursAgo(5),
    image: IMG.flat1, gallery: [IMG.flat1, IMG.flat2],
    verified: true, top: true,
    author: AUTHORS.irina, phone: '+7 (930) 999-88-77',
    description: '52 м², 3/5 эт., кирпич. Мебель, техника, интернет. Рядом парк, школа №8. Без животных. Депозит 50%.'
  }),
  ad({
    id: 'r-1k-kul', section: 'realty',
    title: 'Сдам 1-к квартиру, ремонт',
    price: 13000, priceSuffix: '₽/мес',
    city: 'kulebaki', address: 'Кулебаки, мкр. Восточный',
    createdAt: daysAgo(2),
    image: IMG.flat2, gallery: [IMG.flat2, IMG.flat3],
    verified: true, author: AUTHORS.natalia
  }),
  ad({
    id: 'r-garage-nav', section: 'realty',
    title: 'Сдам гараж, охрана 24/7',
    price: 3500, priceSuffix: '₽/мес',
    city: 'navashino', address: 'Навашино, ГСК «Волна»',
    createdAt: daysAgo(3),
    image: IMG.garage, gallery: [IMG.garage],
    verified: false, author: AUTHORS.vladimir
  }),
  ad({
    id: 'r-house-vyksa', section: 'realty',
    title: 'Продам дом 90 м² с участком 8 сот.',
    price: 3200000,
    city: 'vyksa', address: 'Выкса, ул. Полевая',
    createdAt: daysAgo(7),
    image: IMG.house, gallery: [IMG.house, IMG.house2],
    verified: true, author: AUTHORS.agencyDom
  }),
  ad({
    id: 'r-1k-nav', section: 'realty',
    title: 'Сдам 1-к квартиру Навашино, посуточно',
    price: 1500, priceSuffix: '₽/сутки',
    city: 'navashino', address: 'Навашино, ул. Трудовая',
    createdAt: daysAgo(1),
    image: IMG.flat3, gallery: [IMG.flat3],
    verified: false, urgent: true,
    author: AUTHORS.vladimir
  }),
  ad({
    id: 'r-3k-vyksa', section: 'realty',
    title: 'Продам 3-к квартиру, ремонт',
    price: 4200000,
    city: 'vyksa', address: 'Выкса, ул. Лепсе',
    createdAt: daysAgo(4),
    image: IMG.flat4, gallery: [IMG.flat4],
    verified: true, top: true,
    author: AUTHORS.agencyDom,
    description: '72 м², 4/9 эт., монолит. Свежий ремонт, новая мебель. Ипотека одобрена.'
  }),
  ad({
    id: 'r-cottage-kul', section: 'realty',
    title: 'Дача в СНТ «Заречье», баня, свет',
    price: 850000,
    city: 'kulebaki', address: 'Кулебаки, СНТ Заречье',
    createdAt: daysAgo(9),
    image: IMG.cottage, gallery: [IMG.cottage, IMG.garden],
    verified: true, author: AUTHORS.viktor
  }),
  ad({
    id: 'r-land-nav', section: 'realty',
    title: 'Участок 15 соток ИЖС, электричество',
    price: 550000,
    city: 'navashino', address: 'Навашино, ул. Новая',
    createdAt: daysAgo(12),
    image: IMG.land, gallery: [IMG.land],
    verified: false, author: AUTHORS.nikolay
  }),
  ad({
    id: 'r-office-vyksa', section: 'realty',
    title: 'Сдам офис 24 м² в центре',
    price: 9000, priceSuffix: '₽/мес',
    city: 'vyksa', address: 'Выкса, ул. Ленина, 8',
    createdAt: daysAgo(6),
    image: IMG.office, gallery: [IMG.office],
    verified: true, author: AUTHORS.agencyDom
  }),
  ad({
    id: 'r-house-kul', section: 'realty',
    title: 'Продам дом 60 м², 6 сот., подъезд асфальт',
    price: 1900000,
    city: 'kulebaki', address: 'Кулебаки, ул. Гагарина',
    createdAt: daysAgo(5),
    image: IMG.house2, gallery: [IMG.house2],
    verified: true, author: AUTHORS.viktor
  }),

  // === АВТО (10) ===
  ad({
    id: 'a-tires-kul', section: 'auto',
    title: 'Зимняя резина R15, комплект 4 шт.',
    price: 8500,
    city: 'kulebaki', address: 'Кулебаки, ул. Труда',
    createdAt: daysAgo(1),
    image: IMG.tires, gallery: [IMG.tires],
    verified: true, urgent: true,
    author: AUTHORS.alexey
  }),
  ad({
    id: 'a-vesta-vyksa', section: 'auto',
    title: 'Lada Vesta 2019, 1.6, МКПП',
    price: 720000,
    city: 'vyksa', address: 'Выкса, ул. Ленина',
    createdAt: daysAgo(3),
    image: IMG.car1, gallery: [IMG.car1],
    verified: true, top: true,
    author: AUTHORS.maxim, avitoUrl: 'https://www.avito.ru/vyksa/avtomobili',
    description: 'Один хозяин по ПТС, обслуживание у ОД. Пробег 68000 км, зимняя резина в подарок.'
  }),
  ad({
    id: 'a-ninja-nav', section: 'auto',
    title: 'Мотоцикл Kawasaki Ninja 300',
    price: 320000,
    city: 'navashino', address: 'Навашино',
    createdAt: daysAgo(5),
    image: IMG.moto, gallery: [IMG.moto],
    verified: false, author: AUTHORS.artur
  }),
  ad({
    id: 'a-solaris-kul', section: 'auto',
    title: 'Hyundai Solaris 2017, АКПП, 1.6',
    price: 890000,
    city: 'kulebaki', address: 'Кулебаки, ул. Труда',
    createdAt: daysAgo(2),
    image: IMG.car2, gallery: [IMG.car2],
    verified: true, top: true,
    author: AUTHORS.maxim
  }),
  ad({
    id: 'a-nissan-vyksa', section: 'auto',
    title: 'Nissan Almera 2015, 1.6, МКПП',
    price: 520000,
    city: 'vyksa', address: 'Выкса',
    createdAt: daysAgo(4),
    image: IMG.car3, gallery: [IMG.car3],
    verified: true, author: AUTHORS.alexey
  }),
  ad({
    id: 'a-honda-nav', section: 'auto',
    title: 'Мопед Honda Dio 2010',
    price: 55000,
    city: 'navashino', address: 'Навашино',
    createdAt: daysAgo(6),
    image: IMG.moto2, gallery: [IMG.moto2],
    verified: false, author: AUTHORS.artur
  }),
  ad({
    id: 'a-trailer-vyksa', section: 'auto',
    title: 'Прицеп легковой 2.5×1.3, б/у',
    price: 45000,
    city: 'vyksa', address: 'Выкса',
    createdAt: daysAgo(8),
    image: IMG.trailer, gallery: [IMG.trailer],
    verified: true, author: AUTHORS.pavel
  }),
  ad({
    id: 'a-parts-kul', section: 'auto',
    title: 'Задняя дверь Renault Duster (в сборе)',
    price: 12000,
    city: 'kulebaki', address: 'Кулебаки, разбор',
    createdAt: daysAgo(3),
    image: IMG.tools, gallery: [IMG.tools],
    verified: false, author: AUTHORS.sergey
  }),
  ad({
    id: 'a-service-vyksa', section: 'auto',
    title: 'Требуется автомеханик на СТО (работа)',
    price: 60000, priceSuffix: '₽/мес',
    city: 'vyksa', address: 'Выкса, СТО «Волна»',
    createdAt: daysAgo(2),
    image: IMG.tools, gallery: [IMG.tools],
    verified: true, author: AUTHORS.artem
  }),
  ad({
    id: 'a-tires2-nav', section: 'auto',
    title: 'Летние шины R16, 4 шт. Kumho',
    price: 9800,
    city: 'navashino', address: 'Навашино',
    createdAt: daysAgo(11),
    image: IMG.tires, gallery: [IMG.tires],
    verified: false, author: AUTHORS.nikolay
  }),

  // === АФИША (10) ===
  ad({
    id: 'e-cinema-kul', section: 'events',
    title: 'Киносеанс «Ёлки-11» в ДК Кулебаки',
    price: 250, priceSuffix: '₽/билет',
    city: 'kulebaki', address: 'Кулебаки, ДК Кулебаки, Большой зал',
    createdAt: daysAgo(1), eventDate: daysAhead(5, 16, 0),
    image: IMG.cinema, gallery: [IMG.cinema],
    verified: true, top: true,
    author: AUTHORS.dkKul,
    description: 'Премьера в маленьком городе — атмосфера настоящего кинотеатра. Попкорн и лимонад в фойе.'
  }),
  ad({
    id: 'e-fair-vyksa', section: 'events',
    title: 'Гаражная распродажа, Выкса',
    price: 0, priceSuffix: 'вход бесплатно',
    city: 'vyksa', address: 'Выкса, парковка у ТЦ «Волна»',
    createdAt: daysAgo(2), eventDate: daysAhead(6, 7, 0),
    image: IMG.fair, gallery: [IMG.fair],
    verified: true, author: AUTHORS.soseditVyksa
  }),
  ad({
    id: 'e-concert-nav', section: 'events',
    title: 'Концерт группы «ТриО» в парке',
    price: 400, priceSuffix: '₽/билет',
    city: 'navashino', address: 'Навашино, Городской парк',
    createdAt: daysAgo(3), eventDate: daysAhead(11, 17, 0),
    image: IMG.concert, gallery: [IMG.concert, IMG.concert2],
    verified: false, author: AUTHORS.gorPark
  }),
  ad({
    id: 'e-master-vyksa', section: 'events',
    title: 'Мастер-класс для детей: роспись по дереву',
    price: 350, priceSuffix: '₽/ребёнок',
    city: 'vyksa', address: 'Выкса, «Арт-Овраг»',
    createdAt: daysAgo(1), eventDate: daysAhead(5, 9, 0),
    image: IMG.masterclass, gallery: [IMG.masterclass, IMG.kidsToys],
    verified: true, author: AUTHORS.artOvrag
  }),
  ad({
    id: 'e-exhibition-kul', section: 'events',
    title: 'Выставка «Кулебаки: 100 лет металлургии»',
    price: 150, priceSuffix: '₽/билет',
    city: 'kulebaki', address: 'Кулебаки, Краеведческий музей',
    createdAt: daysAgo(4), eventDate: daysAhead(2, 8, 0),
    image: IMG.exhibition, gallery: [IMG.exhibition],
    verified: true, top: true,
    author: AUTHORS.dkKul,
    description: 'Экспозиция с уникальными артефактами и фотографиями с 1925 по 2025.'
  }),
  ad({
    id: 'e-sport-vyksa', section: 'events',
    title: 'Городской турнир по мини-футболу',
    price: 0, priceSuffix: 'вход свободный',
    city: 'vyksa', address: 'Выкса, ФОК «Металлург»',
    createdAt: daysAgo(2), eventDate: daysAhead(7, 11, 0),
    image: IMG.sport, gallery: [IMG.sport],
    verified: true, author: AUTHORS.soseditVyksa
  }),
  ad({
    id: 'e-kids-kul', section: 'events',
    title: 'Детский спектакль «Три поросёнка»',
    price: 200, priceSuffix: '₽/билет',
    city: 'kulebaki', address: 'Кулебаки, Детская библиотека',
    createdAt: daysAgo(3), eventDate: daysAhead(3, 12, 0),
    image: IMG.kidsToys, gallery: [IMG.kidsToys],
    verified: true, author: AUTHORS.dkKul
  }),
  ad({
    id: 'e-concert-kul', section: 'events',
    title: 'Вечер джаза в ДК',
    price: 500, priceSuffix: '₽/билет',
    city: 'kulebaki', address: 'Кулебаки, ДК Кулебаки, Малый зал',
    createdAt: daysAgo(6), eventDate: daysAhead(9, 18, 0),
    image: IMG.concert2, gallery: [IMG.concert2],
    verified: true, author: AUTHORS.dkKul
  }),
  ad({
    id: 'e-yoga-vyksa', section: 'events',
    title: 'Утренняя йога в парке (каждую субботу)',
    price: 300, priceSuffix: '₽/занятие',
    city: 'vyksa', address: 'Выкса, парк «Дружбы»',
    createdAt: daysAgo(2), eventDate: daysAhead(6, 5, 30),
    image: IMG.fitness, gallery: [IMG.fitness],
    verified: false, author: AUTHORS.ekaterina
  }),
  ad({
    id: 'e-fair-nav', section: 'events',
    title: 'Ярмарка ремёсел Навашино',
    price: 0, priceSuffix: 'вход бесплатно',
    city: 'navashino', address: 'Навашино, центральная площадь',
    createdAt: daysAgo(5), eventDate: daysAhead(13, 6, 0),
    image: IMG.fair, gallery: [IMG.fair, IMG.garden],
    verified: true, author: AUTHORS.gorPark
  })
];

// Быстрый счётчик — теперь возвращаем результат через api.js (см. lib/api.js).
export function countBySection(city = 'all') {
  const map = {};
  for (const s of SECTIONS) map[s.id] = 0;
  for (const a of ADS) {
    if (city === 'all' || a.city === city) map[a.section] += 1;
  }
  return map;
}

export function cityName(id) {
  return CITIES.find((c) => c.id === id)?.name || '';
}
