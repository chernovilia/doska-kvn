# Доска/КВН

Городская платформа объявлений, услуг и афиши агломерации **Кулебаки — Выкса — Навашино**.

Прод: https://доска-квн.рф · API: https://api.доска-квн.рф/v1 (репозиторий [doska-kvn-api](https://github.com/chernovilia/doska-kvn-api))

Стек: **Next.js 14 (App Router)** · **Tailwind CSS** · **Framer Motion** · **Lucide React**.

Все пользовательские данные (объявления, профиль, авторизация) идут через API. Статичные справочники (разделы, категории, регионы) лежат в `data/`.

## Документация

Вся документация — в папке [`documents/`](documents/README.md): состояние ([STATE](documents/STATE.md)), структура кода ([STRUCTURE](documents/STRUCTURE.md)), эндпоинты ([API](documents/API.md)), админка, ранжирование, дорожная карта.

## Локальный запуск

```bash
npm install
# .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3000/v1
node node_modules/next/dist/bin/next dev
```

`npm run dev` в папке `доска:квн` не сработает: двоеточие в пути — разделитель `PATH`, и shell не находит `next`.

Нужен запущенный API. Если API слушает тот же порт 3000, запусти фронт на другом: `npm run dev -- -p 3001`.

Авторизация работает на httpOnly-cookies с `Domain=.доска-квн.рф`, поэтому на localhost вход через прод-API не сработает — нужен локальный API с `COOKIE_DOMAIN` пустым и `COOKIE_SECURE=false`.

## Деплой на Amvera

Конфиг в `amvera.yaml`. Push в `main` → Amvera собирает (`npm install && npm run build`) и запускает `npm run start` на порту 3000.

## Структура

- `app/` — страницы: лента `/` и `/[place]`, `/ad/[id]`, `/user/[id]`, `/favorites`, `/messages`, `/profile`, `/help`, `/admin`, `/login`, `/onboarding`, `/terms`, `/privacy`
- `components/` — UI; `components/admin/` — части админки
- `lib/` — `api.js` (все запросы к API), `auth.js`, счётчики и избранное, форматирование
- `data/` — справочники: разделы и категории, характеристики, регионы
- `documents/` — документация

Подробно — [documents/STRUCTURE.md](documents/STRUCTURE.md).
