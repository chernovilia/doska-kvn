# Архитектура Доска/КВН

Canonical-документ. Правила игры для всех текущих и будущих коммитов.
Текущее состояние проекта (что уже работает / что моки) — в [STATE.md](STATE.md).

---

## 📝 Расхождения с реальностью — 2026-09-26

Часть решений в исходной архитектуре была пересмотрена. Живая реализация:

| Раздел | В документе | В коде |
|---|---|---|
| Авторизация | SMS-код (SMSC.ru) + Yandex ID OAuth | Email-код через Unisender Go (Yandex ID убран, SMS — этап позже) |
| Медиа flow | Presigned PUT + Sharp-воркер в BullMQ | Синхронный upload через API `POST /uploads/ad-photo`, sharp в процессе запроса |
| Размеры фото | 3 варианта (thumb / card / full) | Один WebP до 1600 px (q80). Ресайз добавим когда упрёмся в трафик |
| Redis + BullMQ | Часть MVP | Не подключены. Rate-limit пока in-memory через `@nestjs/throttler` |
| Роли модератора | Отдельная таблица `AdminUser` | Поле `User.role` (enum). Доступ через `ADMIN_EMAILS` env или `role='admin'` |
| Модерация | Ручная по умолчанию | Автопубликация по умолчанию, флаг `Setting['moderation.autoApprove']` из админки |

Всё остальное (стек, домены, БД, Prisma-схема, ранкинг) — актуально.

---

## Стек

### Фронтенд
- **Next.js 14** (App Router)
- **Tailwind CSS**, **Framer Motion**, **Lucide React**
- Хостится на **Amvera** как отдельное приложение (Node.js 20)
- Домены: `доска-квн.рф` (сейчас) + `доска-муром.рф`, `доска-арзамас.рф`, … (301 на основной)

### Бэкенд
- **NestJS + TypeScript**
- **Prisma ORM**
- Хостится на **Amvera** как отдельное приложение (Node.js 20)
- Поддомен: `api.доска-квн.рф`

### БД
- **PostgreSQL 16** — Managed Amvera
- Один инстанс, один шардинг (позже — по regionId, если разрастётся)

### Кеш и очереди
- **Redis** — Managed Amvera (со 2-го месяца)
  - Rate limiting
  - SMS-коды (TTL 5 минут)
  - Refresh-token blacklist на logout
  - BullMQ для фоновых задач (модерация, ресайз фото)

### Медиа — Timeweb S3

- **Bucket**: `doska-kvn-media` (~2 ₽/ГБ/мес)
- **CDN**: `media.доска-квн.рф` → CNAME на Timeweb S3
- **Стоимость**: на 1000 юзеров ~1 ГБ/мес прирост, ~15-20 ₽/мес

**Flow загрузки**:
1. Фронт → `POST /v1/uploads/presign` → API валидирует (auth, MIME whitelist, размер, rate limit)
2. API возвращает **presigned PUT URL** (5 мин TTL)
3. Фронт грузит **напрямую в S3**, не через API — нагрузки на бэк нет
4. Фронт → `POST /v1/uploads/confirm` с URL
5. API создаёт `AdPhoto` со статусом `pending`, ставит задачу в BullMQ
6. Воркер (Sharp) скачивает оригинал → делает 3 WebP размера → заливает обратно → обновляет URL в БД
7. Через 30 дней оригинал удаляется (юр-архив через бэкапы)

**Размеры**:
- `thumb` 300×300 (~15 КБ) — для sidebar-превью
- `card` 800×600 (~80 КБ) — для карточек в ленте
- `full` 1600×1200 (~250 КБ) — для модалки и страницы объявления

**Формат**: WebP (−35% веса vs JPEG). AVIF через Cloudflare Image Resizing позже.

**Пути в S3**:
```
doska-kvn-media/
├── ads/{adId}/photos/{photoId}/{thumb|card|full}.webp
├── users/{userId}/{avatar|business-logo}.webp
├── banners/{bannerId}.webp
└── temp/{uuid}.jpg    (presigned uploads, TTL 1ч)
```

