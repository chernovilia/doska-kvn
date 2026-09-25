# Состояние проекта — 2026-09-26

Живой снимок: что уже работает в проде, что моки, что впереди. Обновляется по мере роста.

---

## ✅ Что работает в проде

### Инфраструктура
- **Фронт**: Next.js 14 (App Router) на Amvera, домен `доска-квн.рф` (Cloudflare)
- **Бэк**: NestJS 10 + Prisma 5 на Amvera, поддомен `api.доска-квн.рф`
- **БД**: PostgreSQL 17 (Amvera CNPG, внутренний host `amvera-chernovilia-cnpg-doska-kvn-db-rw`)
- **Медиа**: Timeweb S3 (`doska-kvn-main`, 10 GB с автоапгрейдом, path-style, ACL public-read)
- **Почта**: Unisender Go (транзакционный API, `noreply@доска-квн.рф`, DKIM/SPF/DMARC настроены)

### Авторизация
- Email + 6-значный код (`POST /v1/auth/email/request` → `/verify`)
- Rate-limit: `EMAIL_CODE_INTERVAL_SEC=60`, максимум `EMAIL_CODE_MAX_ATTEMPTS=5`
- JWT: access 15 мин + refresh 90 дней в httpOnly cookies (`Domain=.xn----7sbhf4acwc1a.xn--p1ai`)
- Ротация refresh при каждом `/auth/refresh`, blacklist через `RefreshToken.revokedAt`
- Клиент: `AuthProvider` в `app/layout.jsx` — один контекст для всех потребителей
- SessionStorage-кеш `doska-kvn:me` — только для UX (нет flash «не залогинен»)

### Онбординг
- Блокирующая модалка `<AuthOnboardingGate>` — если `me.onboardedAt === null`
- Одна страница, поля: имя, о себе (опц.), домашний город из КВН, способ связи (chat/phone), уведомления на email
- Submit → `PATCH /v1/me` с `markOnboarded: true, agreeTerms: true`

### Профиль (`/profile`)
- Аватарка (буква имени или загруженное фото)
- Метрики: рейтинг, отзывы, сделки, активные объявления
- Тип аккаунта: пока только «Личный», рядом иконка ✎ disabled (бизнес — потом)
- Вкладки: **Объявления**, **Отзывы** (пусто, заглушка), **Настройки**
- Настройки: `SettingsEditModal` для 4 kind-ов (personal, phone, city, notifications), каждый → `PATCH /me`

### Объявления
- `GET /v1/ads` с фильтрами (place, section, chip, search) + ранкинг (score или recent)
- `GET /v1/ads/:id` с автором + фото
- `POST /v1/ads` — создание с фото (`photoUrls[]`), автопубликация по `Setting['moderation.autoApprove']`
- `DELETE /v1/ads/:id` — владелец удаляет своё (проверка `authorId`)
- `GET /v1/me/ads` — все свои (approved / pending / rejected / archived)
- Публичная страница `/ad/[id]` с Open Graph
- `PostAdModal`: 6 шагов (город → раздел → категория → описание → фото → превью), финиш → редирект на `/ad/[id]`

### Фото
- `POST /v1/uploads/ad-photo` — multipart, sharp: авто-EXIF, resize до 1600px, WebP q80
- До 6 фото на объявление, до 12 MB на исходник
- Хранятся в `ads/YYYY/MM/<uuid>.webp`, ссылка вставляется в `AdPhoto`

### Админка (`/admin`)
- Доступ: `AdminGuard` — email в `ADMIN_EMAILS` env или `role='admin'|'owner'`
- Вкладка **Обзор**: счётчики (юзеры, объявления, фото, кошельки, токены, платежи…) + красная кнопка «Стереть всё»
- Вкладка **Пользователи**: пагинация, удаление с cascade
- Вкладка **Объявления**: фильтр по статусу (все/pending/approved/rejected/archived), автор в строке, ✓ Одобрить / ✕ Отклонить / удалить
- Вкладка **Настройки**: тумблер автомодерации (`Setting['moderation.autoApprove']`)

---

## 🟡 Заглушки / не реализовано

