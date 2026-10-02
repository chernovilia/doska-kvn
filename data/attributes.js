// Характеристики объявления по разделу и подгруппе.
// Хранятся в Ad.attributes плоским объектом { key: строка | число }. Сервер проверяет только
// форму значений (до 20 полей, ключи a-z0-9_), поэтому набор полей можно менять здесь
// без миграций: старые объявления просто покажут то, что у них заполнено.
//
// Поле: { key, label, type: 'select' | 'combo' | 'number' | 'text', options?, unit?, min?, max?,
//         decimals? (для number), plain? (число без разделителя тысяч — год), placeholder? }
// combo — выбор из длинного списка с поиском (марка, модель, порода); чего нет в списке, можно вписать.
//         options — массив или функция (values) => массив: модель зависит от выбранной марки (dependsOn).
// Набор полей подгруппы — массив или функция (category) => массив, когда поля зависят от категории.

import {
  APPLIANCE_BRANDS,
  AV_BRANDS,
  CAR_BRANDS,
  CAR_MODELS,
  CAT_BREEDS,
  COMMERCIAL_BRANDS,
  COMPUTER_BRANDS,
  CONSOLE_BRANDS,
  DOG_BREEDS,
  MOTO_BRANDS,
  PHONE_BRANDS,
  PHONE_MODELS,
  TIRE_BRANDS,
  TIRE_PROFILES,
  TIRE_WIDTHS,
  canonicalOption
} from './brands';

const CONDITION = { key: 'condition', label: 'Состояние', type: 'select', options: ['Новое', 'Б/у'] };
const BRAND = { key: 'brand', label: 'Бренд', type: 'text', placeholder: 'Например, Samsung' };
const MODEL = { key: 'model', label: 'Модель', type: 'text' };
const YEAR = { key: 'year', label: 'Год выпуска', type: 'number', min: 1950, max: 2030, plain: true };
const MILEAGE = { key: 'mileage', label: 'Пробег', type: 'number', unit: 'км', min: 0, max: 3_000_000 };
const AREA = { key: 'area', label: 'Площадь', type: 'number', unit: 'м²', min: 1, max: 100_000, decimals: 1 };
const ROOMS = { key: 'rooms', label: 'Комнат', type: 'select', options: ['Студия', '1', '2', '3', '4+'] };
const FLOOR = { key: 'floor', label: 'Этаж', type: 'number', min: -5, max: 100 };
const FLOORS = { key: 'floors', label: 'Этажей в доме', type: 'number', min: 1, max: 100 };
const SIZE = { key: 'size', label: 'Размер', type: 'text', placeholder: 'M, 46, 38…' };
const SCHEDULE = {
  key: 'schedule',
  label: 'График',
  type: 'select',
  options: ['Полный день', 'Сменный', 'Гибкий', 'Вахта', 'Удалённо']
};
const EXPERIENCE = { key: 'experience', label: 'Опыт', type: 'select', options: ['Без опыта', 'От 1 года', 'От 3 лет'] };

// Марка или бренд из списка
const brandFrom = (options, extra = {}) => ({ key: 'brand', label: 'Бренд', type: 'combo', options, placeholder: 'Начните вводить', ...extra });
// Модель зависит от выбранной марки; марки нет в справочнике — обычный ввод
const modelFrom = (byBrand, extra = {}) => ({
  key: 'model',
  label: 'Модель',
  type: 'combo',
  dependsOn: 'brand',
  options: (values) => byBrand[values?.brand] || [],
  placeholder: 'Начните вводить',
  ...extra
});

const CAR = [
  brandFrom(CAR_BRANDS, { label: 'Марка', placeholder: 'Например, Lada или «лада»' }),
  modelFrom(CAR_MODELS, { placeholder: 'Сначала выберите марку' }),
  YEAR,
  MILEAGE,
  { key: 'engine', label: 'Двигатель', type: 'number', unit: 'л', min: 0.1, max: 10, decimals: 1 },
  { key: 'transmission', label: 'Коробка', type: 'select', options: ['Механика', 'Автомат', 'Робот', 'Вариатор'] },
  { key: 'fuel', label: 'Топливо', type: 'select', options: ['Бензин', 'Дизель', 'Газ', 'Гибрид', 'Электро'] },
  { key: 'drive', label: 'Привод', type: 'select', options: ['Передний', 'Задний', 'Полный'] },
  { key: 'car_state', label: 'Состояние', type: 'select', options: ['На ходу', 'Требует ремонта', 'На запчасти'] }
];

const TIRES = [
  brandFrom(TIRE_BRANDS),
  { key: 'tire_width', label: 'Ширина', type: 'combo', options: TIRE_WIDTHS, unit: 'мм', placeholder: '205' },
  { key: 'tire_profile', label: 'Профиль', type: 'combo', options: TIRE_PROFILES, placeholder: '55' }
];
const DIAMETER = {
  key: 'diameter',
  label: 'Диаметр',
  type: 'select',
  options: ['R12', 'R13', 'R14', 'R15', 'R16', 'R17', 'R18', 'R19', 'R20', 'R21', 'R22']
};
const QUANTITY = { key: 'quantity', label: 'Количество', type: 'number', unit: 'шт.', min: 1, max: 100 };
const DISK_CATEGORIES = ['Литые диски', 'Штампованные диски'];

