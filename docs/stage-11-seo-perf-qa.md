# Этап 11 — SEO, производительность, доступность, финальная проверка

## 1. Что сделано

- Обновлены title, description, canonical, Open Graph и Twitter metadata главного сайта.
- Добавлены `robots.ts`, `sitemap.ts`, `icon.svg` и JSON-LD `AutoRepair`.
- JSON-LD использует актуальные телефон, адрес и часы из `SiteSettings`.
- Для услуг без фотографии установлен общий alt «Услуга автосервиса РЕМЗОНА».
- Проверены TypeScript, ESLint, production build и существующие регрессионные тесты.
- Критичный build-дефект админского dashboard исправлен: DB-зависимые admin pages помечены `force-dynamic`.

## 2. Файлы и папки

| Путь | Назначение |
| --- | --- |
| `src/app/layout.tsx` | Production metadata, canonical, Open Graph и Twitter card. |
| `src/app/robots.ts` | Запрет индексации `/admin` и `/api/admin`, ссылка на sitemap. |
| `src/app/sitemap.ts` | Sitemap публичных страниц. |
| `src/app/icon.svg` | Текстовый favicon «Р». |
| `src/components/site/LocalBusinessSchema.tsx` | JSON-LD `AutoRepair` с контактами и графиком. |
| `src/app/(site)/page.tsx` | Подключение JSON-LD на публичной странице. |
| `src/lib/services.ts` | Общий alt для placeholder-карточек без фото. |
| `src/app/(admin)/admin/page.tsx` | Явный `force-dynamic` для dashboard с Prisma-запросом. |
| `src/app/(admin)/admin/settings/page.tsx` | Явный `force-dynamic` для страницы настроек. |
| `docs/README.md` | Этап 11 добавлен в оглавление. |
| `docs/PROJECT.md` | Зафиксированы SEO и QA-решения. |
| `docs/stage-11-seo-perf-qa.md` | Эта документация. |

## 3. Как это работает

### SEO

Корневой layout задаёт:

- title: `РЕМЗОНА — премиальный автосервис в Серпухове`;
- description из задания;
- `metadataBase` из `SITE_URL`;
- canonical `/`;
- Open Graph image `/images/hero-1600.webp` размером `1600×901`;
- Twitter `summary_large_image`.

`src/app/robots.ts` разрешает публичный сайт и запрещает `/admin` и `/api/admin`. `src/app/sitemap.ts` публикует только индексируемую главную; шаблонные юридические страницы остаются `noindex` и в sitemap не включаются.

`LocalBusinessSchema` рендерит JSON-LD типа `AutoRepair`. Имя, телефон, адрес и часы берутся из `SiteSettings`; часы извлекаются из строк формата `09:00–20:00`. Схема содержит будни и выходные как `OpeningHoursSpecification`.

Для опубликованной услуги с фото alt берётся из `imageAlt` или названия. Для пустого `Service.image` используется общий alt `Услуга автосервиса РЕМЗОНА`.

### Производительность и кэш

- Hero использует существующий AVIF/WebP preload и eager loading.
- Карточки услуг и CTA используют lazy loading с явными width/height.
- Карта и отзывы загружаются ниже первого экрана и не подключают внешний ресурс при выключенных отзывах.
- `Reveal` и мобильное меню остаются единственными существующими интерактивными клиентскими модулями публичного shell, дополнительно карта использует небольшой client component.
- Публичный layout всё ещё `force-dynamic`, потому что настройки читаются из MySQL на сервере. При этом выборки услуг и настроек кэшируются через `unstable_cache`, а админские изменения сбрасывают соответствующие теги и `/`. Это означает data-cache с актуализацией по тегам, но не полностью статичный HTML ISR.

### Доступность

Проверены по коду: один H1 на публичной главной, H2 для крупных секций, alt у изображений, видимые focus-ring, aria у мобильного меню, `aria-busy` у контейнера карты, `title` у iframe отзывов и минимальная высота tap-целей 44px для основных интерактивных элементов.

