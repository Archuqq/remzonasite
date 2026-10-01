# Этап 0 — Каркас проекта и документация

> Исторический документ начального каркаса. База данных, Prisma-файлы и переменные `DATABASE_URL` из первоначального плана больше не используются; актуальное файловое хранилище описано в [этапе 14](stage-14-json-storage.md).

Для следующего разработчика или ИИ: этот этап не содержит UI секций и не подключает БД. Цель — каркас Next.js, токены дизайна, структура папок, безопасное чтение env и договорённости в `docs/`.

## 1. Что сделано

- Проверены исходники: `docs/design-spec.md` и `assets-source/hero-mercedes.png` (PNG 1671×941).
- Инициализирован Next.js 16 (App Router, TypeScript, Tailwind 4, ESLint, `src/`, алиас `@/*`).
- Подключены шрифты Cormorant Garamond и Manrope (latin + cyrillic) через `next/font`.
- Дизайн-токены и контейнер заданы в `src/app/globals.css` по спецификации.
- Создана целевая структура папок, `src/lib/env.ts`, `.env.example`, Prettier, скрипты `dev` / `build` / `start` / `lint` / `typecheck`.
- Публичная главная — заглушка «РЕМЗОНА — скоро».
- Зафиксированы решения проекта в `docs/PROJECT.md`.

## 2. Файлы и папки

| Путь | Назначение |
| --- | --- |
| `package.json` | Имя пакета `remzona`, npm-скрипты, зависимости этапа 0 (`next`, `react`, `zod`, `prettier`). |
| `tsconfig.json` | Strict TypeScript, пути `@/*` → `src/*`. |
| `next.config.ts` | Конфиг Next.js (пока без особых опций). |
| `postcss.config.mjs` | PostCSS-плагин Tailwind 4. |
| `eslint.config.mjs` | ESLint (core-web-vitals + typescript). |
| `.prettierrc.json` / `.prettierignore` | Форматирование. |
| `.gitignore` | `node_modules`, `.next`, `.env` (не `.env.example`), `uploads`. |
| `.env.example` | Шаблон переменных без секретов заказчика. |
| `.env` | Локальная копия для запуска (не коммитить). |
| `src/app/layout.tsx` | Корневой layout: шрифты, `lang="ru"`, проверка env, фон/текст. |
| `src/app/globals.css` | Токены, контейнер, smooth scroll, reduced-motion. |
| `src/app/(site)/page.tsx` | Заглушка публичной главной. |
| `src/app/admin/` | Резерв маршрутов админки. |
| `src/app/api/` | Резерв route handlers. |
| `src/components/ui`, `site`, `admin` | Пустые каталоги под UI следующих этапов. |
| `src/lib/env.ts` | Zod-схема и экспорт `env`. |
| `src/lib/db.ts`, `auth.ts`, `images.ts`, `settings.ts`, `validation.ts` | Заготовки модулей (пусто, с комментарием этапа). |
| `prisma/` | Каталог под схему и seed этапа 1. |
| `docs/PROJECT.md` | Карта проекта. |
| `docs/README.md` | Оглавление документации. |
| `docs/stage-00-scaffold.md` | Этот файл. |
| `assets-source/hero-mercedes.png` | Исходник Hero (ещё не подключён к странице). |
| `AGENTS.md` | Служебные правила Next.js 16 для агентов (создаёт `create-next-app` / `next dev`). |

## 3. Как это работает

1. При импорте `@/lib/env` вызывается `loadEnv()`: из `process.env` читаются шесть полей, прогоняются через `envSchema` (zod). Успех — объект `env`. Ошибка — `Error` с русским списком полей; процесс не стартует «молча».
2. Корневой `layout.tsx` импортирует `env` (для `metadataBase`) и CSS. Шрифты вешают CSS-переменные `--font-manrope` и `--font-cormorant`; Tailwind мапит их на `font-sans` и `font-serif`.
3. Маршрут `/` обслуживает `src/app/(site)/page.tsx` (route group не влияет на URL).
4. Next.js подхватывает `.env` автоматически. Клиентский бандл переменные из `env.ts` не должен импортировать: модуль только для сервера.

### Контракт `loadEnv` / `env`

- **Вход:** `process.env` (строки или `undefined`).
- **Выход:** `{ DATABASE_URL, SESSION_SECRET, ADMIN_LOGIN, ADMIN_PASSWORD, UPLOADS_DIR, SITE_URL }`.
- **Ошибки:** `SESSION_SECRET` короче 32 символов; `SITE_URL` не абсолютный URL; любое поле пустое.

## 4. Интерфейсы

На этапе 0 **нет** HTTP API, **нет** схемы Prisma, **нет** пропсов UI-компонентов кроме страницы-заглушки без пропсов.

| Что | Статус |
| --- | --- |
| API-маршруты | Каталог `src/app/api/` пустой |
| БД | Не подключена |
| `HomePage` | Без пропсов, серверный компонент |

## 5. Переменные окружения и команды

Скопировано в `.env.example` (значения-заглушки):