**Безопасность**:
- MIME-whitelist: `image/jpeg | image/png | image/webp`
- Max размер: 10 МБ на фото
- Rate limit: 50 фото/день на юзера через Redis
- Sharp валидирует байты (защита от переименованных .php)
- Hotlink protection на CDN — только с наших доменов

### Внешние сервисы
- **SMSC.ru** — SMS-коды (~3 ₽/SMS)
- **Yandex SMTP** — e-mail magic-link (бесплатно)
- **Yandex ID OAuth** — второй способ входа (после одобрения)
- **GigaChat** — LLM-модерация (после этапа 5, ~200 ₽/мес)
- **ЮKassa** — платежи (после этапа 5)

### Мониторинг
- **Яндекс.Метрика** — трафик, воронки, цели
- **Sentry** — ошибки фронт + бэк (бесплатный тариф)
- **UptimeRobot** — пинг главной + api (бесплатно)

### Инфраструктура
- **Cloudflare** — DNS, CDN, DDoS-защита (бесплатно)
- **Let's Encrypt** — HTTPS через Amvera

**Итого инфры на MVP-старте**: ~2 500 ₽/мес. С запасом до 5 000 DAU.

---

## Домены и URL (актуальное состояние)

```
доска-квн.рф                    → фронт (Amvera, живой) ✅
api.доска-квн.рф                → API (Amvera, живой) ✅
xn----7sbhf4acwc1a.xn--p1ai     → Punycode того же домена (в конфигах)
admin.доска-квн.рф              → админка (позже — этап 3.5)
доска-муром.рф → 301 → /murom   → региональный маркетинг-вход (не куплены)
```

### Прямые Amvera-URL (fallback)

```
Фронт: https://doska-kvn-chernovilia.amvera.io
API:   https://doska-kvn-api-chernovilia.amvera.io/v1
БД:    amvera-chernovilia-cnpg-doska-kvn-db-rw (только внутренний доступ)
```

### Cloudflare

- **NS**: `leif.ns.cloudflare.com`, `paige.ns.cloudflare.com`
- **Proxy** 🟠 включён на `доска-квн.рф` и `api.доска-квн.рф`
- **SSL/TLS mode**: Full
- **Cache Rule**: `*/_next/static/*` → Edge TTL 1 year, ignore cache-control

### URL-структура фронта
```
/                               главная (регион по умолчанию — KVN)
/[place]                        регион или город: kulebaki, vyksa, kvn, murom, ...
/ad/[id]                        публичная страница объявления
/u/[userId]                     публичный профиль пользователя/магазина
/login                          вход
/messages                       мессенджер (auth)
/messages?chat=[id]             активный чат
/profile                        кабинет (auth)
/post                           форма подачи (auth, позже — переезжает из модалки)
/terms, /privacy, /help         статические страницы
/pwa-install                    инструкция установки PWA
/admin/**                       админка (роли: owner/admin/moderator/content/support)
```

---

## Слой данных (backend contract)

Prisma-схема ложится **1:1 на текущий `lib/types.js`** — фронт не переписываем.

### Основные таблицы