## 4. Интерфейсы

### Служебные маршруты

| Маршрут | Ответ |
| --- | --- |
| `GET /robots.txt` | Правила индексации и URL sitemap. |
| `GET /sitemap.xml` | URL публичных страниц. |
| `GET /` | Публичная страница с JSON-LD. |

### Компонент

```ts
LocalBusinessSchema({ settings: SiteSettings }): JSX.Element
```

## 5. Переменные окружения и команды

Новых переменных окружения нет. Используются `SITE_URL`, `DATABASE_URL`, `UPLOADS_DIR` и существующие настройки БД.

```bash
npm run lint
npm run typecheck
npm run build
npm run test:services
npm run test:auth
npm run test:images
```

Для полноценного live QA нужны MySQL 8, запущенный Next server и браузер с Lighthouse.

## 6. Принятые решения и отклонения от плана

- Metadata заданы в root layout, чтобы canonical и social preview были единообразны.
- JSON-LD строится из настроек, а не из дублируемых констант, поэтому телефон, адрес и часы соответствуют публичному интерфейсу.
- Полный HTML ISR не включён: существующий `src/app/(site)/layout.tsx` остаётся `force-dynamic`. Сохранён data-cache через `unstable_cache`, потому что текущая архитектура должна читать изменения настроек без сборки приложения.
- Lighthouse-оценки не подставлялись: в окружении нет Docker/MySQL и не подтверждён рабочий browser/Lighthouse runtime.

## 7. Как проверить

### Автоматически проверено

- `npm run lint` — успешно.
- `npm run typecheck` — успешно.
- `npm run build` — успешно; маршруты `/robots.txt` и `/sitemap.xml` попали в сборку.
- `npm run test:services` — успешно.
- `npm run test:auth` — успешно.
- VS Code diagnostics изменённых TypeScript-файлов — ошибок нет.

### Ручной QA-чеклист

| Проверка | Статус |
| --- | --- |
| Metadata, canonical, OG, Twitter | выполнено по коду |
| JSON-LD AutoRepair | выполнено по коду |
| robots и sitemap | выполнено по коду и build |
| Favicon | выполнено по файлу `icon.svg` |
| Админка защищена | покрыто auth-тестом и существующим proxy |
| CRUD услуг и фото | покрыто существующими image/service тестами; live DB не запускалась |
| Кнопки «Позвонить» | выполнено по компонентам; мобильный dialer не тестировался |
| Карта Яндекс | fallback и lazy-код проверены сборкой; внешний скрипт не запускался |
| Переключатель отзывов | код и invalidation проверены; ручной DB-сценарий не запускался |
| Нет формы и заявок | выполнено по архитектуре и поиску исходников |
| Адаптив 375–1920 px | не измерен браузером в этой среде |
| Keyboard/focus/WCAG | проверено статически; автоматический axe/Lighthouse не запускался |
| Lighthouse mobile/desktop | не выполнен: нет доступного runtime |

## 8. Ограничения и известные дефекты

- Точные Lighthouse Performance, LCP, CLS, TBT и размер первого JS-бандла не измерены из-за отсутствия доступного MySQL/Docker и браузерного Lighthouse runtime. Их нельзя считать подтверждёнными.
- Публичный маршрут динамический на уровне HTML из-за `force-dynamic` layout; кэшируются данные настроек и услуг, а не полностью готовая HTML-страница.
- Внешние карта и iframe отзывов требуют доступности доменов Яндекса и корректной CSP/nginx-конфигурации на деплое.
- Содержимое `/privacy` и `/consent` остаётся шаблонным и требует юридического текста заказчика.
- `siteName` хранится в настройках и доступен JSON-LD, но итоговое динамическое SEO-название страницы остаётся фиксированным требованием этапа 11.