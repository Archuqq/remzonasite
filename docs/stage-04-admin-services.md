# Этап 4 — Админка: управление карточками услуг

Для следующего разработчика или ИИ: этот этап добавляет полный CRUD услуг в `/admin` и JSON API под `/api/admin/services`. Публичная страница по-прежнему заглушка; после изменений кэш тега `services` и путь `/` сбрасываются заранее.

## 1. Что сделано

- Админ может создавать, править, скрывать/показывать, удалять и менять порядок карточек услуг.
- Фото необязательно: без файла публикуется заглушка; любое загруженное фото проходит `saveServiceImage` (WebP 2:1, обрезка по центру).
- Slug при создании строится транслитерацией названия; при правке slug не меняется.
- Ошибки API — JSON на русском с картой полей; мутации требуют сессию админа и same-origin проверку.
- В админке временный предпросмотр карточки 2:1 (TODO заменить на `ServiceCard` после этапа 7).

## 2. Файлы и папки

| Путь                                               | Назначение                                                 |
| -------------------------------------------------- | ---------------------------------------------------------- |
| `src/lib/slug.ts`                                  | Транслитерация заголовка в slug.                           |
| `src/lib/validation.ts`                            | Zod-схемы полей услуги, reorder, publish.                  |
| `src/lib/services.ts`                              | DTO, тег кэша `services`, `revalidatePublicServices()`.    |
| `src/lib/admin-services.ts`                        | guard, разбор form-data, уникальный slug, чтение файла.    |
| `src/lib/image-constants.ts`                       | Константы лимитов/заглушки без Node-модулей (для клиента). |
| `src/lib/images.ts`                                | Реэкспорт констант; конвейер фото без изменений логики.    |
| `src/lib/auth.ts`                                  | Убран хвост `export {}` этапа 0.                           |
| `src/app/api/admin/services/route.ts`              | GET список, POST создание (multipart).                     |
| `src/app/api/admin/services/reorder/route.ts`      | PATCH порядок.                                             |
| `src/app/api/admin/services/[id]/route.ts`         | GET/PUT/DELETE одной услуги.                               |
| `src/app/api/admin/services/[id]/publish/route.ts` | PATCH публикация.                                          |
| `src/app/(admin)/admin/services/page.tsx`          | Список карточек.                                           |
| `src/app/(admin)/admin/services/new/page.tsx`      | Форма создания.                                            |
| `src/app/(admin)/admin/services/[id]/page.tsx`     | Форма редактирования.                                      |
| `src/components/admin/ServicesList.tsx`            | Список, порядок, скрытие, удаление с модалкой.             |
| `src/components/admin/ServiceForm.tsx`             | Форма, preview, drag-and-drop файла.                       |
| `src/components/admin/AdminServiceCardPreview.tsx` | Временный макет карточки 2:1.                              |
| `docs/README.md`, `docs/PROJECT.md`                | Оглавление и карта проекта.                                |

Новых переменных окружения нет.

## 3. Как это работает

1. Страницы `/admin/services*` рендерятся на сервере (layout уже вызывает `requireAdmin()`). Список и форма редактирования читают Prisma напрямую.
2. Клиентские действия идут через `fetch` на `/api/admin/services…`. Cookie сессии уходит сама; `proxy.ts` и `requireAdminResponse` отклоняют гостя с 401. Мутации дополнительно проверяют Origin/Host (`requireSameOriginResponse`).
3. POST/PUT принимают `multipart/form-data`. Поля валидируются zod. Файл `image` опционален. Если файл есть — сначала `saveServiceImage`, затем запись в БД. Если БД падает после сохранения файла, новый UUID удаляется. При замене фото старые файлы удаляются только после успешного UPDATE. DELETE удаляет оба WebP, если `image` не пустой.
4. Slug: `slugifyTitle(title)` (кириллица → латиница, дефисы, максимум 80 символов, пустой результат → `usluga`). Если slug занят — суффиксы `-2`, `-3`, … При PUT slug не трогается.
5. После любой успешной мутации: `revalidatePath("/")` и `revalidateTag("services", "max")`.
6. Предпросмотр в форме: выбранный файл — blob URL с `object-cover`/`object-center` в кадре 2:1; иначе текущее фото или SVG-заглушка. Публикация без фото не блокируется, показывается уведомление «Фото не выбрано — будет показана заглушка».

### Контракты

- `slugifyTitle(title: string): string`
- `uniqueSlugFromTitle(title: string): Promise<string>`
- `serializeService(service): AdminServiceDto` — добавляет `imageUrls` и `hasImage`
- `getSettings` не менялся; публичный список услуг будет кэшироваться с тегом `services` на этапе 7

## 4. Интерфейсы

Схема БД `Service` без изменений (этап 1). Таблицы заявок нет.

### API

Общие ошибки: `401` `{ "error": "Требуется авторизация администратора." }`, `403` CSRF, `400` `{ "error": "…", "fields": { "title": "…" } }`, `404` `{ "error": "Услуга не найдена." }`.

Поля multipart: `category`, `title`, `description`, `price`, `duration`, `imageAlt`, `isPublished` (`true`/`false`), файл `image`.

Валидация: category ≤ 40, title ≤ 100, description ≤ 300, price ≤ 40, duration ≤ 40, imageAlt ≤ 160 (можно пустым — подставится title). Текстовые поля кроме imageAlt обязательны.

#### `GET /api/admin/services`

Ответ `200`: `{ "services": [ AdminServiceDto, … ] }` по `sortOrder`.

#### `POST /api/admin/services`

Пример: `multipart` с title «Компьютерная диагностика», без файла.

Успех `201`: `{ "service": { "id": "…", "slug": "kompyuternaya-diagnostika", "image": "", "hasImage": false, "imageUrls": { "src1200": "/images/service-placeholder.svg", "src600": "…" }, … } }`.

