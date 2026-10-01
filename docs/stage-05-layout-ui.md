# Этап 5 — Публичный каркас: Header, Footer, UI-компоненты

## 1. Что сделано

- Публичная route group получила общий серверный layout: липкая шапка, содержимое страницы и footer.
- Добавлены адаптивная desktop-навигация и полноэкранное мобильное меню с Escape, focus trap и блокировкой фонового скролла.
- Телефон, адрес и часы в шапке/footer берутся из `getSettings()`; отзывы и их якорные ссылки зависят от `reviewsEnabled`.
- Созданы общие `Button`, `Container`, `Section`, `Reveal`, `Icon` и `PhoneLink`.
- Добавлены страницы-заготовки `/privacy` и `/consent`; публичная главная пока содержит пустые якоря секций.

## 2. Файлы и папки

| Путь                                 | Назначение                                                                             |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| `src/app/(site)/layout.tsx`          | Серверный shell сайта; получает `SiteSettings` и передаёт их Header/Footer.            |
| `src/app/(site)/page.tsx`            | Заглушка главной и якоря `#services`, `#about`, условный `#reviews`, `#contacts`.      |
| `src/app/(site)/privacy/page.tsx`    | Шаблон публичной страницы политики конфиденциальности.                                 |
| `src/app/(site)/consent/page.tsx`    | Шаблон страницы согласия на обработку персональных данных.                             |
| `src/components/site/Header.tsx`     | Sticky header, адаптивная навигация и управляемое мобильное меню.                      |
| `src/components/site/Footer.tsx`     | Контактные колонки, ссылки на Яндекс.Карты и документы.                                |
| `src/components/ui/Button.tsx`       | Кнопка с вариантами `primary`, `secondary`, `light`.                                   |
| `src/components/ui/Container.tsx`    | Обёртка проекта с `container-site`.                                                    |
| `src/components/ui/Section.tsx`      | Секция с optional eyebrow, заголовком, описанием и children.                           |
| `src/components/ui/Reveal.tsx`       | IntersectionObserver reveal; reduced-motion и отсутствие JS оставляют контент видимым. |
| `src/components/ui/Icon.tsx`         | Единая тонкая обёртка lucide-react.                                                    |
| `src/components/ui/PhoneLink.tsx`    | Переиспользуемая телефонная ссылка с иконкой.                                          |
| `src/app/globals.css`                | Reveal-переходы в рамках существующих токенов и reduced-motion.                        |
| `package.json` / `package-lock.json` | Прямая зависимость `lucide-react`.                                                     |
| `docs/PROJECT.md`                    | Зафиксированы публичный layout и назначение icon library.                              |
| `docs/README.md`                     | Оглавление документации со статусом этапа 5.                                           |

## 3. Как это работает

`src/app/(site)/layout.tsx` вызывает `getSettings()` на сервере и передаёт сериализуемый объект в `Header` и `Footer`. Route group не меняет URL. Layout помечен `dynamic = "force-dynamic"`, потому что данные контактов принадлежат MySQL и должны быть актуальны на запросе; само чтение настроек кэшируется тегом `settings` в `src/lib/settings.ts`.

### Header

Desktop показывает текстовый логотип, центрированную навигацию, телефон и CTA «Позвонить». Header остаётся sticky, использует светлый полупрозрачный фон, blur и тонкую линию. От ширины меньше `lg` показываются иконка телефонной ссылки и burger.

Мобильное меню — Client Component, локализованный только в `Header.tsx`. При открытии оно:

- показывает полноэкранный dialog с `aria-modal=true` и навигацией;
- переносит фокус на первую ссылку;
- перехватывает Tab/Shift+Tab внутри меню;
- закрывается клавишей Escape, кнопкой закрытия или выбором ссылки;
- временно ставит `document.body.style.overflow = "hidden"`, восстанавливая исходное значение при закрытии.

На страницах `/privacy` и `/consent` навигационные якоря ведут на `/#services`, `/#about`, `/#reviews`, `/#contacts`; на главной — на локальные `#...`. Пункт «Отзывы» исключён из Header, когда `reviewsEnabled=false`.

### PhoneLink и Footer

`PhoneLink({ phone, phoneHref, className?, label?, iconOnly? })` получает обе части номера пропсами с сервера; не обращается к БД и не хардкодит контакт. Обычный вариант показывает иконку + текст, `iconOnly` оставляет доступную подпись через `aria-label`/`sr-only`.

Footer использует переданные `SiteSettings`: читаемый телефон и `phoneHref`, часы будней/выходных, адрес, `yandexOrgId`, `reviewsEnabled`. Внешние ссылки Яндекса открываются в новой вкладке с `rel="noopener noreferrer"`. Ссылка на отзывы появляется только вместе с включённой секцией.

### Reveal

