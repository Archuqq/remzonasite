# Этап 14 — JSON-хранилище вместо СУБД

## 1. Что сделано

- Удалены PostgreSQL и Prisma; услуги, настройки и данные администратора хранятся в JSON-файлах.
- Добавлен общий store с Zod-валидацией, атомарной заменой файла и очередью обновлений в рамках процесса.
- Контракты `AdminServiceDto`, `PublicService`, `SiteSettings` и cache tags `services`/`settings` сохранены.
- Фото по-прежнему обрабатываются `sharp` и хранятся отдельно в `UPLOADS_DIR`.
- Добавлены идемпотентный seed, утилита генерации bcrypt-хеша, тесты store и обновлённая инструкция deploy/backup.

## 2. Файлы

- `src/lib/json-store.ts` — чтение, валидация, создание и атомарная запись JSON-файлов с мьютексом.
- `src/lib/service-store.ts` — схема записи услуги, defaults и CRUD-функции над `services.json`.
- `src/lib/admin-store.ts` — создание и обновление `admin.json`, bcrypt-хеширование первичного пароля.
- `src/lib/services.ts` — прежние DTO и публичное кэшируемое чтение услуг из JSON.
- `src/lib/settings.ts` — прежний контракт настроек с источником `settings.json`.
- `src/components/site/GuaranteesSection.tsx` — блок гарантий.
- `scripts/seed-data.ts` — создаёт отсутствующие файлы услуг, настроек и администратора.
- `scripts/hash-password.ts` — печатает bcrypt-хеш для ручного восстановления доступа.
- `scripts/test-json-store.ts` — проверяет fallback, конкурентные обновления и повреждённый JSON.
- `docs/stage-12-deploy.md` — Node.js deploy, systemd, Nginx, HTTPS и резервные копии без СУБД.
- Удалены `src/lib/db.ts`, `prisma/`, `prisma.config.ts` и DB-only `docker-compose.yml`.
- Удалены `@prisma/client`, `prisma`, `postinstall` и команды `db:*`; `package-lock.json` обновлён.

## 3. Форматы данных и запись

`DATA_DIR` по умолчанию равен `./data`; production должен указывать на постоянный каталог вне директории релиза. При первом чтении отсутствующий файл создаётся с fallback. Существующий JSON проходит Zod-проверку; повреждённый или не соответствующий схеме файл вызывает ошибку с путём и причиной, содержимое не заменяется defaults.

### `services.json`

