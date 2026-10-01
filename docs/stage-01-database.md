# Этап 1 — Prisma: схема, миграции, seed

> Первоначальная реализация этого этапа использовала MySQL. Проект временно перешёл на PostgreSQL, а на этапе 14 SQL-хранилище заменено JSON-файлами. Приведённые ниже команды и миграции — только историческая документация.

## 1. Что сделано

- Подключён Prisma 6 к MySQL 8 с кодировкой таблиц `utf8mb4` и сортировкой `utf8mb4_unicode_ci`.
- Описаны таблицы администратора, услуг и настроек; таблицы заявок нет.
- Добавлена первая SQL-миграция и команды разработки, деплоя, заполнения начальными данными и Prisma Studio.
- Добавлен singleton Prisma Client и кэшируемый API чтения/обновления настроек с тегом `settings`.
- Seed идемпотентно создаёт администратора, восемь настроек и шесть услуг без фото.

## 2. Файлы и папки

| Путь                                                  | Назначение                                                                                     |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `prisma/schema.prisma`                                | Источник схемы Prisma, модели `AdminUser`, `Service`, `Setting`.                               |
| `prisma.config.ts`                                    | Конфигурация Prisma CLI, путь к схеме и команда seed; загружает `.env` через dotenv.           |
| `prisma/migrations/migration_lock.toml`               | Закрепляет MySQL как provider истории миграций.                                                |
| `prisma/migrations/20260928000000_init/migration.sql` | Первичная миграция, создающая три таблицы, индексы и utf8mb4.                                  |
| `prisma/seed.ts`                                      | Создание начального администратора, настроек и услуг без перезаписи уже существующих значений. |
| `src/lib/db.ts`                                       | Singleton `PrismaClient`; сохраняет экземпляр в `globalThis` во время разработки.              |
| `src/lib/settings.ts`                                 | Типизированные `getSettings()` и `updateSettings()` с дефолтами и кэшированием Next.js.        |
| `package.json` / `package-lock.json`                  | Prisma, dotenv, bcryptjs, tsx и npm-команды этапа.                                             |
| `docker-compose.yml`                                  | MySQL 8.4 для локальной разработки, переменные подключения, healthcheck и named volume.        |
| `.env.example`                                        | Шаблон DATABASE_URL и параметров MySQL вместе с переменными проекта.                           |
| `docs/PROJECT.md`                                     | Карта проекта с зафиксированными MySQL/Prisma и правилами миграции.                            |
| `docs/README.md`                                      | Оглавление документации со статусом этапа 1.                                                   |

## 3. Как это работает

### Доступ к БД

`src/lib/db.ts` экспортирует единый `prisma`. В production модуль использует обычный экземпляр, а в development сохраняет его в `globalThis`, чтобы Next.js hot reload не создавал новые пулы соединений.

### Настройки сайта

`getSettings(): Promise<SiteSettings>` читает все строки `Setting`, преобразует snake_case ключи таблицы в типизированный объект, а отсутствующие строки заменяет значениями `DEFAULT_SETTINGS`. `reviewsEnabled` имеет тип `boolean`; только значение строки `"true"` включает флаг. Результат кэшируется через `unstable_cache` с тегом `settings`.

`updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings>` объединяет переданный patch с текущим состоянием, атомарно upsert-ит известные настройки в транзакции, вызывает `revalidateTag("settings", "max")` и возвращает записанный снимок. Неизвестные ключи `Setting` сохраняются в БД, но не входят в публичный объект `SiteSettings`.

### Начальное заполнение

`npm run db:seed` запускает `prisma/seed.ts` через поле `migrations.seed` в `prisma.config.ts`. Конфиг импортирует `dotenv/config`, поэтому `.env` читается Prisma CLI. Администратор создаётся только если `ADMIN_LOGIN` ещё отсутствует; пароль хешируется `bcryptjs` с cost 12. Настройки вставляются по первичному ключу, услуги — по уникальному `slug`. При повторном запуске существующие строки не затираются. Поэтому seed не меняет пароль или значения, уже отредактированные владельцем.

Изображения услуг в seed — пустые строки. На следующих этапах сайт отображает для них заглушку, пока владелец не загрузит изображение.

## 4. Интерфейсы

### HTTP и компоненты

На этапе 1 API-маршрутов и пользовательских компонентов нет. Миграции и seed запускаются npm-командами; доступ к моделям выполняется через Prisma Client.

### Полная схема БД

Идентификаторы Prisma `cuid()` хранятся в MySQL как `VARCHAR(191)`. Даты — `DATETIME(3)`. `String` без специального native type — `VARCHAR(191)`, `Boolean` — `BOOLEAN`.

