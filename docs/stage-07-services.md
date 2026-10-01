# Этап 7 — Секция услуг с кнопками звонка

Для следующего разработчика или ИИ: публичная главная показывает карточки из MySQL. Кнопка на карточке — только `tel:` на номер из настроек. Формы записи нет.

## 1. Что сделано

- На главной выводятся опубликованные услуги (`isPublished`, порядок `sortOrder`) в сетке 1 / 2 / 3 колонки.
- Выборка кэшируется тегом `services`; админский CRUD уже вызывает `revalidateTag("services")` и `revalidatePath("/")`.
- `ServiceCard` по спецификации: фон surface, рамка line, радиус 16 px, фото 2:1, lazy srcset 600/1200, hover-подъём и лёгкий scale фото, CTA «Позвонить».
- Без фото — SVG-заглушка `/images/service-placeholder.svg`.
- Временный `AdminServiceCardPreview` заменён на тот же `ServiceCard` (в админке кнопка не ссылка).

## 2. Файлы и папки

| Путь | Назначение |
| --- | --- |
| `src/lib/services.ts` | `getPublishedServices()`, тип `PublicService`, прежний тег `services`. |
| `src/components/site/ServiceCard.tsx` | Карточка услуги для сайта и превью админки. |
| `src/components/site/ServicesSection.tsx` | Секция с сеткой, Reveal и `id="services"`. |
| `src/app/(site)/page.tsx` | Параллельно грузит settings + услуги, рендерит Hero и секцию. |
| `src/components/ui/PhoneLink.tsx` | Флаг `preview` — разметка кнопки без `href`. |
| `src/components/admin/ServiceForm.tsx` | Предпросмотр через `ServiceCard`. |
| `src/components/admin/AdminServiceCardPreview.tsx` | Удалён. |
| `docs/README.md`, `docs/PROJECT.md` | Оглавление и карта. |

Новых переменных окружения нет.

## 3. Как это работает

`HomePage` делает `Promise.all([getSettings(), getPublishedServices()])`.

`getPublishedServices()` — `unstable_cache` с ключом `published-services` и тегом `services`. Внутри: `prisma.service.findMany({ where: { isPublished: true }, orderBy: sortOrder, createdAt })`, затем `getServiceImageUrls(image)`.

Публичный layout по-прежнему `force-dynamic` (шапка/футер). Страница не статическая целиком, но выборка услуг и настроек живёт в data-cache Next.js. После сохранения/удаления/публикации/порядка в админке `revalidatePublicServices()` сбрасывает тег и `/`; следующий запрос видит новые карточки.

`ServicesSection` вешает `id="services"` (якорь Hero и меню). Каждая карточка в `Reveal` (порог 0.12, reduced-motion не прячет контент).

`ServiceCard` не ходит в БД. Телефон приходит пропсами с главной (`phone`, `phoneHref` из Setting). В админке `preview` → CTA это `<span>`, звонок не стартует.

Фото: `<img width="1200" height="600" loading="lazy" decoding="async" object-cover>`. Если есть UUID — `srcset` `600w` и `1200w`. Если нет — оба URL указывают на заглушку, srcset не ставится.

Hover: `-translate-y-1`, мягкая тень, `scale(1.02)` у изображения, кнопка `group-hover:bg-dark`.

## 4. Интерфейсы

HTTP API этапа нет. Схема `Service` без изменений.

```ts
getPublishedServices(): Promise<PublicService[]>

PublicService {
  id, slug, category, title, description, price, duration, imageAlt,
  imageUrls: { src600, src1200 }
}

ServiceCard({
  category, title, description, price, duration, imageAlt, imageUrls,
  phone?, phoneHref?, preview?
})

ServicesSection({ services, phone, phoneHref })

PhoneLink({ ..., preview?: boolean })
```

## 5. Переменные окружения и команды

Новых ключей нет. Нужны `DATABASE_URL` и seed услуг.

```bash
npm run dev
# открыть /#services
```

После правки карточки в `/admin/services` обновить `/` — список должен совпасть без перезапуска сервера.

## 6. Принятые решения и отклонения от плана

- Полный ISR HTML не включён: layout force-dynamic из этапа 5. Кэш — `unstable_cache` + тег `services`, как просил промт («ISR/revalidate или тег»).
- На карточке CTA — `PhoneLink` с иконкой телефона (вариант «или стрелка» из промта).
- Пустой список опубликованных услуг: секция с заголовком и текстом «позвоните», без выдуманных карточек.
- Превью админки для blob и заглушки использует один URL на оба размера — srcset не нужен.

## 7. Как проверить

1. `npm run dev`, открыть `/`. После Hero — «УСЛУГИ СЕРВИСА» / «Услуги сервиса» и карточки seed (заглушки, если фото не грузили).
2. Сетка: 375 px — 1 колонка; 768 — 2; ≥1280 — 3.
3. Кнопка «Позвонить» — `href` как в шапке (`phone_href`). Нет модалки, нет «Записаться», нет выбора услуги.
4. Hover: карточка поднимается, тень, фото чуть увеличивается.
5. Скрыть услугу в админке — на `/` её нет. Показать снова — появляется. Порядок ↑/↓ совпадает с сайтом.
6. Карточка без фото — заглушка 2:1, не битая картинка.
7. `/admin/services/new`: предпросмотр как на сайте, «Позвонить» не кликабельна; уведомление про заглушку остаётся.
8. В HTML карточек: `loading="lazy"`, `decoding="async"`, `width`/`height`, при фото — srcset 600/1200.
9. `npm run lint`, `npm run typecheck`, `npm run build`.

## 8. Ограничения и что нужно знать на следующих этапах

- Секции процесс / преимущества / отзывы / карта ещё заглушки якорей.
- Смена телефона в настройках (этап 10) должна по-прежнему сбрасывать тег `settings`; карточки берут номер из `getSettings()`, не из кэша услуг.
- Не добавлять форму записи и передачу «выбранной услуги».
- `ServiceCard` — единый вид для сайта и админки; не плодить второй макет.

---

## Карточка без фото, телефон, сброс кэша

- Пустое `Service.image` → `getServiceImageUrls` отдаёт `/images/service-placeholder.svg` на оба слота.
- «Позвонить» = `PhoneLink` с `phoneHref` из ключа `phone_href` (seed `tel:+79000000000`).
- Сброс: любой успешный POST/PUT/DELETE/PATCH publish/reorder в `/api/admin/services*` вызывает `revalidatePublicServices()` → `revalidateTag("services", "max")` + `revalidatePath("/")`.