| Место | Что показывается | Что нужно |
|---|---|---|
| `/messages` | Пустой список чатов | Модель `Message`, endpoints, UI |
| `/profile` → Отзывы | Пустой список | Модель `Review`, endpoints |
| Bell в шапке | Клик ничего не делает | Модель `Notification`, endpoints |
| `/u/[slug]` | 404 (мок вернул null) | `GET /v1/users/:slug`, поле `slug` у User |
| `/terms`, `/privacy` | 404 | Написать страницы |
| Автоимпорт с Avito в PostAdModal | Кнопка есть, ничего не делает | Парсер на бэке |
| Способы оплаты в /profile настройках | Заглушка | Позже (нужны платежи) |
| «Пожаловаться» на объявлении | Нет кнопки | Модель `Report` есть, нужен UI |
| Избранное | Нет UI | Модель `Favorite` есть |

---

## 🔴 Технический долг

- **Rate-limiting**: только на `/auth/email/request`. Не защищены `/ads` (создание), `/uploads/ad-photo`, `/me` PATCH. Спамер может забить БД или бакет.
- **S3 cleanup**: при удалении объявления `AdPhoto` удаляется каскадом из БД, но **файлы в S3 остаются**. Через полгода будет много мусора.
- **Sitemap + robots.txt**: не настроены, поисковики сайт не проиндексируют.
- **Sentry / логи**: только console.log. Runtime ошибки в проде не видно.
- **Аналитика**: нет метрики.
- **Email-верификация**: DKIM в Unisender настроен, но нет автоматической проверки (если что-то сломается, узнаешь только когда коды перестанут доходить).

---

## 📦 Env-переменные (актуальный список)

### API
```
DATABASE_URL              # авто-подтягивается из Amvera CNPG
PORT=3000

# JWT
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_TTL_SEC=900
JWT_REFRESH_TTL_SEC=7776000

# Cookies
COOKIE_DOMAIN=.xn----7sbhf4acwc1a.xn--p1ai
COOKIE_SECURE=true

# CORS
CORS_ORIGINS=https://xn----7sbhf4acwc1a.xn--p1ai

# Email (Unisender Go)
UNISENDER_GO_API_KEY
UNISENDER_GO_SENDER_EMAIL=noreply@доска-квн.рф
UNISENDER_GO_SENDER_NAME=Доска/КВН
EMAIL_CODE_INTERVAL_SEC=60
EMAIL_CODE_MAX_ATTEMPTS=5

# S3 (Timeweb)
TIMEWEB_S3_BUCKET=doska-kvn-main
TIMEWEB_S3_ACCESS_KEY_ID
TIMEWEB_S3_SECRET_ACCESS_KEY
TIMEWEB_S3_ENDPOINT=https://s3.timeweb.cloud
TIMEWEB_S3_REGION=ru-1
TIMEWEB_S3_PUBLIC_URL=      # опц.

# Админка
ADMIN_EMAILS=chernovilia@yahoo.com
AUTH_DEBUG_MODE=false

# Модерация (fallback; в проде управляем через админку → Setting)
AD_AUTOAPPROVE=true

# Опасное — только на разовый wipe (устарело, теперь есть /admin/wipe)
# ADMIN_WIPE_SECRET=
```

### Фронт
```
NEXT_PUBLIC_API_URL=https://api.xn----7sbhf4acwc1a.xn--p1ai/v1
```

---

## 🗂 Prisma-модели (используемые сейчас)

**Активные**:
- `Region`, `City` — справочники, засеиваются через `SEED_ON_STARTUP=true`
- `User`, `EmailCode`, `RefreshToken` — auth
- `Ad`, `AdPhoto` — объявления
- `Setting` — конфиг платформы (сейчас только `moderation.autoApprove`)

**В схеме, но не используются в коде**:
- `BusinessProfile`, `Wallet`, `WalletTransaction`, `Subscription`, `Payment`, `Tier`, `AdPromo`, `Banner`, `Promocode`, `PromocodeUse`, `TrustedDevice`, `AnalyticsEvent`, `Favorite`, `Report`, `AdView`

Модели готовы под будущее (бизнес-профили, тарифы, платежи, аналитика) — таблицы созданы в БД, endpoints ещё не написаны.

---

## 🚀 Что запускать локально

```bash
# Бэк
cd doska-kvn-api
npm install
# нужен DATABASE_URL к любому Postgres (dev-контейнер / удалённый)
npx prisma db push --skip-generate
npm run start:dev

# Фронт
cd доска:квн
npm install
# .env.local: NEXT_PUBLIC_API_URL=http://localhost:3000/v1
npm run dev
```

Локальную БД можно сеятить включив `SEED_ON_STARTUP=true` — создаст регионы, города, тарифы и демо-юзера с объявлениями.