const FIELDS = {
  auto: {
    Легковые: CAR,
    Мото: [
      brandFrom(MOTO_BRANDS, { label: 'Марка', placeholder: 'Например, Honda' }),
      MODEL,
      YEAR,
      MILEAGE,
      { key: 'engine_cc', label: 'Объём двигателя', type: 'number', unit: 'см³', min: 1, max: 5000 }
    ],
    'Коммерческий транспорт': [brandFrom(COMMERCIAL_BRANDS, { label: 'Марка', placeholder: 'Например, ГАЗ' }), MODEL, YEAR, MILEAGE],
    'Водный транспорт': [YEAR, CONDITION],
    // Шинам — бренд, ширина и профиль; дискам — разболтовка
    'Шины и диски': (category) =>
      DISK_CATEGORIES.includes(category)
        ? [DIAMETER, { key: 'pcd', label: 'Разболтовка', type: 'text', placeholder: 'Например, 4x100' }, QUANTITY, CONDITION]
        : [...TIRES, DIAMETER, QUANTITY, CONDITION],
    Запчасти: [{ key: 'car_brand', label: 'Для марки', type: 'combo', options: CAR_BRANDS, placeholder: 'Например, Lada' }, CONDITION],
    Автотовары: [CONDITION]
  },
  realty: {
    'Аренда жилья': [
      ROOMS,
      AREA,
      FLOOR,
      FLOORS,
      { key: 'furniture', label: 'Мебель', type: 'select', options: ['Есть', 'Нет'] }
    ],
    'Продажа жилья': [
      ROOMS,
      AREA,
      FLOOR,
      FLOORS,
      { key: 'land', label: 'Участок', type: 'number', unit: 'сот.', min: 0.1, max: 100_000, decimals: 1 }
    ],
    'Сниму и куплю': [ROOMS, AREA],
    Коммерческая: [AREA],
    Гаражи: [AREA]
  },
  jobs: {
    Вакансии: [
      SCHEDULE,
      { key: 'employment', label: 'Занятость', type: 'select', options: ['Полная', 'Частичная', 'Подработка'] },
      EXPERIENCE
    ],
    Резюме: [SCHEDULE, EXPERIENCE, { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', min: 14, max: 99 }]
  },
  services: {
    '*': [
      {
        key: 'where',
        label: 'Где работаете',
        type: 'select',
        options: ['Выезд к клиенту', 'У себя', 'Удалённо']
      },
      {
        key: 'service_experience',
        label: 'Опыт',
        type: 'select',
        options: ['До 1 года', '1–3 года', '3–10 лет', 'Больше 10 лет']
      }
    ]
  },
  electronics: {
    Телефоны: [
      brandFrom(PHONE_BRANDS, { placeholder: 'Например, Samsung или «айфон»' }),
      modelFrom(PHONE_MODELS, { placeholder: 'Сначала выберите бренд' }),
      {
        key: 'memory',
        label: 'Память',
        type: 'select',
        options: ['До 32 ГБ', '64 ГБ', '128 ГБ', '256 ГБ', '512 ГБ', '1 ТБ']
      },
      CONDITION
    ],
    Компьютеры: [
      brandFrom(COMPUTER_BRANDS),
      MODEL,
      { key: 'ram', label: 'Оперативная память', type: 'select', options: ['До 4 ГБ', '8 ГБ', '16 ГБ', '32 ГБ и больше'] },
      CONDITION
    ],
    'ТВ, аудио, фото': (category) => [
      brandFrom(AV_BRANDS),
      ...(category === 'Телевизоры' || !category
        ? [{ key: 'diagonal', label: 'Диагональ', type: 'number', unit: '″', min: 10, max: 120 }]
        : []),
      CONDITION
    ],
    Игры: [{ key: 'platform', label: 'Платформа', type: 'combo', options: CONSOLE_BRANDS, placeholder: 'Например, PlayStation 5' }, CONDITION],
    'Бытовая техника': [brandFrom(APPLIANCE_BRANDS), CONDITION],
    '*': [BRAND, CONDITION]
  },
  home: { '*': [CONDITION] },
  clothes: { Красота: [BRAND, CONDITION], '*': [SIZE, { ...BRAND, placeholder: 'Например, Zara' }, CONDITION] },
  kids: { 'Одежда и обувь': [SIZE, CONDITION], '*': [CONDITION] },
  pets: {
    // Порода из списка — у кошек и собак
    Животные: (category) => [
      category === 'Кошки' || category === 'Собаки'
        ? { key: 'breed', label: 'Порода', type: 'combo', options: category === 'Кошки' ? CAT_BREEDS : DOG_BREEDS, placeholder: 'Например, беспородная' }
        : !category
          ? { key: 'breed', label: 'Порода', type: 'combo', options: [...new Set([...CAT_BREEDS, ...DOG_BREEDS])], placeholder: 'Например, беспородная' }
          : { key: 'breed', label: 'Порода или вид', type: 'text', placeholder: 'Например, волнистый попугай' },
      { key: 'age', label: 'Возраст', type: 'text', placeholder: 'Например, 3 месяца' },
      { key: 'gender', label: 'Пол', type: 'select', options: ['Мальчик', 'Девочка'] }
    ],
    Товары: [CONDITION],
    Услуги: []
  },
  hobby: { '*': [BRAND, CONDITION] },
  food: {
    '*': [
      { key: 'unit', label: 'Цена за', type: 'select', options: ['кг', 'литр', 'штуку', 'десяток', 'упаковку'] },
      { key: 'delivery', label: 'Как забрать', type: 'select', options: ['Самовывоз', 'Доставка', 'Самовывоз и доставка'] }
    ]
  },
  business: { Оборудование: [CONDITION], '*': [] },
  lost: { '*': [{ key: 'when', label: 'Когда', type: 'text', placeholder: 'Например, 12 октября вечером' }] }
};

// Поля для раздела и подгруппы; '*' — для всех подгрупп раздела без своего набора.
// category нужна там, где набор зависит от категории (шины и диски, порода); без неё — общий набор.
export function getAttributeFields(section, group, category) {
  const bySection = FIELDS[section];
  if (!bySection) return [];
  const set = bySection[group] || bySection['*'] || [];
  return typeof set === 'function' ? set(category) : set;
}

// Варианты поля со списком при текущих значениях формы (модель — по выбранной марке).
export function fieldOptions(field, values) {
  if (!field?.options) return [];
  return typeof field.options === 'function' ? field.options(values || {}) : field.options;
}

function formatValue(field, value) {
  if (field?.type === 'number' && typeof value === 'number') {
    const num = field.plain
      ? String(value)
      : new Intl.NumberFormat('ru-RU', { maximumFractionDigits: field.decimals || 0 }).format(value);
    return field.unit ? `${num} ${field.unit}` : num;
  }
  return String(value);
}

// Строки для таблицы на странице объявления: [{ label, value }] в порядке полей раздела.
export function describeAttributes(ad) {
  const attrs = ad?.attributes;
  if (!attrs || typeof attrs !== 'object') return [];
  const fields = getAttributeFields(ad.section, ad.categoryGroup, ad.category);
  const rows = [];
  for (const f of fields) {
    if (attrs[f.key] != null && attrs[f.key] !== '') rows.push({ label: f.label, value: formatValue(f, attrs[f.key]) });
  }
  return rows;
}

// Короткая строка для карточки: «2019 · 85 000 км · Механика», «2-к · 54 м² · 3/9 эт.».
export function attributesSummary(ad) {
  const a = ad?.attributes;
  if (!a || typeof a !== 'object') return '';
  const fmt = (n) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(n);
  const parts = [];
  if (ad.section === 'auto') {
    if (a.year) parts.push(String(a.year));
    if (a.mileage != null) parts.push(`${fmt(a.mileage)} км`);
    if (a.transmission) parts.push(a.transmission);
    if (a.tire_width && a.tire_profile && a.diameter) parts.push(`${a.tire_width}/${a.tire_profile} ${a.diameter}`);
    else if (a.diameter) parts.push(a.diameter);
  } else if (ad.section === 'realty') {
    if (a.rooms) parts.push(a.rooms === 'Студия' ? 'студия' : `${a.rooms}-к`);
    if (a.area) parts.push(`${fmt(a.area)} м²`);
    if (a.floor != null) parts.push(a.floors ? `${a.floor}/${a.floors} эт.` : `${a.floor} эт.`);
  } else if (ad.section === 'jobs') {
    if (a.schedule) parts.push(a.schedule);
    if (a.experience) parts.push(a.experience.toLowerCase());
  } else if (ad.section === 'services') {
    if (a.where) parts.push(a.where);
    if (a.service_experience) parts.push(`опыт ${a.service_experience.toLowerCase()}`);
  } else if (ad.section === 'food') {
    if (a.unit) parts.push(`за ${a.unit}`);
    if (a.delivery) parts.push(a.delivery.toLowerCase());
  } else if (ad.section === 'lost') {
    if (a.when) parts.push(a.when);
  } else {
    if (a.memory) parts.push(a.memory);
    if (a.size) parts.push(`размер ${a.size}`);
    if (a.condition) parts.push(a.condition === 'Новое' ? 'новое' : 'б/у');
  }
  return parts.join(' · ');
}

// Значение из поля ввода → то, что уходит на сервер (число или строка, пустое — undefined).
// values — остальные поля формы: по ним определяется список модели (зависит от марки).
export function parseAttributeInput(field, raw, values) {
  const v = String(raw ?? '').trim();
  if (!v) return undefined;
  // Вписанное руками приводим к строке из списка: «киа» → «Kia»
  if (field.type === 'combo') return canonicalOption(fieldOptions(field, values), v).slice(0, 100);
  if (field.type !== 'number') return v.slice(0, 100);
  const n = Number(v.replace(',', '.').replace(/\s/g, ''));
  if (!Number.isFinite(n)) return undefined;
  return field.decimals ? Math.round(n * 10 ** field.decimals) / 10 ** field.decimals : Math.round(n);
}
