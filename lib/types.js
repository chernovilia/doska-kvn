/**
 * Единая схема данных проекта.
 * JSDoc-типы, ложатся 1:1 на будущие таблицы Postgres/Prisma.
 * См. /BUSINESS-MODEL.md для описания бизнес-логики.
 *
 * @typedef {'kulebaki' | 'vyksa' | 'navashino' | 'murom' | 'arzamas' | 'pavlovo' | 'sarov'} CityId
 * @typedef {'market' | 'services' | 'realty' | 'auto' | 'events'} SectionId
 * @typedef {'personal' | 'master' | 'shop'} UserType
 * @typedef {'user' | 'moderator' | 'content' | 'support' | 'admin' | 'owner'} UserRole
 * @typedef {'start' | 'top' | 'premium'} TierName
 * @typedef {'active' | 'grace' | 'expired' | 'cancelled'} SubscriptionStatus
 * @typedef {'bump' | 'urgent' | 'vip' | 'highlight' | 'auto_bump'} AdPromoType
 * @typedef {'pending' | 'approved' | 'rejected' | 'hidden' | 'expired'} AdStatus
 *
 * @typedef {Object} City
 * @property {CityId | 'all'} id
 * @property {string} name
 * @property {string} [short]
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
 * @property {string} [avatar]
 * @property {number} rating
 * @property {number} deals
 * @property {UserType} [type]
 * @property {boolean} [verified]
 *
 * @typedef {Object} Ad
 * @property {string} id
 * @property {SectionId} section
 * @property {string} [categoryGroup]
 * @property {string} [category]
 * @property {string} title
 * @property {number} price
 * @property {string} [priceSuffix]
 * @property {CityId} city
 * @property {string} address
 * @property {string} createdAt              ISO-8601
 * @property {string} [eventDate]            ISO-8601 для events
 * @property {string} image
 * @property {string[]} gallery
 * @property {boolean} verified
 * @property {boolean} [top]
 * @property {boolean} [urgent]
 * @property {boolean} [highlight]
 * @property {number} [promoLevel]           0..4
 * @property {UserType} [authorType]         Снапшот на момент публикации
 * @property {string} [avitoUrl]
 * @property {Author} author
 * @property {string} [phone]
 * @property {string} [description]
 * @property {number} [viewsCount]
 * @property {number} [writeClicksCount]
 * @property {number} [favoritesCount]
 *
 * @typedef {Object} Shop
 * @property {string} name
 * @property {string} description
 * @property {string[]} categories
 * @property {string} hours
 * @property {string} address
 *
 * @typedef {Object} User
 * @property {string} id
 * @property {string} [phone]
 * @property {string} [email]
 * @property {string} name
 * @property {string} avatar
 * @property {CityId} homeCityId
 * @property {string} cityName
 * @property {string} registeredAt
 * @property {UserType} type                 personal | master | shop
 * @property {UserRole} role
 * @property {boolean} verified
 * @property {boolean} [isPublic]            Тумблер публичности для personal
 * @property {boolean} [subscriptionExpired]
 * @property {number} rating
 * @property {number} reviewsCount
 * @property {number} dealsCount
 * @property {number} activeAdsCount
 * @property {BusinessProfile} [businessProfile]
 * @property {Wallet} [wallet]
 * @property {string} [bio]
 *
 * @typedef {Object} BusinessProfile
 * @property {string} slug                   Для URL /u/[slug]
 * @property {string} name
 * @property {string} description
 * @property {string} [logo]
 * @property {string[]} categories
 * @property {string} hours
 * @property {string} address
 * @property {string} [phone]
 * @property {string} [website]
 * @property {string} [vkGroupUrl]
 * @property {boolean} verified
 * @property {boolean} [legalVerified]
 * @property {TierName} [currentTierName]
 * @property {string} [currentTierExpiresAt]
 * @property {number} viewsCount
 *
 * @typedef {Object} Wallet
 * @property {number} balance                Звёзды
 *
 * @typedef {Object} Tier
 * @property {TierName} name
 * @property {string} displayName
 * @property {number} priceMonthly           В копейках
 * @property {number} priceYearly
 * @property {number} maxActiveAds
 * @property {number} autoPromoLevel
 * @property {boolean} hasAnalytics
 * @property {boolean} hasTopBadge
 * @property {boolean} hasPartnerBadge
 * @property {boolean} showAllRegionCities
 * @property {boolean} hasPrioritySupport
 * @property {UserType[]} availableForTypes
 *
 * @typedef {Object} Chat
 * @property {string} id
 * @property {string} peerName
 * @property {string} peerAvatar
 * @property {string} adTitle
 * @property {string} lastText
 * @property {string} lastAt
 * @property {number} unread
 * @property {boolean} mine
 *
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} chatId
 * @property {'me' | 'them'} from
 * @property {string} text
 * @property {string} at
 *
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} fromName
 * @property {string} fromCity
 * @property {number} rating
 * @property {string} text
 * @property {string} at
 * @property {string} adTitle
 *
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} title
 * @property {string} text
 * @property {string} at
 * @property {boolean} unread
 */
export {};
