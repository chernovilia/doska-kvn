# Доска/КВН

Городская платформа объявлений, услуг и афиши агломерации **Кулебаки — Выкса — Навашино**.

Прод: https://доска-квн.рф · API: https://api.доска-квн.рф/v1 (репозиторий [doska-kvn-api](https://github.com/chernovilia/doska-kvn-api))

Стек: **Next.js 14 (App Router)** · **Tailwind CSS** · **Framer Motion** · **Lucide React**.

Все пользовательские данные (объявления, профиль, авторизация) идут через API. Статичные справочники (разделы, категории, регионы) лежат в `data/`.

## Документация

- [STATE.md](STATE.md) — что работает в проде, что заглушки, env-переменные
- [ROADMAP.md](ROADMAP.md) — порядок следующих работ
- [RANKING-AND-PROMO.md](RANKING-AND-PROMO.md) — ранкинг ленты, VIP, звёзды, монетизация
- [ARCHITECTURE.md](ARCHITECTURE.md) — архитектура (см. блок «Расхождения с реальностью»)
- [BUSINESS-MODEL.md](BUSINESS-MODEL.md) — типы аккаунтов и тарифы
- [ADMIN.md](ADMIN.md) — целевой дизайн админки

## Локальный запуск

```bash
npm install
# .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3000/v1
npm run dev
```

Нужен запущенный API. Если API слушает тот же порт 3000, запусти фронт на другом: `npm run dev -- -p 3001`.

Авторизация работает на httpOnly-cookies с `Domain=.доска-квн.рф`, поэтому на localhost вход через прод-API не сработает — нужен локальный API с `COOKIE_DOMAIN` пустым и `COOKIE_SECURE=false`.

## Деплой на Amvera

Конфиг в `amvera.yaml`. Push в `main` → Amvera собирает (`npm install && npm run build`) и запускает `npm run start` на порту 3000.

## Структура

- `app/` — страницы: `/`, `/[place]`, `/ad/[id]`, `/u/[slug]`, `/login`, `/profile`, `/messages`, `/admin`, `/terms`, `/privacy`
- `components/` — UI-компоненты; `components/admin/` — части админки
- `lib/api.js` — все запросы к API; `lib/auth.js` — `AuthProvider` и `useAuth()`
- `data/` — статичные справочники (разделы, категории, регионы, слайды)
