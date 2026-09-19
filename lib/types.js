/**
 * Единая схема данных проекта.
 * Пока — JSDoc-типы, но структура уже 1:1 соответствует будущим таблицам Postgres/Prisma.
 * При переходе на бэкенд эти же поля станут колонками, ничего переименовывать не придётся.
 *
 * @typedef {'kulebaki' | 'vyksa' | 'navashino'} CityId
 * @typedef {'market' | 'services' | 'realty' | 'auto' | 'events'} SectionId
 * @typedef {'personal' | 'shop'} UserType
 *
 * @typedef {Object} City
 * @property {CityId | 'all'} id
 * @property {string} name
 * @property {string} short
 *
 * @typedef {Object} Section
 * @property {SectionId} id
 * @property {string} name
 * @property {string} emoji
 * @property {string} hint
 *
 * @typedef {Object} Author
 * @property {string} id
 * @property {string} name
 * @property {number} rating
 * @property {number} deals
 * @property {UserType} [type]
 *
 * @typedef {Object} Ad
 * @property {string} id                    UUID (мок использует стабильные строки).
 * @property {SectionId} section
 * @property {string} title
 * @property {number} price                 0 = бесплатно / не указана.
 * @property {string} [priceSuffix]         '₽/мес', '₽/час' и т.д.
 * @property {CityId} city
 * @property {string} address
 * @property {string} createdAt             ISO-8601. Основа для formatRelative.
 * @property {string} [eventDate]           ISO-8601. Только для section === 'events'.
 * @property {string} image                 Основное превью.
 * @property {string[]} gallery
 * @property {boolean} verified
 * @property {boolean} [top]
 * @property {boolean} [urgent]
 * @property {string} [avitoUrl]            Если объявление импортировано с Авито.
 * @property {Author} author
 * @property {string} [phone]
 * @property {string} [tg]
 * @property {string} [description]
 *
 * @typedef {Object} User
 * @property {string} id
 * @property {string} vkId
 * @property {string} name
 * @property {string} avatar
 * @property {CityId} city
 * @property {string} cityName
 * @property {string} registeredAt
 * @property {string} vkUrl
 * @property {string} [bio]
 * @property {string} [phone]
 * @property {UserType} type
 * @property {boolean} verified
 * @property {number} rating
 * @property {number} reviewsCount
 * @property {number} dealsCount
 * @property {number} activeAdsCount
 * @property {Shop} [shop]
 *
 * @typedef {Object} Shop
 * @property {string} name
 * @property {string} description
 * @property {string[]} categories
 * @property {string} hours
 * @property {string} address
 *
 * @typedef {Object} Chat
 * @property {string} id
 * @property {string} peerName
 * @property {string} peerAvatar
 * @property {string} adTitle
 * @property {string} lastText
 * @property {string} lastAt                ISO.
 * @property {number} unread
 * @property {boolean} mine                 true = продавец, false = покупатель.
 *
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} chatId
 * @property {'me' | 'them'} from
 * @property {string} text
 * @property {string} at                    ISO.
 *
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} fromName
 * @property {string} fromCity
 * @property {number} rating                1..5
 * @property {string} text
 * @property {string} at                    ISO.
 * @property {string} adTitle
 *
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} title
 * @property {string} text
 * @property {string} at                    ISO.
 * @property {boolean} unread
 */
export {};
