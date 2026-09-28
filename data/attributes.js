// Характеристики объявления по разделу и подгруппе.
// Хранятся в Ad.attributes плоским объектом { key: строка | число }. Сервер проверяет только
// форму значений (до 20 полей, ключи a-z0-9_), поэтому набор полей можно менять здесь
// без миграций: старые объявления просто покажут то, что у них заполнено.
//
// Поле: { key, label, type: 'select' | 'number' | 'text', options?, unit?, min?, max?,
//         decimals? (для number), plain? (число без разделителя тысяч — год), placeholder? }

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

const CAR = [
  { ...BRAND, label: 'Марка', placeholder: 'Например, Lada' },
  { ...MODEL, placeholder: 'Например, Vesta' },
  YEAR,
  MILEAGE,
  { key: 'engine', label: 'Двигатель', type: 'number', unit: 'л', min: 0.1, max: 10, decimals: 1 },
  { key: 'transmission', label: 'Коробка', type: 'select', options: ['Механика', 'Автомат', 'Робот', 'Вариатор'] },
  { key: 'fuel', label: 'Топливо', type: 'select', options: ['Бензин', 'Дизель', 'Газ', 'Гибрид', 'Электро'] },
  { key: 'drive', label: 'Привод', type: 'select', options: ['Передний', 'Задний', 'Полный'] }
];

const FIELDS = {
  auto: {
    Легковые: CAR,
    Мото: [
      { ...BRAND, label: 'Марка', placeholder: 'Например, Honda' },
      MODEL,
      YEAR,
      MILEAGE,
      { key: 'engine_cc', label: 'Объём двигателя', type: 'number', unit: 'см³', min: 1, max: 5000 }
    ],
    'Коммерческий транспорт': [{ ...BRAND, label: 'Марка', placeholder: 'Например, ГАЗ' }, MODEL, YEAR, MILEAGE],
    'Шины и диски': [
      {
        key: 'diameter',
        label: 'Диаметр',
        type: 'select',
        options: ['R13', 'R14', 'R15', 'R16', 'R17', 'R18', 'R19', 'R20', 'R21', 'R22']
      },
      { key: 'quantity', label: 'Количество', type: 'number', unit: 'шт.', min: 1, max: 100 },
      CONDITION
    ],
    Запчасти: [{ key: 'car_brand', label: 'Для марки', type: 'text', placeholder: 'Например, Lada' }, CONDITION],
    Прочее: [CONDITION]
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
  electronics: {
    Телефоны: [
      BRAND,
      MODEL,
      {
        key: 'memory',
        label: 'Память',
        type: 'select',
        options: ['До 32 ГБ', '64 ГБ', '128 ГБ', '256 ГБ', '512 ГБ', '1 ТБ']
      },
      CONDITION
    ],
    Компьютеры: [BRAND, MODEL, CONDITION],
    '*': [BRAND, CONDITION]
  },
  home: { '*': [CONDITION] },
  clothes: { '*': [SIZE, { ...BRAND, placeholder: 'Например, Zara' }, CONDITION] },
  kids: { 'Одежда и обувь': [SIZE, CONDITION], '*': [CONDITION] },
  pets: {
    Животные: [
      { key: 'breed', label: 'Порода', type: 'text', placeholder: 'Например, беспородная' },
      { key: 'age', label: 'Возраст', type: 'text', placeholder: 'Например, 3 месяца' }
    ],
    Товары: [CONDITION]
  },
  hobby: { '*': [BRAND, CONDITION] }
};

// Поля для раздела и подгруппы; '*' — для всех подгрупп раздела без своего набора.
export function getAttributeFields(section, group) {
  const bySection = FIELDS[section];
  if (!bySection) return [];
  return bySection[group] || bySection['*'] || [];
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
  const fields = getAttributeFields(ad.section, ad.categoryGroup);
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
    if (a.diameter) parts.push(a.diameter);
  } else if (ad.section === 'realty') {
    if (a.rooms) parts.push(a.rooms === 'Студия' ? 'студия' : `${a.rooms}-к`);
    if (a.area) parts.push(`${fmt(a.area)} м²`);
    if (a.floor != null) parts.push(a.floors ? `${a.floor}/${a.floors} эт.` : `${a.floor} эт.`);
  } else if (ad.section === 'jobs') {
    if (a.schedule) parts.push(a.schedule);
    if (a.experience) parts.push(a.experience.toLowerCase());
  } else {
    if (a.memory) parts.push(a.memory);
    if (a.size) parts.push(`размер ${a.size}`);
    if (a.condition) parts.push(a.condition === 'Новое' ? 'новое' : 'б/у');
  }
  return parts.join(' · ');
}

// Значение из поля ввода → то, что уходит на сервер (число или строка, пустое — undefined).
export function parseAttributeInput(field, raw) {
  const v = String(raw ?? '').trim();
  if (!v) return undefined;
  if (field.type !== 'number') return v.slice(0, 100);
  const n = Number(v.replace(',', '.').replace(/\s/g, ''));
  if (!Number.isFinite(n)) return undefined;
  return field.decimals ? Math.round(n * 10 ** field.decimals) / 10 ** field.decimals : Math.round(n);
}