```
Region       (id, name, shortName, domain, launched, neighbors[])
City         (id, name, regionId, population, lat, lon)

User         (id, phone, email, name, avatar, homeCityId, type, verified,
              createdAt, lastSeenAt, blockedAt, blockReason)
Shop         (userId, name, description, categories[], hours, address, verified)
TrustedDevice (userId, deviceId, userAgent, firstUsedAt, lastUsedAt, ip)

Category     (id, sectionId, groupName, name)  ← из data/categories.js
Ad           (id, sectionId, categoryId, cityId, regionId, authorId,
              title, price, priceSuffix, description, phone, avitoUrl,
              status, moderationLevel, moderationNotes, moderatedById,
              top, urgent, verified, createdAt, publishedAt, expiresAt,
              viewsCount, favoritesCount, reportsCount)
AdPhoto      (id, adId, url, order, phash)

Chat         (id, adId, buyerId, sellerId, createdAt, lastMessageAt)
Message      (id, chatId, fromUserId, text, at, readAt)

Review       (id, targetUserId, fromUserId, adId, rating, text, at, hiddenAt)
Report       (id, targetKind, targetId, fromUserId, reason, comment, at,
              status, resolvedById, resolvedAt)
Favorite     (userId, adId, at)

AdView       (userId, adId, at, source)              — для рекомендаций
AnalyticsEvent (userId?, name, props, at)            — универсальный event

AdminUser    (userId, role, createdAt)               — доступ в /admin
AdminAction  (adminId, action, targetKind, targetId, notes, at)   — audit log

Setting      (key, value, updatedAt, updatedById)    — feature-flags и лимиты
Slide        (id, order, eyebrow, title, body, ctaLabel, ctaKind, ctaHref,
              accent, emoji, enabled, startsAt, endsAt)
```

### Индексы (обязательные)

```
Ad:   (regionId, sectionId, status, createdAt DESC)
Ad:   (cityId, sectionId, status, createdAt DESC)
Ad:   tsvector(title || description) GIN
Ad:   (authorId, status, createdAt DESC)
Ad:   (status, createdAt) — для очереди модерации

Chat: (buyerId), (sellerId), (adId)
Message: (chatId, at)

AnalyticsEvent: (userId, at), (name, at)
```

### Feature flags через таблицу Setting

Экземпляр таблицы `Setting`:

```
KEY                           VALUE     ЧТО ДЕЛАЕТ
ads.rateLimit.perDay          5         сколько объявлений в день на юзера
ads.rateLimit.perHour         1         ...в час
ads.autoApprove               true      без модерации, если прошёл базовые фильтры
moderation.llm.enabled        false     подключён ли GigaChat
moderation.llm.provider       gigachat  gigachat | yandexgpt
messages.rateLimit.perMinute  30        антиспам в чатах
auth.sms.enabled              true      можно ли входить через SMS
auth.email.enabled            true      можно ли через e-mail
auth.yandex.enabled           false     Yandex ID (после одобрения)
payments.enabled              false     тарифы и разовые опции
signup.opened                 true      можно ли новым регаться
seed.demoAdsCount             0         показывать ли демо-объявления
```

Изменяется через админку без деплоя. Читается при бутстрапе + hot-reload раз в минуту.

---

## Авторизация

### Регистрация / вход
1. Пользователь вводит номер телефона на `/login`
2. `POST /auth/phone/request` → бэк генерит 4-значный код → сохраняет в Redis (TTL 5 мин) → отправляет через SMSC
3. Пользователь вводит код → `POST /auth/phone/verify {phone, code}`
4. Бэк выдаёт:
   - **Access token** — JWT, 15 минут, `httpOnly` cookie
   - **Refresh token** — random 32-byte string, 90 дней, `httpOnly` cookie
   - **Device id** — UUID, вечная кука, метка Trusted Device

### Продление сессии
- Клиент шлёт `POST /auth/refresh` за 1 минуту до истечения access (или сразу при 401)
- Бэк проверяет refresh → выдаёт новую пару access + refresh
- Refresh **ротируется** — каждый refresh одноразовый (защита от угона)

### Выход
- `POST /auth/logout` → удаляем refresh из БД → отправляем `Set-Cookie: ; Max-Age=0` → чистим Redis-кеш сессии

### Trusted Device
- При первом входе кладём `device_id` в вечную куку и в таблицу `TrustedDevice`
- Через 90 дней, когда refresh истёк, но `device_id` жив — авторизуем **без SMS**, только проверяем phone match
- Смена телефона / новый браузер → снова SMS

