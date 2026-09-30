# API — справочник эндпоинтов

Копия раздела «Эндпоинты» из [README репозитория doska-kvn-api](https://github.com/chernovilia/doska-kvn-api#readme) на 28.09.2026. Меняя эндпоинт, обновляйте оба места.

Прод: `https://api.доска-квн.рф/v1`. Авторизация — httpOnly-cookies `access_token` / `refresh_token`. Как устроены модули — [STRUCTURE.md](STRUCTURE.md).

## Эндпоинты

Все под префиксом `/v1`.

**Сервис**

| Метод | URL | |
|---|---|---|
| GET | `/`, `/health` | Инфо о сервисе, проверка БД |
| GET | `/regions`, `/cities` | Справочники |

**Авторизация** (httpOnly-cookies `access_token` / `refresh_token`)

| Метод | URL | |
|---|---|---|
| POST | `/auth/email/request` | Отправить 6-значный код на email (с адреса 5/мин, 20/час, 50/сутки) |
| POST | `/auth/email/verify` | Проверить код, выставить cookies |
| POST | `/auth/refresh` | Ротация refresh-токена |
| POST | `/auth/logout` | Отзыв refresh, очистка cookies |
| GET | `/me` | Текущий пользователь (+ `isAdmin`) |
| PATCH | `/me` | Профиль и онбординг (`markOnboarded`, `agreeTerms`) |

**Объявления**

| Метод | URL | |
|---|---|---|
| GET | `/ads?place&section&group&authorId&attr&chip&search&priceMin&priceMax&limit&offset&sort` | Лента. `attr` — JSON фильтров по характеристикам: `{"rooms":"2","area":{"gte":40}}` (до 10 полей). `section=free` — «Отдам даром» (цена 0 в товарных разделах), `sort`: top (ранкинг — `computeScore`) / recent / cheap / expensive |
| GET | `/ads/counts?place` | Счётчики по разделам |
| GET | `/ads/sitemap` | id и дата всех одобренных — для sitemap.xml фронта |
| GET | `/ads/:id` | Объявление с автором и фото. Неопубликованные (pending, rejected, hidden) — только автору и админам, причину модерации видят только они; `nextBumpAt` — когда можно поднять |
| POST | `/ads/:id/view` | Просмотр страницы: +1 к `viewsCount`, один раз в сутки на пользователя / `sessionId` браузера / хэш IP; автор не считается |
| POST | `/ads/:id/report` | Жалоба `{ reason: scam \| spam \| illegal \| wrong-category \| sold \| other, comment? }` (auth; 20/сутки; повтор до разбора — не дубль; на своё нельзя) |
| GET | `/users/:id` | Публичный профиль продавца: имя, аватар, «о себе», город, рейтинг, дата регистрации, число активных объявлений. Почту и телефон не отдаёт |
| GET | `/favorites` | Избранные объявления (auth; только опубликованные, свежие сверху, до 200) |
| GET | `/favorites/ids` | id избранного — для сердечек в ленте (auth) |
| POST | `/favorites/:adId` | Добавить (auth; повтор — не ошибка; своё нельзя) |
| DELETE | `/favorites/:adId` | Убрать (auth) |
| GET | `/users/:id/reviews` | Отзывы о пользователе (публично, до 100, свежие сверху) |
| GET | `/conversations/:id/review` | Можно ли оставить отзыв: `{ eligible, reason: 'no_dialog' \| 'too_early' \| 'already' \| null, review, need: { messages, hours }, mine, theirs, readyAt }` (auth) |
| POST | `/reviews` | Отзыв `{ conversationId, rating 1–5, text? до 1000 }`: участник диалога, где каждый написал ≥ `reviews.min_messages` (4) и с первого сообщения прошло `reviews.min_hours` (1 ч); один на диалог; пересчитывает `rating`/`reviewsCount`, уведомляет (auth; 20/сутки) |
| GET | `/notifications` | Последние 50 уведомлений (auth) |
| GET | `/notifications/unread-count` | Непрочитанные (auth; опрос раз в минуту) |
| POST | `/notifications/read-all` · `/notifications/:id/read` | Прочитать все / одно (auth) |
| GET | `/support` | Мои обращения с перепиской (auth) |
| POST | `/support` | Новое обращение `{ topic: question \| problem \| complaint \| idea, text 5–2000 }` — админам уведомление (auth; 10/сутки; можно и заблокированным). Пока есть обращение без ответа — 409 |
| POST | `/support/:id/messages` | Дописать в своё обращение `{ text }` — только после ответа поддержки (`answered`), иначе 409; возвращает обращение в очередь (auth) |
| GET | `/push/key` | Публичный VAPID-ключ для подписки; `null` — пуши на сервере выключены |
| POST | `/push/subscribe` | Подписка браузера `{ endpoint, keys: { p256dh, auth }, platform?, deviceId? }` (auth). Пуш уходит на каждое уведомление (колокольчик) и на каждое сообщение в чате (`tag` — одно уведомление на диалог), в пуше — число непрочитанных для иконки; подписки с ответом 404/410 удаляются |
| DELETE | `/push/subscribe` | `{ endpoint }` — отписать этот браузер (auth) |
| POST | `/app/open` | Приложение открыто с иконки или установлено `{ deviceId, platform: ios\|android\|desktop, browser, source: standalone\|appinstalled }` (гостям тоже; вошедшему — привязка к аккаунту) |
| POST | `/app/event` | Воронка: `install_prompt_shown`, `install_clicked`, `install_dismissed`, `push_prompt_shown`, `push_enabled` — счётчик по дням |
| GET | `/users/username-available?u=` | Свободен ли адрес `/u/<u>`: `{ available, reason? }` (свой текущий — свободен) |
| GET | `/users/by-username/:username` | Публичная страница по своему адресу (как `/users/:id`) |
| GET | `/site` | Публичные настройки из админки: `{ neighbors: { cityId: [cityId…] }, contacts: { email, phone, telegram, vk }, app: { 'app.install.*', 'app.push.*', texts } }` — правила и тексты окон приложения |
| POST | `/ads` | Создать (auth; 5/час, 20/сутки; `photoUrls[]` до 10; `attributes` — плоский объект характеристик, до 20 полей; `eventDate` — у афиши) |
| POST | `/ads/:id/bump` | Бесплатно поднять своё опубликованное (auth; пауза `ranking.bump_cooldown_days`, по умолчанию 10 дней) |
| PUT | `/ads/:id` | Правка своего объявления: тело как у `POST /ads`. Модерация как при подаче (автопубликация → сразу в ленте, иначе `pending` и уведомление админам); отклонённое и скрытое — всегда `pending`. Дата публикации и срок показа сохраняются; убранные фото удаляются из S3 (auth; 30/час) |
| POST | `/ads/:id/archive` | «Продано / неактуально»: своё опубликованное → `archived` (auth) |
| POST | `/ads/:id/renew` | Продлить своё опубликованное или вернуть из архива → `approved`, `expiresAt = сейчас + ads.lifetime_days` (auth) |
| DELETE | `/ads/:id` | Удалить своё (auth); фото удаляются из S3 |
| GET | `/me/ads` | Свои объявления во всех статусах (auth); у каждого `expiresAt`, `deleteAt`, `canRenew`, `nextBumpAt` |
| POST | `/uploads/ad-photo` | Фото: multipart `file`, до 12 MB → WebP 1600px в S3 (auth; 30/час) |

**Сообщения** (только вошедшие; чужой диалог — 404)

| Метод | URL | |
|---|---|---|
| GET | `/ads/:id/contact` | Телефон продавца, если он выбрал связь по телефону (30/час) |
| POST | `/conversations` | `{ adId }` → найти или создать диалог (себе нельзя) |
| GET | `/conversations` | Список: объявление, собеседник, последнее сообщение, непрочитанные |
| GET | `/conversations/unread-count` | Непрочитанные для значка |
| GET | `/conversations/:id/messages?after=` | Сообщения; `after` — только новые (для опроса). Отмечает прочитанным |
| POST | `/conversations/:id/messages` | `{ text }` 1–2000 символов (20/мин). Письмо получателю — на первое непрочитанное |

**Админка** (`AdminGuard`: `role` admin/owner или email в `ADMIN_EMAILS`)

| Метод | URL | |
|---|---|---|
| GET | `/admin/stats` | Счётчики таблиц |
| GET | `/admin/whoami` | Какой IP сервер видит у админа — проверка, что лимиты считаются по настоящим адресам. `ipHeaders` — все заголовки прокси с адресом (диагностика) |
| GET | `/admin/users?limit&offset&q&blocked=1` | Пользователи |
| DELETE | `/admin/users/:id` | Удалить пользователя с его данными |
| GET | `/admin/ads?limit&offset&status&q&authorId` | Объявления с фильтром статуса |
| GET | `/admin/ads/:id` | Объявление с фото и контактами автора |
| PATCH | `/admin/ads/:id/status` | `{ status: pending \| approved \| rejected \| hidden, note? }`. `approved` ставит новый срок показа, `rejected` — отсчёт до удаления. `hidden` — скрыть опубликованное из ленты и поиска; автору уведомление с причиной о каждом переходе; возврат скрытого не сбрасывает дату публикации |
| DELETE | `/admin/ads/:id?reason=` | Удалить объявление, автору — уведомление с причиной |
| GET | `/admin/reviews` | Последние 200 отзывов |
| DELETE | `/admin/reviews/:id` | Удалить отзыв, пересчитать рейтинг |
| GET | `/admin/reports?status=pending` | Жалобы на объявления с объявлением, автором и жалующимся |
| PATCH | `/admin/reports/:id` | `{ status: resolved \| dismissed }` — закрывает все открытые жалобы на то же объявление |
| PATCH | `/admin/users/:id/block` | `{ blocked, reason? }` — нельзя публиковать, писать, загружать, оценивать; объявления и страница скрыты, сессии отозваны |
| GET / PATCH | `/admin/settings` | Настройки: автопубликация; срок показа, хранение архива и отклонённых, за сколько дней предупреждать (`ads.*`); порог отзыва (`reviews.*`); подъём, бонус новым, свежесть, веса (`ranking.*`). PATCH `{ key, value }` с проверкой диапазона |
| GET | `/admin/support?status=open` | Обращения в поддержку с перепиской и автором |
| POST | `/admin/support/:id/reply` | Ответ `{ text }` → статус answered, пользователю уведомление и письмо |
| PATCH | `/admin/support/:id` | `{ status: open \| answered \| closed }` |
| GET, PATCH | `/admin/moderation` | Автопубликация вкл/выкл (`Setting['moderation.autoApprove']`) |
| GET | `/admin/app` | Приложение: установили (всего, за 7 дней), пользуются за 7 дней, платформы, с пушами, воронка за 30 дней, последние 100 устройств |
| PUT | `/admin/neighbors` | `{ cityId, neighbors: [cityId…] \| null }` — соседи города для блока «В соседних городах»; `null` — по умолчанию (остальные города региона и запущенные соседние регионы) |
| PUT | `/admin/app-texts` | Тексты окна установки `{ title, subtitle, benefit1Title, benefit1Text, benefit2Title, benefit2Text }`; пустые — по умолчанию |
| PUT | `/admin/contacts` | `{ email?, phone?, telegram?, vk? }` — контакты в подвале, пустые не показываются |
| POST | `/admin/wipe?confirm=WIPE_ALL` | Стереть всех пользователей и объявления — только при `ADMIN_WIPE_ENABLED=true` (на проде выключено, 403) |

## Жизненный цикл объявления

`AdLifecycleService`, раз в час (первый прогон через минуту после старта; `AD_LIFECYCLE=off` — выключить):

1. Опубликованное живёт `ads.lifetime_days` (60). За `ads.lifecycle_warn_days` (3) — уведомление `ad_expiring` «Продлить».
2. Срок вышел → `archived`, уведомление `ad_archived`. Автор может вернуть (`/renew`) или сам убрать в архив (`/archive`).
3. Архив хранится `ads.archive_keep_days` (90), отклонённые — `ads.rejected_keep_days` (30) с момента отклонения; за 3 дня — `ad_deleting`, потом удаление вместе с фото.
4. Скрытые модератором не трогаем. Старым объявлениям без срока ставится срок от публикации, но не раньше чем через 7 дней.

## Rate-limit

`AppThrottlerGuard`: глобально 300 запросов/мин, 5000/час, 50 000/сутки на ключ. Строгие лимиты — точечные, на эндпоинтах из таблиц выше. Счётчики в памяти процесса.

**Ключ лимита — не IP.** Настоящий адрес клиента до API не доходит: перед ингрессом Amvera ещё один прокси, и во всех заголовках (`X-Forwarded-For`, `X-Real-IP`) — его адрес 10.128.x. Поэтому ключ:
- вошедший — `user:<id>`;
- `/auth/email/request` и `/verify` — `email:<почта>` (лимит на почту), плюс общий потолок кодов на сайт `EMAIL_CODES_PER_HOUR` (500/час);
- гость — `guest:<gid>`: httpOnly-cookie `gid` ставится при первом запросе (`src/guest-id.ts`);
- запрос без `gid` (первый заход, боты без cookie) — общий ключ `new-guest` с лимитом ×10.

## Деплой на Amvera

Push в `main` → Amvera: `npm install` → `prisma generate` (prebuild) → `npm run build`. Запуск — `npm run start:migrate:prod`, то есть `prisma db push --skip-generate && node dist/main`.

`db push` сам применяет добавления (таблицы, колонки, индексы). Если изменение схемы удаляет данные (удалить или переименовать колонку, сменить тип, добавить unique на колонку с дублями), он останавливается с ошибкой, и API не стартует. Такое изменение нужно выкатывать вручную: сначала перенести данные, потом менять схему.

Переход на `prisma migrate deploy` отложен: 21.09 он падал на Amvera CNPG с `permission denied to create database`, а проверить его вне прода пока негде.

Переменные окружения — в `.env.example` (полный список с комментариями) и в Amvera → Настройки → Переменные.