Массив записей со схемой:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "computer-diagnostics",
    "category": "ДИАГНОСТИКА",
    "title": "Компьютерная диагностика",
    "description": "Проверка электронных систем автомобиля.",
    "price": "от 1 500 ₽",
    "duration": "30–60 мин",
    "image": "",
    "imageAlt": "Компьютерная диагностика автомобиля",
    "sortOrder": 10,
    "isPublished": true,
    "createdAt": "2026-09-30T12:00:00.000Z",
    "updatedAt": "2026-09-30T12:00:00.000Z"
  }
]
```

`id` создаётся `crypto.randomUUID()`, даты — ISO strings. Первичный seed содержит шесть прежних услуг без фото. Путь/UUID фотографии сохраняется в `image`, сами файлы остаются в `UPLOADS_DIR/services/`.

### `settings.json`

Плоский объект строковых значений: `phone`, `phone_href`, `address`, `hours_weekdays`, `hours_weekend`, `yandex_org_id`, `reviews_enabled` (`"true"`/`"false"`), `site_name`. Отсутствующие ключи дополняются defaults: Серпухов, `73425839561`, стандартный телефон и часы, отзывы включены.

### `admin.json`

```json
{
  "login": "admin",
  "passwordHash": "$2b$12$..."
}
```

Файл создаётся из `ADMIN_LOGIN`/`ADMIN_PASSWORD` при первом обращении или `npm run data:seed`. Хеш bcrypt cost 12. Если файл уже есть, эти переменные не нужны для runtime; если файла нет, без них bootstrap завершается понятной ошибкой. В JWT поле `sub` содержит login; прежний Prisma ID удалён. Смена пароля атомарно обновляет JSON-файл и не сбрасывается от повторного seed.

`writeJsonFile()` пишет во временный файл рядом с целевым (`.tmp-<UUID>`) с правами `0600`, затем вызывает `rename()`. Каталог создаётся с `0700` для нового пути. Очередь `Map<path, Promise<void>>` сериализует операции по файлу. `updateJsonFile()` держит эту блокировку на всём цикле read → transform → write, иначе два конкурентных admin-запроса могли бы затереть изменения друг друга. Мьютекс действует внутри одного процесса Node.js.

## 4. Интерфейсы

```ts
getDataDirectory(): Promise<string>
readJsonFile<T>(filePath: string, schema: ZodType<T>, fallback: T): Promise<T>
writeJsonFile<T>(filePath: string, data: T): Promise<void>
updateJsonFile<T, R>(filePath, schema, fallback, update): Promise<R>
getPublishedServices(): Promise<PublicService[]>
getSettings(): Promise<SiteSettings>
updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings>
```

Форма `PublicService`, `AdminServiceDto` и `SiteSettings` не изменилась: компоненты и API-потребители не требуют переписывания. Админские endpoints используют JSON service store для list/get/create/update/delete/publish/reorder. Публичное чтение по-прежнему завернуто в `unstable_cache`; изменения сбрасывают `services`/`settings` и путь `/` через `revalidateTag(..., "max")`/`revalidatePath`.

`DATA_DIR` не выдаётся по HTTP. Маршрут `/uploads/[...path]` по-прежнему резолвит только `UPLOADS_DIR` и разрешает лишь UUID-файлы `services/{uuid}-{600|1200}.webp`; `data/admin.json` не может быть выдан этим route.

## 5. Переменные и команды

- Удалена `DATABASE_URL`.
- `DATA_DIR=./data` добавлен в `.env.example`; каталог должен быть writable и постоянным.
- Сохранены `ADMIN_LOGIN`, `ADMIN_PASSWORD`, `UPLOADS_DIR`, `SESSION_SECRET`, `SITE_URL`.
- `npm run data:seed` создаёт отсутствующие JSON-файлы, существующие оставляет без изменений.
- `npm run hash:password -- <пароль>` создаёт bcrypt-хеш для ручного редактирования `admin.json`.
- Добавлен `npm run test:storage`.
- Удалены `db:migrate`, `db:deploy`, `db:seed`, `db:studio` и Prisma `postinstall`.

Локальный запуск: `npm ci && npm run data:seed && npm run dev`. Не коммитьте `/data`; обновления production должны сохранять внешние `DATA_DIR` и `UPLOADS_DIR`.

## 6. Принятые решения

- Отдельная СУБД удалена для небольшого сайта с единственным администратором и без клиентских заявок.
- Старые этапы MySQL/PostgreSQL оставлены как историческая документация и помечены как устаревшие относительно этапа 14.
- Данные из старой СУБД автоматически не переносятся. Если они нужны, экспортируйте записи услуг/настроек и перенесите связанные фото отдельно.
- В `admin.json` нет отдельного ID: login используется идентификатором субъекта JWT.
- Публичные тексты больше не называют сервис премиальным; гарантийный срок 12 месяцев указан по подтверждению владельца. Акция и фотополоса не используются.
- Deploy-гайд в `stage-12-deploy.md` использует ежедневный tar backup `data/` и `uploads/`; настройка DB и `pg_dump` больше не нужны.

## 7. Проверки

- `npm run test:storage`: fallback для отсутствующего файла, 40 параллельных read-modify-write без потери счётчика, ошибка на испорченном JSON без перезаписи.
- `npm run typecheck`, `npm run lint`, `npm run test:auth`, `npm run test:services`, `npm run test:images`, `npm run build`.
- `npm run data:seed` с пустым временным `DATA_DIR`: ожидаются три файла и шесть услуг; повторный seed оставляет файлы нетронутыми.
- Вручную проверить login, смену пароля с перезапуском, CRUD/reorder/publish и отражение изменений на главной.
- `/uploads/admin.json` и произвольные пути должны вернуть 404; route обращается только к `UPLOADS_DIR`.

В этой среде автоматические тесты и production build выполнялись; Docker больше не требуется. Live-проверка входа/CRUD через браузер, production restart и восстановление из реального backup требуют настроенного файлового окружения на сервере.

## 8. Ограничения

Мьютекс общий только для одного процесса; JSON-хранилище не рассчитано на несколько Node-инстансов за балансировщиком и не обеспечивает межпроцессную блокировку. Храните данные на persistent filesystem и регулярно проверяйте backup. При нескольких серверах, клиентских данных или значительном росте проекта вернитесь к общей СУБД.