### Роли и права
- `guest` — не залогинен
- `user` — обычный
- `shop` — магазинный аккаунт
- `moderator` — доступ к /admin/moderation, /admin/reports
- `content` — /admin/slides, /admin/content, /admin/afisha
- `support` — /admin/users (read-only), /admin/chats
- `admin` — всё выше + /admin/settings, /admin/users (write)
- `owner` — админ + удаление аккаунтов, экспорт БД, глобальные настройки

Право проверяется в NestJS-guard через таблицу `AdminUser.role`. Не в JWT (чтобы можно было отозвать без перевыпуска токена).

---

## Модерация

### Слои (в порядке применения)

1. **Rate limit** — 5 объявлений/день, 1 час — блок публикации
2. **Blacklist слов** — ~200 запрещённых (крипта, эскорт, оружие, ссылки на конкурентов)
3. **pHash duplicate photos** — если фото 1-в-1 повторяет чужое → в ручную
4. **Levenshtein по заголовку** — >85% совпадение с уже опубликованным → в ручную
5. **LLM (опционально)** — GigaChat через feature flag `moderation.llm.enabled`

### Статусы объявления
```
pending      только что подано, ждёт модерации
approved     опубликовано, видно в ленте
rejected     отклонено, показываем автору причину
hidden       скрыто (по жалобе или админом)
expired      истёк срок (90 дней)
```

### Очередь ручной модерации
- Что попадает: `pending` со статусом-триггером от одного из слоёв + все жалобы `Report`
- Кто видит: `moderator`, `admin`, `owner`
- Действия: **Одобрить** / **Отклонить с причиной** / **Заблокировать автора**

### Каждое действие пишется в AdminAction (audit log)

---

## PWA

- `manifest.json` в `/public/`
- Service Worker — минимальный, кеш статики
- Иконки 192×192, 512×512, maskable
- iOS-теги через `<meta apple-*>`
- Компонент `<InstallPWABanner>` — умный, определяет платформу
- Компонент `<OpenInBrowserModal>` — для VK-браузера
- Аналитика PWA:
  - `pwa_prompted`, `pwa_installed`, `pwa_dismissed`, `pwa_open` (standalone)
  - Поле `User.pwaFirstOpenAt`

---

## Аналитика (события в бэк)

Универсальная таблица `AnalyticsEvent` под всё:

```
ad_view           смотрел карточку
ad_open           открыл модалку/страницу
ad_favorite       добавил в избранное
ad_phone_reveal   показал телефон
ad_write_click    нажал «Написать»
ad_publish_start  открыл форму
ad_publish_done   опубликовал
ad_report         пожаловался
search_query      сделал поиск
place_change      сменил город/регион
signup_start      начал регистрацию
signup_done       вошёл
message_send      отправил сообщение
pwa_prompted, pwa_installed, pwa_open, ...
```

Из этого потом строится любая воронка. Ретеншн, MAU/DAU, время до первой сделки.

---

## Правовое и compliance

- **Пользовательское соглашение** `/terms`
- **Политика конфиденциальности** `/privacy` (152-ФЗ)
- **Реквизиты владельца** в футере (ФИО самозанятого + ИНН)
- **Все данные в РФ** — Amvera (Yandex Cloud), Timeweb S3, SMSC, Yandex SMTP
- **Согласие на обработку** — галочка при регистрации, чекбокс сохраняем в БД
- **Логирование действий** — AdminAction + AnalyticsEvent + БД-триггеры на изменения

---

## Что оставляем на потом (осознанно)

- WebSocket мессенджер — сначала polling каждые 10 сек
- Микросервисы — монолит-API до 50k DAU
- Kubernetes — Docker + Amvera хватит
- Elasticsearch — Postgres FTS до 100k объявлений
- ML-рекомендации — content-based по city/section/price первые полгода
- Native-приложение — PWA + VK Mini App
- Многоязычность — только русский
- Пуш через APNs — Web Push + VK-бот-нотификации первые полгода