| Таблица     | Поле           | Тип и ограничения                                               |
| ----------- | -------------- | --------------------------------------------------------------- |
| `AdminUser` | `id`           | `VARCHAR(191)`, PK, Prisma `cuid()`                             |
| `AdminUser` | `login`        | `VARCHAR(191)`, UNIQUE                                          |
| `AdminUser` | `passwordHash` | `VARCHAR(191)`; хранится bcrypt-хеш, не пароль                  |
| `AdminUser` | `createdAt`    | `DATETIME(3)`, default текущая дата/время                       |
| `Service`   | `id`           | `VARCHAR(191)`, PK, Prisma `cuid()`                             |
| `Service`   | `slug`         | `VARCHAR(191)`, UNIQUE; seed использует латиницу и дефисы       |
| `Service`   | `category`     | `VARCHAR(191)`                                                  |
| `Service`   | `title`        | `VARCHAR(191)`                                                  |
| `Service`   | `description`  | `TEXT`                                                          |
| `Service`   | `price`        | `VARCHAR(191)`, форматированная строка, не число                |
| `Service`   | `duration`     | `VARCHAR(191)`, форматированная строка                          |
| `Service`   | `image`        | `VARCHAR(191)`, NOT NULL, default `""`; пусто означает заглушку |
| `Service`   | `imageAlt`     | `VARCHAR(191)`                                                  |
| `Service`   | `sortOrder`    | `INTEGER`                                                       |
| `Service`   | `isPublished`  | `BOOLEAN`, NOT NULL, default `true`                             |
| `Service`   | `createdAt`    | `DATETIME(3)`, default текущая дата/время                       |
| `Service`   | `updatedAt`    | `DATETIME(3)`, Prisma обновляет при изменении записи            |
| `Setting`   | `key`          | `VARCHAR(191)`, PK                                              |
| `Setting`   | `value`        | `TEXT`                                                          |

Индексы: `AdminUser(login)` UNIQUE, `Service(slug)` UNIQUE, `Service(isPublished, sortOrder)` составной, `Setting(key)` PRIMARY KEY. В миграции все таблицы создаются с `DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`.

`BookingRequest` и другие таблицы заявок не создаются.

### Ключи таблицы `Setting`

| Ключ              | Значение по умолчанию               | Назначение                                                                                     |
| ----------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| `phone`           | `+7 (900) 000-00-00`                | Читаемое отображение номера на сайте.                                                          |
| `phone_href`      | `tel:+79000000000`                  | Ссылка `tel:` для кнопок и телефонных ссылок.                                                  |
| `address`         | `г. Серпухов, Советская улица, 2кА` | Адрес сервиса; адрес Москвы из макета не использовать.                                         |
| `hours_weekdays`  | `Пн–Пт: 09:00–20:00`                | Отображаемый режим работы в будни.                                                             |
| `hours_weekend`   | `Сб–Вс: 10:00–20:00`                | Отображаемый режим работы в выходные.                                                          |
| `yandex_org_id`   | `73425839561`                       | Идентификатор организации для виджета отзывов Яндекса.                                         |
| `reviews_enabled` | `true`                              | Строковый флаг `"true"`/`"false"`; `getSettings()` преобразует его в boolean `reviewsEnabled`. |
| `site_name`       | `РЕМЗОНА`                           | Название сайта для его текстового отображения и metadata на последующих этапах.                |

## 5. Переменные окружения и команды

### Переменные

`.env.example` содержит шаблонные, небоевые значения:

| Переменная                                  | Назначение                                                                                                |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                              | Prisma URL вида `mysql://USER:PASSWORD@HOST:PORT/DATABASE`; пароль/пользователь должны совпадать с MySQL. |
| `MYSQL_ROOT_PASSWORD`                       | Пароль root пользователя контейнера MySQL.                                                                |
| `MYSQL_DATABASE`                            | Имя создаваемой локальной базы.                                                                           |
| `MYSQL_USER`                                | Пользователь приложения, создаваемый контейнером.                                                         |
| `MYSQL_PASSWORD`                            | Пароль пользователя приложения.                                                                           |
| `MYSQL_PORT`                                | Порт MySQL на хосте, по умолчанию `3306`.                                                                 |
| `ADMIN_LOGIN`, `ADMIN_PASSWORD`             | Логин и начальный пароль, используемые seed; заменить локально/на сервере.                                |
| `SESSION_SECRET`, `UPLOADS_DIR`, `SITE_URL` | Общие переменные приложения из этапа 0; Prisma-настройка их не меняет.                                    |

Если изменить `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` или `MYSQL_PORT`, согласуйте их с `DATABASE_URL`. Не коммитьте `.env`.

### Запуск через Docker

Из корня репозитория:

```bash
cp .env.example .env  # только если .env ещё не создан
docker compose up -d mysql
docker compose ps
npm install
npm run db:migrate
npm run db:seed
```

`docker-compose.yml` использует MySQL `8.4` (ветка MySQL 8), хранит данные в persistent named volume `remzona_mysql_data`, выставляет порт из `MYSQL_PORT` и запускает healthcheck. `db:migrate` — команда разработки (`prisma migrate dev`), она применяет уже существующие миграции и создаёт новую при изменении схемы. Для чистой установки/боевого окружения применяйте `npm run db:deploy` (`prisma migrate deploy`), затем `npm run db:seed`.

Другие команды:

```bash
npm run db:deploy  # применить миграции без генерации новой
npm run db:seed    # идемпотентно наполнить начальные записи
npm run db:studio  # открыть Prisma Studio
```

### MySQL без Docker

Установите и запустите MySQL 8 локально, затем подключитесь административным пользователем и выполните, подставив свои значения:

```sql
CREATE DATABASE remzona CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'remzona'@'localhost' IDENTIFIED BY 'REPLACE_WITH_LOCAL_PASSWORD';
GRANT ALL PRIVILEGES ON remzona.* TO 'remzona'@'localhost';
```

Укажите тот же пароль, host/port и базу в `DATABASE_URL` в `.env`. Затем выполните `npm run db:deploy` и `npm run db:seed`. Для удалённого MySQL используйте подходящий host в `CREATE USER` и разрешайте сетевой доступ только приложению.

## 6. Принятые решения и отклонения от плана

- Первичная миграция построена из текущей Prisma-схемы через `prisma migrate diff`; основной штатный способ применения остаётся `migrate dev`/`migrate deploy`, не `db push`.
- Используется MySQL `8.4`, стабильная LTS-ветка MySQL 8, вместо плавающего тега `mysql:8`.
- Seed сохраняет существующие настройки, услуги и пароль админа без изменений. Для обновления начальных данных владелец или миграция должны делать это явно.
- Prisma находится на ветке 6 и использует `prisma.config.ts` для schema path и seed-команды; `dotenv/config` требуется для загрузки `.env` при выполнении CLI.
- Реализация в `src/lib/settings.ts` использует `revalidateTag("settings", "max")` согласно API установленного Next.js 16.

## 7. Как проверить

1. Сверить `DATABASE_URL` с MYSQL-переменными `.env`, запустить `docker compose up -d mysql` и дождаться healthy состояния: `docker compose ps`.
2. Выполнить `npm run db:migrate`. Ожидается применение `20260928000000_init` и появление трёх таблиц плюс `_prisma_migrations`.
3. Выполнить `npm run db:seed` дважды. Ожидаются один администратор, восемь ключей настроек, шесть услуг и отсутствие дублей после повторного запуска.
4. Запустить `npm run db:studio`; проверить модели и значения, в частности пустые `Service.image`, `Setting.yandex_org_id = 73425839561`, `Setting.reviews_enabled = "true"`.
5. Запустить `npm run db:deploy` повторно. Повторное применение уже применённой миграции не должно менять схему или создавать записи.
6. Изменить значение настройки и проверить `getSettings()`/`updateSettings()` в вызывающем коде следующих этапов; ключ `reviews_enabled` должен возвращаться как boolean.

Проверки, проведённые при подготовке этой документации: SQL миграции сверён с выводом `prisma migrate diff`; `npm run lint` проходит. Применить миграцию и seed в этой рабочей среде не удалось: MySQL по `127.0.0.1:3306` недоступен (`P1001`). Текущий `npm run typecheck` отдельно падает из-за устаревшего `.next/types/validator.ts`, где сгенерирована ссылка на отсутствующий `src/app/page.js`; это не относится к схеме этапа 1.

## 8. Ограничения и что нужно знать на следующих этапах

- MySQL должен быть запущен до `db:migrate`, `db:deploy`, `db:seed` и выполнения серверного кода, читающего БД.
- В контейнере Docker данные переживают перезапуск благодаря named volume; удаление volume удалит локальную БД.
- Начальные услуги являются редактируемыми данными, а не эталонной синхронизацией: повторный seed намеренно не перезаписывает существующие услуги/настройки.
- Пароль из `ADMIN_PASSWORD` хешируется только при первоначальном создании администратора. Изменение env позднее само по себе не изменит запись в БД.
- Все денежные значения и длительности хранятся строками для отображения; вычисления по ним не выполнять без отдельного нормализованного поля.
- Заявок нет. Фото услуг пока не загружаются и представлены пустым `image`.
- `DATABASE_URL` содержит пароль в URL-формате; спецсимволы пароля нужно percent-encode.
- До применения миграции к постоянным данным всегда делайте резервную копию БД.