| Переменная | Пример | Смысл |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://user:password@127.0.0.1:5432/remzona?schema=public` | Строка Prisma/PostgreSQL (текущий provider; см. этап 12) |
| `SESSION_SECRET` | строка ≥ 32 символов | Подпись cookie-сессии админа (этап 3) |
| `ADMIN_LOGIN` | `admin` | Логин входа в `/admin` |
| `ADMIN_PASSWORD` | `change-me` | Пароль (позже хеш в коде/seed, не в git) |
| `UPLOADS_DIR` | `./uploads` | Каталог файлов фото |
| `SITE_URL` | `http://localhost:3000` | Канонический URL сайта (`metadataBase`) |

Команды:

```bash
cp .env.example .env   # если .env ещё нет
npm install
npm run dev            # http://localhost:3000
npm run lint
npm run typecheck
npm run build
npm run start          # после build
```

## 6. Принятые решения и отклонения от плана

- **Tailwind CSS 4** (`@theme` / `@utility` в CSS), а не `tailwind.config.ts` v3: так инициализирует актуальный `create-next-app` для Next.js 16. Классы токенов те же по смыслу (`bg-bg`, `text-ink`, …).
- **Next.js 16.3.6 и React 19** — актуальная стабильная линейка CLI, не Next 14.
- **zod установлен**, остальные пакеты стека (Prisma, sharp, bcryptjs, jose, lucide-react) **не** ставились: БД и UI секций на этапе 0 нет.
- Каркас `create-next-app` собран во временной папке и перенесён в корень, потому что в репозитории уже были `docs/` и `assets-source/`.
- Заготовки `src/lib/*.ts` кроме `env.ts` — пустые модули с комментарием, чтобы структура совпадала с планом и ESLint не ругался на «висящие» файлы без экспорта.
- В корне оставлены `AGENTS.md` / `CLAUDE.md` от шаблона Next.js 16: `next dev` сам восстанавливает блок правил агента.

## 7. Как проверить

1. Есть файлы `docs/design-spec.md` и `assets-source/hero-mercedes.png`.
2. В корне есть `.env` (скопирован из `.env.example`), `SESSION_SECRET` не короче 32 символов.
3. `npm run lint` — без ошибок.
4. `npm run typecheck` — без ошибок.
5. `npm run build` — успешная сборка.
6. `npm run dev` → открыть `/` → заголовок **«РЕМЗОНА — скоро»**, фон тёплый светло-серый (`#F7F7F5`), текст графитовый, не чёрный; заголовок шрифтом serif (Cormorant).
7. Удалить `DATABASE_URL` из `.env` и перезапустить `dev` — процесс падает с понятным сообщением про переменные (затем вернуть значение).

## 8. Ограничения и что нужно знать на следующих этапах

- MySQL/Prisma ещё нет: `DATABASE_URL` только валидируется.
- Hero-фото лежит в `assets-source/`, на страницу не подключено (этап 6).
- `/admin` пока не существует как страница (только каталог).
- Не добавлять форму записи и таблицу заявок.
- Адрес только Серпухов.
- Скрипт Яндекс.Карт пока никуда не вставлять (этап 9); хранить одной константой.
- Публичную страницу позже кэшировать; сейчас заглушка без `unstable_cache`.
- Фото услуг не готовить: seed без картинок, загрузка в админке.
- Переключатель отзывов — в настройках админки (этап 10), не на этом этапе.

---

## Дизайн-токены (как пользоваться в Tailwind)

Заданы в `@theme` файла `src/app/globals.css`. Абсолютный чёрный и красный не использовать.

| Токен | Значение | Классы (примеры) |
| --- | --- | --- |
| bg | `#F7F7F5` | `bg-bg` |
| surface | `#FFFFFF` | `bg-surface` |
| ink | `#15191C` | `text-ink`, `bg-ink` |
| muted | `#687078` | `text-muted` |
| line | `#E5E7E8` | `border-line` |
| accent | `#B5A98A` | `text-accent`, `bg-accent` (мало, декор) |
| dark | `#151A1D` | `bg-dark` |
| section-alt | `#F2F2F0` | `bg-section-alt` |
| radius md / lg | `12px` / `16px` | `rounded-md`, `rounded-lg` |
| font-sans | Manrope | `font-sans` (body по умолчанию) |
| font-serif | Cormorant Garamond | `font-serif` (заголовки) |

Контейнер: класс `container-site` — `max-width: 1360px`, центрирование, горизонтальные отступы: 20px (mobile) → 32px (`md`) → 40px (`lg`) → 60px (`xl`) → 80px (≥1440px).

`scroll-margin-top: 84px` у элементов с `id` — под будущую sticky-шапку. При `prefers-reduced-motion` анимации и smooth-scroll отключаются.

## Список переменных окружения (ещё раз)

`DATABASE_URL`, `SESSION_SECRET`, `ADMIN_LOGIN`, `ADMIN_PASSWORD`, `UPLOADS_DIR`, `SITE_URL` — см. таблицу в разделе 5. Реальных паролей и боевых URL в репозитории нет.
