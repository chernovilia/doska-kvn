# Доска/КВН

Городская платформа объявлений, услуг и афиши агломерации **Кулебаки — Выкса — Навашино**.

Стек: **Next.js 14 (App Router)** · **Tailwind CSS** · **Framer Motion** · **Lucide React**.

Текущая версия — интерактивный прототип на mock-данных.

## Локальный запуск

```bash
npm install
npm run dev
```

Открыть http://localhost:3000

## Продакшен-сборка

```bash
npm run build
npm run start
```

## Деплой на Amvera

Проект настроен под Amvera Cloud (файл `amvera.yaml`).

1. Подключить репозиторий в панели Amvera.
2. Выбрать окружение **Node.js**, версию `20`.
3. Amvera автоматически подхватит конфиг:
   - `build`: `npm install && npm run build`
   - `run`: `npm run start`
   - `containerPort`: `3000`

## Структура

- `app/` — страницы (главная, `/profile`)
- `components/` — UI-компоненты
- `data/` — mock-данные объявлений и профиля
