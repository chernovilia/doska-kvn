// Справочники марок, моделей, брендов и пород для полей с выбором из списка (type: 'combo').
// Порядок важен: сначала то, что чаще встречается в регионах России, дальше — по алфавиту.
// В объявлении хранится строка из списка; чего нет в списке — человек вписывает сам.

// ── Легковые: марка → модели ───────────────────────────────────────
export const CAR_MODELS = {
  'Lada (ВАЗ)': [
    'Granta', 'Vesta', 'Largus', 'Kalina', 'Priora', 'Niva Legend (4x4)', 'Niva Travel', 'XRAY', 'Aura', 'Iskra',
    '2101', '2102', '2103', '2104', '2105', '2106', '2107', '2108', '2109', '21099', '2110', '2111', '2112', '2113',
    '2114', '2115', '2121 Нива', '2131', '1111 Ока'
  ],
  Kia: ['Rio', 'Ceed', 'Cerato', 'Sportage', 'Sorento', 'Optima', 'K5', 'Soul', 'Picanto', 'Seltos', 'Spectra', 'Mohave', 'Carnival', 'Stinger', 'Venga', 'Magentis', 'Carens'],
  Hyundai: ['Solaris', 'Creta', 'Accent', 'Elantra', 'Tucson', 'Santa Fe', 'Sonata', 'Getz', 'i30', 'i40', 'ix35', 'Matrix', 'Starex', 'Palisade', 'Porter', 'Verna'],
  Renault: ['Logan', 'Sandero', 'Duster', 'Kaptur', 'Arkana', 'Megane', 'Fluence', 'Symbol', 'Scenic', 'Koleos', 'Clio', 'Laguna', 'Kangoo', 'Dokker'],
  Toyota: ['Camry', 'Corolla', 'RAV4', 'Land Cruiser', 'Land Cruiser Prado', 'Avensis', 'Yaris', 'Auris', 'Highlander', 'Hilux', 'Fortuner', 'Prius', 'Vitz', 'Mark II', 'Carina', 'Corona', 'Caldina', 'Alphard', 'C-HR', 'Venza'],
  Volkswagen: ['Polo', 'Jetta', 'Passat', 'Tiguan', 'Golf', 'Touareg', 'Taos', 'Caddy', 'Transporter', 'Multivan', 'Bora', 'Touran', 'Amarok', 'Teramont'],
  Nissan: ['Almera', 'Qashqai', 'X-Trail', 'Juke', 'Terrano', 'Note', 'Tiida', 'Teana', 'Murano', 'Primera', 'Patrol', 'Pathfinder', 'Micra', 'Sentra', 'Navara', 'Maxima'],
  Chevrolet: ['Niva', 'Cruze', 'Lacetti', 'Aveo', 'Lanos', 'Captiva', 'Cobalt', 'Spark', 'Orlando', 'Epica', 'Tahoe', 'Trailblazer', 'Rezzo'],
  Skoda: ['Octavia', 'Rapid', 'Fabia', 'Kodiaq', 'Karoq', 'Superb', 'Yeti', 'Roomster'],
  Ford: ['Focus', 'Fiesta', 'Mondeo', 'Kuga', 'Fusion', 'EcoSport', 'Explorer', 'C-Max', 'S-Max', 'Transit', 'Escape', 'Ranger', 'Galaxy'],
  Daewoo: ['Nexia', 'Matiz', 'Gentra', 'Lanos', 'Espero', 'Nubira', 'Leganza'],
  УАЗ: ['Patriot', 'Hunter', 'Буханка (2206, 3909)', 'Pickup', '469', '3151', 'Профи', '3303'],
  ГАЗ: ['3110 Волга', '31105 Волга', '3102 Волга', '2410 Волга', '21 Волга', 'Volga Siber', 'Соболь', 'ГАЗель'],
  Mitsubishi: ['Lancer', 'Outlander', 'ASX', 'Pajero', 'Pajero Sport', 'L200', 'Galant', 'Colt', 'Carisma', 'Eclipse Cross'],
  Opel: ['Astra', 'Corsa', 'Vectra', 'Zafira', 'Insignia', 'Mokka', 'Meriva', 'Antara', 'Omega'],
  Mazda: ['3', '6', 'CX-5', 'CX-7', 'CX-9', '2', '5', '323', '626', 'Demio', 'BT-50'],
  Chery: ['Tiggo 4', 'Tiggo 7 Pro', 'Tiggo 8', 'Tiggo 8 Pro', 'Tiggo (T11)', 'Arrizo 8', 'Amulet', 'Fora', 'Bonus', 'Very', 'Kimo', 'IndiS'],
  Haval: ['Jolion', 'F7', 'F7x', 'H6', 'H9', 'M6', 'Dargo', 'H5', 'H2'],
  Geely: ['Coolray', 'Atlas', 'Atlas Pro', 'Monjaro', 'Tugella', 'Emgrand', 'Emgrand X7', 'MK', 'MK Cross', 'Okavango'],
  Honda: ['Civic', 'Accord', 'CR-V', 'Fit', 'Jazz', 'HR-V', 'Pilot', 'Stepwgn', 'Freed'],
  BMW: ['1 серии', '2 серии', '3 серии', '4 серии', '5 серии', '6 серии', '7 серии', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7'],
  'Mercedes-Benz': ['A-класс', 'B-класс', 'C-класс', 'E-класс', 'S-класс', 'CLA', 'CLS', 'GLA', 'GLC', 'GLE', 'GLK', 'GLS', 'ML', 'G-класс', 'Vito', 'Viano', 'Sprinter'],
  Audi: ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', '80', '100', 'TT'],
  Lifan: ['Solano', 'X60', 'Smily', 'Breez', 'X50', 'Cebrium', 'Myway'],
  Datsun: ['on-DO', 'mi-DO'],
  Peugeot: ['206', '207', '208', '307', '308', '3008', '406', '407', '408', '4007', '4008', 'Partner', 'Boxer'],
  Citroen: ['C3', 'C4', 'C4 Picasso', 'C5', 'C-Elysee', 'C-Crosser', 'Berlingo', 'Xsara', 'Jumper'],
  Suzuki: ['Grand Vitara', 'Vitara', 'SX4', 'Swift', 'Jimny', 'Liana', 'Ignis'],
  Subaru: ['Forester', 'Outback', 'Impreza', 'Legacy', 'XV', 'Tribeca'],
  Lexus: ['RX', 'NX', 'LX', 'GX', 'ES', 'IS', 'GS', 'UX'],
  SsangYong: ['Kyron', 'Actyon', 'Rexton', 'Actyon Sports', 'Musso'],
  'Great Wall': ['Hover', 'Hover H3', 'Hover H5', 'Safe', 'Wingle', 'Poer'],
  Volvo: ['XC60', 'XC90', 'XC70', 'XC40', 'S40', 'S60', 'S80', 'V40', 'V50'],
  Москвич: ['3', '6', '2141', '412', '2140', '408'],
  ЗАЗ: ['Chance', 'Sens', '968 Запорожец', '1102 Таврия', '1103 Славута'],
  ИЖ: ['2126 Ода', '2717', '412', '2125 Комби'],
  ТагАЗ: ['Tager', 'Road Partner', 'C10', 'Vega'],
  Changan: ['CS35', 'CS35 Plus', 'CS55', 'CS55 Plus', 'CS75', 'CS75 Plus', 'UNI-K', 'UNI-T', 'UNI-V', 'Alsvin'],
  Exeed: ['LX', 'TXL', 'VX', 'RX'],
  Omoda: ['C5', 'S5'],
  Jaecoo: ['J7', 'J8'],
  JAC: ['J7', 'JS4', 'JS6', 'S3', 'S5', 'T6'],
  FAW: ['Bestune T77', 'Besturn X80', 'Besturn B50', 'V5', 'Vita'],
  Dongfeng: ['AX7', 'H30 Cross', 'S30', '580'],
  Jetour: ['Dashing', 'X70', 'X70 Plus', 'X90 Plus', 'T2'],
  Tank: ['300', '500'],
  'Li Auto': ['L6', 'L7', 'L8', 'L9'],
  Zeekr: ['001', '007', 'X'],
  'Land Rover': ['Freelander', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Defender'],
  Jeep: ['Grand Cherokee', 'Cherokee', 'Compass', 'Wrangler', 'Renegade'],
  Infiniti: ['FX', 'QX50', 'QX60', 'QX70', 'QX80', 'G', 'M', 'Q50', 'EX'],
  Porsche: ['Cayenne', 'Macan', 'Panamera', '911'],
  Fiat: ['Albea', 'Punto', 'Doblo', 'Ducato', 'Linea', 'Bravo'],
  Seat: ['Leon', 'Ibiza', 'Altea', 'Toledo'],
  Mini: ['Cooper', 'Countryman', 'Clubman'],
  Dodge: ['Caliber', 'Caravan', 'Journey', 'Ram'],
  Chrysler: ['PT Cruiser', 'Sebring', 'Voyager', '300C'],
  Cadillac: ['Escalade', 'SRX', 'CTS', 'XT5'],
  Acura: ['MDX', 'RDX', 'TLX'],
  Jaguar: ['XF', 'XE', 'F-Pace', 'XJ', 'E-Pace'],
  Daihatsu: ['Terios', 'Sirion', 'Mira'],
  Smart: ['Fortwo', 'Forfour'],
  Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X'],
  BYD: ['F3', 'Song Plus', 'Han', 'Tang'],
  Brilliance: ['V5', 'H530', 'M2'],
  Vortex: ['Tingo', 'Estina', 'Corda'],
  Ravon: ['Nexia R3', 'R2', 'R4', 'Gentra']
};
export const CAR_BRANDS = Object.keys(CAR_MODELS);

// ── Мото ───────────────────────────────────────────────────────────
export const MOTO_BRANDS = [
  'Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'ИЖ', 'Урал', 'Минск', 'Восход', 'Ява', 'Racer', 'Stels', 'Irbis', 'Regulmoto',
  'Motoland', 'Kayo', 'BSE', 'Avantis', 'Baltmotors', 'Lifan', 'Zongshen', 'CFMoto', 'Bajaj', 'BMW', 'KTM', 'Ducati',
  'Harley-Davidson', 'Triumph', 'Aprilia', 'Vespa', 'Sym', 'Kymco', 'Русская механика', 'BRP (Ski-Doo, Can-Am)', 'Polaris',
  'Arctic Cat', 'Буран', 'Тайга', 'Тула', 'Днепр', 'Муравей', 'Альфа', 'Wels', 'Vento'
];

// ── Коммерческий транспорт и спецтехника ───────────────────────────
export const COMMERCIAL_BRANDS = [
  'ГАЗ', 'КамАЗ', 'МАЗ', 'ЗИЛ', 'УАЗ', 'Урал', 'ПАЗ', 'КрАЗ', 'Lada (ВАЗ)', 'МТЗ (Беларус)', 'ЮМЗ', 'ДТ', 'Т-25', 'Т-40',
  'Ford', 'Mercedes-Benz', 'Volkswagen', 'Peugeot', 'Citroen', 'Fiat', 'Renault', 'Hyundai', 'Isuzu', 'Iveco', 'MAN',
  'Scania', 'Volvo', 'DAF', 'Hino', 'Mitsubishi Fuso', 'Foton', 'JAC', 'Sollers', 'Shacman', 'Sitrak', 'Howo', 'FAW',
  'Dongfeng', 'JCB', 'Caterpillar', 'Komatsu', 'Hitachi', 'Bobcat', 'XCMG', 'ЛиАЗ', 'НефАЗ', 'КАвЗ', 'Ростсельмаш'
];

// ── Шины ───────────────────────────────────────────────────────────
export const TIRE_BRANDS = [
  'Кама', 'Cordiant', 'Nokian', 'Ikon Tyres', 'Viatti', 'Белшина', 'Matador', 'Tunga', 'Amtel', 'Алтайшина', 'Nordman',
  'Michelin', 'Continental', 'Bridgestone', 'Pirelli', 'Goodyear', 'Yokohama', 'Hankook', 'Kumho', 'Dunlop', 'Toyo',
  'Nexen', 'Gislaved', 'Formula', 'BFGoodrich', 'Tigar', 'Sava', 'Kormoran', 'Triangle', 'Sailun', 'LingLong', 'Roadstone',
  'Maxxis', 'Nitto', 'Marshal', 'Laufenn', 'Westlake', 'Goodride', 'Falken', 'General Tire', 'Firestone'
];
export const TIRE_WIDTHS = ['135', '145', '155', '165', '175', '185', '195', '205', '215', '225', '235', '245', '255', '265', '275', '285', '295', '305', '315'];
export const TIRE_PROFILES = ['30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80', '85'];

// ── Телефоны: бренд → модели (популярные линейки) ──────────────────
export const PHONE_MODELS = {
  Apple: [
    'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16', 'iPhone 16e', 'iPhone 15 Pro Max', 'iPhone 15 Pro',
    'iPhone 15 Plus', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14', 'iPhone 13 Pro Max',
    'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 mini', 'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 mini',
    'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11', 'iPhone XS Max', 'iPhone XS', 'iPhone XR', 'iPhone X',
    'iPhone SE (2022)', 'iPhone SE (2020)', 'iPhone 8 Plus', 'iPhone 8', 'iPhone 7 Plus', 'iPhone 7', 'iPhone 6s', 'iPhone 6'
  ],
  Samsung: [
    'Galaxy S25 Ultra', 'Galaxy S25', 'Galaxy S24 Ultra', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23', 'Galaxy S22',
    'Galaxy S21', 'Galaxy S20', 'Galaxy S10', 'Galaxy A55', 'Galaxy A54', 'Galaxy A53', 'Galaxy A52', 'Galaxy A51',
    'Galaxy A35', 'Galaxy A34', 'Galaxy A33', 'Galaxy A32', 'Galaxy A25', 'Galaxy A24', 'Galaxy A23', 'Galaxy A15',
    'Galaxy A14', 'Galaxy A13', 'Galaxy A12', 'Galaxy A05', 'Galaxy A04', 'Galaxy A03', 'Galaxy M-серии', 'Galaxy Note 20',
    'Galaxy Note 10', 'Galaxy Z Flip', 'Galaxy Z Fold', 'Galaxy J-серии'
  ],
  Xiaomi: [
    'Redmi Note 14', 'Redmi Note 13', 'Redmi Note 12', 'Redmi Note 11', 'Redmi Note 10', 'Redmi Note 9', 'Redmi Note 8',
    'Redmi 14C', 'Redmi 13C', 'Redmi 12', 'Redmi 12C', 'Redmi 10', 'Redmi 9', 'Redmi A3', 'Redmi A2', 'Xiaomi 14',
    'Xiaomi 13', 'Xiaomi 13T', 'Xiaomi 12', 'Xiaomi 12T', 'Xiaomi 11T', 'Mi 11 Lite', 'Mi 10', 'Mi 9'
  ],
  POCO: ['X7 Pro', 'X6 Pro', 'X6', 'X5 Pro', 'X5', 'X4 Pro', 'X3 Pro', 'X3 NFC', 'F6', 'F5', 'F4', 'F3', 'M6 Pro', 'M5', 'M4 Pro', 'M3', 'C65', 'C40'],
  Honor: ['200', '90', '70', '50', 'X9b', 'X9a', 'X8b', 'X8a', 'X8', 'X7b', 'X7a', 'X6', 'X5', 'Magic 6', 'Magic 5', '10', '10 Lite', '9X', '8X', '8A'],
  Huawei: ['P60', 'P50', 'P40', 'P40 Lite', 'P30', 'P30 Lite', 'P20', 'Nova 12', 'Nova 11', 'Nova 10', 'Nova 9', 'Mate 60', 'Mate 50', 'Pura 70', 'Y-серии'],
  Realme: ['12 Pro', '12', '11 Pro', '11', '10', '9 Pro', '9', '8', 'C67', 'C55', 'C53', 'C51', 'C35', 'C33', 'C30', 'C25', 'GT Neo', 'Note 50'],
  Tecno: ['Spark 30', 'Spark 20', 'Spark 10', 'Spark Go', 'Camon 30', 'Camon 20', 'Pova 6', 'Pova 5', 'Pova Neo', 'Pop 8', 'Pop 7'],
  Infinix: ['Hot 50', 'Hot 40', 'Hot 30', 'Note 40', 'Note 30', 'Smart 8', 'Smart 7', 'Zero 30', 'GT 20'],
  Vivo: ['Y-серии', 'V-серии', 'X-серии', 'T-серии'],
  OPPO: ['A-серии', 'Reno', 'Find X'],
  OnePlus: ['12', '11', '10 Pro', '9', '8', 'Nord'],
  'Google Pixel': ['9', '8', '7', '6', '5', '4a'],
  Nokia: ['Смартфон', '3310', '105', '106', '110', '150', '8210', '2660 Flip'],
  itel: ['Смартфон', 'Кнопочный'],
  Philips: ['Xenium (кнопочный)', 'Смартфон'],
  BQ: ['Смартфон', 'Кнопочный'],
  Texet: ['Кнопочный', 'Защищённый'],
  ZTE: ['Blade', 'Nubia'],
  Sony: ['Xperia 1', 'Xperia 5', 'Xperia 10'],
  Motorola: ['Moto G', 'Edge', 'Razr'],
  LG: ['G-серии', 'K-серии', 'Q-серии'],
  Meizu: ['Note', 'M-серии'],
  Asus: ['ROG Phone', 'Zenfone'],
  Nothing: ['Phone (1)', 'Phone (2)', 'Phone (2a)'],
  Doogee: ['Защищённый'],
  Blackview: ['Защищённый']
};
export const PHONE_BRANDS = Object.keys(PHONE_MODELS);

// ── Компьютеры, ТВ и аудио, приставки, бытовая техника ─────────────
export const COMPUTER_BRANDS = [
  'Lenovo', 'HP', 'Asus', 'Acer', 'Apple', 'MSI', 'Dell', 'Huawei', 'Honor', 'Samsung', 'Xiaomi', 'Digma', 'Irbis', 'DEXP',
  'Tecno', 'Infinix', 'Gigabyte', 'Microsoft', 'Realme', 'Chuwi', 'Machenike', 'Thunderobot', 'LG', 'AOC', 'BenQ',
  'Philips', 'ViewSonic', 'Intel', 'AMD', 'Nvidia', 'Kingston', 'Logitech', 'A4Tech', 'Canon', 'Epson', 'Brother',
  'TP-Link', 'Keenetic', 'Собранный на заказ'
];

export const AV_BRANDS = [
  'Samsung', 'LG', 'Xiaomi', 'Haier', 'Hisense', 'TCL', 'Sony', 'Philips', 'BBK', 'DEXP', 'Hi', 'Hyundai', 'Yandex',
  'Sber', 'Artel', 'Витязь', 'Polar', 'Harper', 'Supra', 'Telefunken', 'Panasonic', 'Toshiba', 'JBL', 'Marshall', 'Apple',
  'Sennheiser', 'Bose', 'Sven', 'Defender', 'Edifier', 'Pioneer', 'Yamaha', 'Canon', 'Nikon', 'Fujifilm', 'GoPro', 'DJI',
  'Olympus', 'Зенит'
];

export const CONSOLE_BRANDS = [
  'Sony PlayStation 5', 'Sony PlayStation 4', 'Sony PlayStation 3', 'Sony PSP / PS Vita', 'Xbox Series X|S', 'Xbox One',
  'Xbox 360', 'Nintendo Switch', 'Nintendo (другие)', 'Steam Deck', 'Dendy', 'Sega', 'ПК'
];

export const APPLIANCE_BRANDS = [
  'Indesit', 'Атлант', 'Бирюса', 'Samsung', 'LG', 'Bosch', 'Haier', 'Beko', 'Candy', 'Hotpoint-Ariston', 'Electrolux',
  'Gorenje', 'Zanussi', 'Whirlpool', 'Stinol', 'Саратов', 'Pozis', 'Nord', 'Hansa', 'Midea', 'Hisense', 'DEXP', 'Hi',
  'Weissgauff', 'Maunfeld', 'Gefest', 'Darina', 'Лысьва', 'Мечта', 'Redmond', 'Polaris', 'Vitek', 'Scarlett', 'Tefal',
  'Philips', 'Braun', 'Kitfort', 'Moulinex', 'Xiaomi', 'Dyson', 'Thomas', 'Karcher', 'Ballu', 'Zanussi', 'Timberk',
  'Roda', 'Daikin', 'Mitsubishi Electric', 'Thermex', 'Ariston', 'Вятка', 'Малютка', 'Siemens', 'Miele', 'AEG'
].filter((b, i, a) => a.indexOf(b) === i);

// ── Породы ─────────────────────────────────────────────────────────
export const CAT_BREEDS = [
  'Беспородная', 'Метис', 'Британская', 'Шотландская (вислоухая и прямоухая)', 'Мейн-кун', 'Сибирская', 'Сфинкс',
  'Бенгальская', 'Персидская', 'Сиамская', 'Русская голубая', 'Абиссинская', 'Невская маскарадная', 'Ориентальная',
  'Курильский бобтейл', 'Экзотическая', 'Рэгдолл', 'Бурманская', 'Девон-рекс', 'Корниш-рекс', 'Норвежская лесная',
  'Тайская', 'Манчкин', 'Турецкая ангора'
];
export const DOG_BREEDS = [
  'Беспородная', 'Метис', 'Немецкая овчарка', 'Лабрадор', 'Хаски', 'Шпиц', 'Йоркширский терьер', 'Чихуахуа',
  'Джек-рассел-терьер', 'Той-терьер', 'Такса', 'Алабай (среднеазиатская овчарка)', 'Кавказская овчарка',
  'Восточноевропейская овчарка', 'Лайка', 'Русская гончая', 'Русский спаниель', 'Кокер-спаниель', 'Корги', 'Мопс',
  'Французский бульдог', 'Английский бульдог', 'Пекинес', 'Ши-тцу', 'Мальтийская болонка', 'Пудель', 'Бигль',
  'Ротвейлер', 'Доберман', 'Стаффордширский терьер', 'Питбуль', 'Бультерьер', 'Кане-корсо', 'Боксёр', 'Золотистый ретривер',
  'Маламут', 'Самоед', 'Акита-ину', 'Сиба-ину', 'Бордер-колли', 'Шарпей', 'Чау-чау', 'Далматин', 'Дог', 'Сенбернар',
  'Курцхаар', 'Дратхаар', 'Ягдтерьер', 'Фокстерьер', 'Цвергшнауцер', 'Бельгийская овчарка (малинуа)'
];

// ── Как ещё называют бренд: чтобы «лада», «киа», «айфон» находили нужную строку ──
export const BRAND_ALIASES = {
  'Lada (ВАЗ)': 'лада ваз жигули vaz автоваз',
  Kia: 'киа',
  Hyundai: 'хендай хундай хёндэ хендэ',
  Renault: 'рено',
  Toyota: 'тойота',
  Volkswagen: 'фольксваген vw вольксваген',
  Nissan: 'ниссан',
  Chevrolet: 'шевроле шеви',
  Skoda: 'шкода',
  Ford: 'форд',
  Daewoo: 'дэу деу',
  УАЗ: 'uaz',
  ГАЗ: 'gaz волга газель',
  Mitsubishi: 'мицубиси митсубиси',
  Opel: 'опель',
  Mazda: 'мазда',
  Chery: 'чери',
  Haval: 'хавал хавейл',
  Geely: 'джили',
  Honda: 'хонда',
  BMW: 'бмв',
  'Mercedes-Benz': 'мерседес бенц мерс',
  Audi: 'ауди',
  Lifan: 'лифан',
  Datsun: 'датсун',
  Peugeot: 'пежо',
  Citroen: 'ситроен',
  Suzuki: 'сузуки',
  Subaru: 'субару',
  Lexus: 'лексус',
  SsangYong: 'санг йонг саньенг',
  'Great Wall': 'грейт вол ховер',
  Volvo: 'вольво',
  Москвич: 'moskvich азлк',
  Changan: 'чанган',
  Exeed: 'эксид',
  Omoda: 'омода',
  Jetour: 'джетур',
  Tank: 'танк',
  'Land Rover': 'ленд ровер рендж',
  Jeep: 'джип',
  Infiniti: 'инфинити',
  Porsche: 'порше',
  Fiat: 'фиат',
  Tesla: 'тесла',
  КамАЗ: 'kamaz',
  'МТЗ (Беларус)': 'трактор беларусь mtz',
  Yamaha: 'ямаха',
  Kawasaki: 'кавасаки',
  Apple: 'эпл айфон iphone макбук айпад',
  Samsung: 'самсунг',
  Xiaomi: 'сяоми ксиаоми редми',
  POCO: 'поко',
  Honor: 'хонор',
  Huawei: 'хуавей',
  Realme: 'реалми',
  Tecno: 'текно',
  Infinix: 'инфиникс',
  Nokia: 'нокиа',
  Lenovo: 'леново',
  Asus: 'асус',
  Acer: 'асер эйсер',
  Sony: 'сони',
  LG: 'лджи элджи',
  Bosch: 'бош',
  Indesit: 'индезит',
  Атлант: 'atlant',
  Haier: 'хайер',
  Philips: 'филипс',
  Кама: 'kama',
  Nokian: 'нокиан',
  Michelin: 'мишлен',
  Bridgestone: 'бриджстоун',
  Yokohama: 'йокогама',
  'Sony PlayStation 5': 'ps5 плейстейшн сони',
  'Sony PlayStation 4': 'ps4 плейстейшн сони',
  'Sony PlayStation 3': 'ps3 плейстейшн сони',
  'Xbox Series X|S': 'иксбокс',
  'Xbox One': 'иксбокс',
  'Xbox 360': 'иксбокс',
  'Nintendo Switch': 'нинтендо свитч'
};

// Поиск по списку: по самой строке и по тому, как её ещё называют.
export function searchOptions(options, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return options;
  const starts = [];
  const contains = [];
  for (const o of options) {
    const name = o.toLowerCase();
    const alias = BRAND_ALIASES[o] || '';
    if (name.startsWith(q) || alias.split(' ').some((a) => a.startsWith(q))) starts.push(o);
    else if (name.includes(q) || alias.includes(q)) contains.push(o);
  }
  return [...starts, ...contains];
}

// Введённое руками приводим к строке из списка, если это она же («kia» → «Kia», «лада» → «Lada (ВАЗ)»).
export function canonicalOption(options, raw) {
  const q = String(raw || '').trim().toLowerCase();
  if (!q) return '';
  const exact = options.find((o) => o.toLowerCase() === q);
  if (exact) return exact;
  // По другому названию — только если оно однозначно («иксбокс» подходит трём приставкам)
  const byAlias = options.filter((o) => (BRAND_ALIASES[o] || '').split(' ').includes(q));
  return byAlias.length === 1 ? byAlias[0] : String(raw).trim();
}