С фото: `image` = UUID, `src600` = `/uploads/services/{uuid}-600.webp`.

#### `GET /api/admin/services/{id}`

`200` `{ "service": AdminServiceDto }` или `404`.

#### `PUT /api/admin/services/{id}`

Те же поля, что POST. Slug прежний. Без файла `image` в БД не меняется.

#### `DELETE /api/admin/services/{id}`

`200` `{ "ok": true }`. Файлы фото удаляются.

#### `PATCH /api/admin/services/reorder`

Тело: `{ "ids": ["id1", "id2", …] }` — все существующие id ровно по разу. `sortOrder` = 10, 20, 30…

Успех: `{ "services": [ … ] }`.

#### `PATCH /api/admin/services/{id}/publish`

Тело: `{ "isPublished": false }`. Успех: `{ "service": … }`.

### Компоненты

- `ServicesList({ services: AdminServiceDto[] })`
- `ServiceForm({ mode: "create" | "edit", service?: AdminServiceDto })`
- `AdminServiceCardPreview({ title, category, description, price, duration, imageSrc, imageAlt })`

## 5. Переменные окружения и команды

Новых ключей в `.env.example` нет. Нужны уже существующие: `DATABASE_URL`, `SESSION_SECRET`, `UPLOADS_DIR`, `SITE_URL`, учётка админа.

```bash
cp .env.example .env
docker compose up -d
npm run db:deploy
npm run db:seed
npm run dev
```

Войти в `/admin/login`, открыть `/admin/services`.

## 6. Принятые решения и отклонения от плана

- Drag-and-drop порядка нет: только кнопки вверх/вниз, как допускает промт.
- Константы фото вынесены в `image-constants.ts`, чтобы клиент не импортировал `sharp`.
- `imageAlt` с лимитом 160 (в промте лимит не указан); пустое значение заменяется названием.
- Предпросмотр — отдельный админский компонент с TODO на этап 7, не копия будущего `ServiceCard`.
- `GET` списка для UI не обязателен (страница ходит в Prisma), но маршрут есть для единообразия и возможных клиентов.
- Маршруты с обработкой изображения помечены `runtime = "nodejs"`.
- После успешного коммита новая картинка не удаляется из-за последующей ошибки revalidation/очистки. Старые файлы при замене или удалении очищаются best-effort; при сбое очистки карточка остаётся консистентной, а старый файл может остаться orphan и требует поздней ручной уборки.

## 7. Как проверить

1. Войти в админку. Список seed-услуг без фото: миниатюра-заглушка, статус «Опубликовано».
2. **Создание с фото.** «Добавить услугу», заполнить поля, выбрать JPEG. Предпросмотр 2:1 с обрезкой по центру. Сохранить → в списке миниатюра `/uploads/…-600.webp`.
3. **Создание без фото.** Не выбирать файл. Видно уведомление про заглушку. Сохранить — карточка опубликована, заглушка на месте. Не блокируется.
4. **Замена фото.** Открыть карточку, загрузить другое изображение, сохранить. Старый UUID-файл исчез, новый отдаётся по `/uploads`.
5. **Удаление.** «Удалить» → модалка с названием → подтвердить. Строка пропадает, файлы фото удалены.
6. **Вертикальное / панорамное.** Любое соотношение в предпросмотре и на диске становится 2:1, центр кадра.
7. **Огромный файл.** > 10 МБ — ошибка на клиенте и/или `fields.image` с сервера.
8. **Не-картинка.** `.txt` / `.pdf` — ошибка «не изображение» / сообщение Sharp.
9. **Порядок.** ↑/↓ меняют места; после обновления страницы порядок тот же.
10. **Скрыть/Показать.** Статус переключается без удаления.
11. Повторное создание услуги с тем же названием: slug `…-2`. Редактирование названия slug не меняет.
12. Без cookie `GET/POST /api/admin/services` → 401.

Автоматическая проверка `npm run test:services` покрывает транслитерацию slug, fallback и максимальную длину slug, а также границы Zod-полей. В этой среде ручные сценарии, требующие записи/чтения MySQL (CRUD, reorder, publish, удаление/замена в БД), не выполнялись: MySQL и Docker недоступны. Image-процессинг отдельно покрыт `npm run test:images`.

Также проверены `npm run lint`, `npm run typecheck` и `npm run build`. Прямой HTTP CRUD smoke-test с валидной cookie и MySQL не запускался по той же причине отсутствия DB runtime.

## 8. Ограничения и что нужно знать на следующих этапах

- Публичная секция услуг ещё не читает БД. Тег `services` нужно повесить на выборку этапа 7: `unstable_cache(..., { tags: ["services"] })`.
- **TODO:** заменить `AdminServiceCardPreview` на `ServiceCard` после этапа 7 (кнопка «Позвонить», не «Записаться»).
- Удалить фото, не удаляя карточку, нельзя — отдельной кнопки «сбросить фото» нет.
- Seed-услуги без файлов — норма; владелец загрузит фото сам.
- Не добавлять форму записи и таблицу заявок.

---

## Правила slug и публикация без фото

Транслитерация: `ё→yo`, `ж→zh`, `х→kh`, `ц→ts`, `ч→ch`, `ш→sh`, `щ→shch`, `ю→yu`, `я→ya`, пробелы и знаки → `-`. Пример: «Компьютерная диагностика» → `kompyuternaya-diagnostika`. Коллизия → `kompyuternaya-diagnostika-2`.

Публикация без `image`: `Service.image = ""`, `getServiceImageUrls` отдаёт `/images/service-placeholder.svg`. На сайте (позже) заглушка, не битая картинка.