`Reveal` помечает свой DOM-узел после hydration и ждёт IntersectionObserver с порогом 0.12. При попадании в viewport элемент становится видимым один раз. При `prefers-reduced-motion` или без IntersectionObserver содержимое сразу видимо. CSS-анимация около 500 ms и отключается общей reduced-motion политикой. SSR HTML остаётся видимым, пока браузер не активирует наблюдение.

## 4. Интерфейсы

### Маршруты

| Метод/путь     | Назначение                                        |
| -------------- | ------------------------------------------------- |
| `GET /`        | Публичная заглушка и якоря главных секций.        |
| `GET /privacy` | Шаблон политики конфиденциальности.               |
| `GET /consent` | Шаблон согласия на обработку персональных данных. |

На этапе 5 API-маршруты не добавлены. Авторизация остаётся только под `/admin`.

### Пропсы UI

```ts
Button({ variant?: "primary" | "secondary" | "light", ...buttonProps })
Container({ ...divProps })
Section({ eyebrow?: string, title: string, description?: string, children?, ...sectionProps })
Reveal({ children, ...divProps })
Icon({ icon: LucideIcon, ...lucideProps })
PhoneLink({ phone, phoneHref, className?, label?, iconOnly?, variant?, children?, onClick? })
Header({ settings: { phone, phoneHref, reviewsEnabled } })
Footer({ settings: SiteSettings })
```

`Section` отображает H2. Компонент не назначает id автоматически; якорь задаёт вызывающая секция.

### Публичная страница

Порядок якорей: `#services`, `#about`, `#reviews` при включённой настройке, `#contacts`. На текущем этапе это зарезервированные пустые области; содержимое появится в этапах 6–9. Форм записи, API заявок и таблиц заявок нет.

## 5. Переменные окружения и команды

Новых env-переменных нет. Используется уже существующий `.env.example`: `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_LOGIN`, `ADMIN_PASSWORD`, `UPLOADS_DIR`, `SITE_URL` и MySQL-переменные локального Compose.

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

Публичный shell читает `phone`, `phone_href`, `address`, `hours_weekdays`, `hours_weekend`, `yandex_org_id`, `reviews_enabled` через `getSettings()`; значения по умолчанию определены на этапе 1.

## 6. Принятые решения и отклонения от плана

- Header собран как Client Component целиком ради поведения focus trap, scroll lock и Escape; Footer и все страницы/публичный layout остаются Server Components. Отдельно серверный UI не втягивает БД в браузерный bundle.
- Применён актуальный телефон из `phone_href`, а не номер из демо-макета; настоящий адрес Серпухова не заменён адресом-макетом из Москвы.
- Пункты меню «Автомобили» и «Записаться» отсутствуют. CTA ведёт напрямую на `tel:`.
- Юридические страницы явно являются шаблонами и не должны считаться одобренными юридическими текстами.
- Адаптивная проверка выполняется локально по ширинам из задания после запуска приложения; из-за отсутствия MySQL в текущем окружении live render с данными БД зависит от предварительно поднятой базы.

## 7. Как проверить

1. Запустить MySQL и применить миграции/seed согласно [документации этапа 1](stage-01-database.md); затем `npm run dev`.
2. Открыть `/`: видны логотип и шапка, nav-якоря прокручивают страницу; footer показывает настройки из БД.
3. В `/admin/settings` будущего этапа изменить телефон/адрес/часы и проверить после сброса тега `settings`, что ссылки `tel:` и текст обновились.
4. На ширинах 375, 768, 1280 и 1440 px проверить шапку/footer и отсутствие горизонтального скролла. На mobile открыть меню, пройти Tab/Shift+Tab, закрыть Escape и выбрать пункт; фоновая прокрутка при открытом меню заблокирована.
5. При `reviews_enabled="true"` видны `Отзывы` и `#reviews`; при `false` они исключены из Header, Footer и страницы.
6. Проверить `/#contacts`, `/privacy`, `/consent`; ссылки Яндекса открываются в новой вкладке, телефон имеет `tel:` URL.
7. Уменьшить системную настройку Reduce Motion: `Reveal` не должен скрывать контент и не должен анимировать появление.
8. Выполнить `npm run lint`, `npm run typecheck`, `npm run build`.

## 8. Ограничения и что нужно знать на следующих этапах

- Главная пока каркас «РЕМЗОНА — скоро»; секции остаются пустыми до последующих этапов.
- Header/Footer зависят от MySQL через `getSettings()`; без доступной БД публичный runtime не сможет получить настройки, хотя `SiteSettings` содержит defaults для неполных таблиц.
- Privacy/consent — шаблоны. До production владелец должен предоставить юридические формулировки.
- PhoneLink получает `phone` и `phoneHref` как пару; сохраняйте их согласованными при настройках телефона.
- При изменении правил пунктов навигации синхронно обновляйте якоря главной и conditional reviews logic.
- Menu focus trap ориентирован на доступные ссылки и кнопки внутри полноэкранного меню; если позднее туда добавят сложные виджеты/вложенные диалоги, focus management нужно пересмотреть.
