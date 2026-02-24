# Стандарты кодирования Melodynator

## 1. Основная концепция

Melodynator — инструмент для музыкантов. Код читается на языке музыканта: «вращение ступеней», «тональное смещение», «лад», «гамма». Если написано `offsetDegreeRotation` — это вращение ступеней, а не манипуляция индексами или DOM.

Это правило распространяется на весь именуемый код: состояния, действия, типы, атрибуты HTML. Инфраструктурные слои (DOM, atoms) не скрываются, но их названия используют предметную терминологию.

**Роли в проекте.** Музыкальный теоретик (автор) задаёт терминологию и утверждает имена. Программист (человек или ИИ) реализует по этой спецификации. Если кажется, что термин можно улучшить или уточнить — это предложение, которое выносится на обсуждение с автором. Самостоятельно переименовывать нельзя: сначала обсуждение, потом обновление спецификации (типы, `naming.yaml`), потом код.

Краткость предпочтительна точности там, где краткое название остаётся понятным.

---

## 2. Нейминг

### Специфичность

Называем то, что **существует сейчас**, а не то, что может появиться. Если реализован фретборд — это `fretboard`, не `instrument`. Если абстракция действительно универсальна (работает для любого инструмента, как `scaleLayout`) — называем абстрактно.

```typescript
// ✗
stateInstrumentParams     // абстракция без реализации

// ✓
stateFretboardStartNotes  // конкретно: струны фретборда
scaleLayout               // универсально: любой инструмент
```

### Префиксы

| Что | Правило | Пример |
|---|---|---|
| DOM-элемент | `el` prefix | `elFretboard`, `elTonicContainer` |
| Nanostores atom | `state` prefix | `stateFretboardStrings`, `stateHiddenDegrees` |
| i18n text atom | `text` prefix | `textScaleParams`, `textFretboard`, `textContent`, `textErrors` |
| Значение по умолчанию | `default` prefix | `defaultScaleBuildParams` |
| Действие над состоянием | глагол + объект | `offsetTonicShift`, `switchDegreeVisibility`, `setFretboardStringParams` |
| Параметры / данные | существительное + суффикс | `scaleBuildParams`, `resolvedScaleParams`, `fretboardStartNoteParams` |

Актуальный реестр имён — в [`naming.yaml`](./naming.yaml). При добавлении новых сущностей обновлять его.

Все типы — в `src/types/index.ts`. Это единственный источник правды по типам.

### Источник именования переменных

Имена переменных в `render.ts` (и везде, где работаем с данными) берутся из **типов**, а не из позиции в DOM. Корень берётся буквально из имени типа — без синонимов и «улучшений». Позиция в массиве или разметке не является основанием для имени.

| Тип | Переменная |
|---|---|
| `fretboardStartNoteParams` | `startNote` |
| `fretboardNoteParams` | `noteParams` |
| `resolvedScaleParams` | `resolvedScaleParams` |

Если кажется, что другой термин точнее — это повод для обсуждения с автором (см. раздел 1), а не для самостоятельной замены.

```typescript
// ✗ — позиционное имя; синоним вместо корня типа
const fret0Cell = cells[1];
startNotes.forEach((openNote, stringIndex) => { ... });

// ✓ — корень типа fretboardStartNoteParams / fretboardNoteParams
startNotes.forEach((startNote, stringIndex) => { ... });
const fretNote = refs.elFretboardStringFrets[stringIndex][fretIndex - 1];
```

---

## 3. Архитектура файлов

### `store.ts` — состояние и действия

Содержит только nanostores-атомы и функции, меняющие их. **Не знает про HTML.**

### `ui.ts` — DOM

Все обращения к DOM — только здесь. `querySelector` — только здесь. Формирует `domRefs` и передаёт его в `render.ts`. Если `render.ts` нужен DOM-элемент — он должен приходить через `refs`, а не запрашиваться напрямую.

Весь DOM-контент создаётся через HTML-шаблоны (`<template>`). Создавать структурные DOM-элементы через `document.createElement` — антипаттерн: это возвращает компонентный подход, от которого проект намеренно отказался.

```typescript
// ✗ — структура создаётся в JS
const opt = document.createElement('option');
opt.value = name;
noteSelect.appendChild(opt);

// ✓ — структура в <template>, JS клонирует
const elFretboardString = <HTMLTableRowElement>refs.elFretboardString.cloneNode(true);
```

Длинные `querySelector`-запросы оборачиваются в именованные функции — для семантики и удобства отладки:

```typescript
// ✗ — инлайн внутри forEach
refs.elFretboardStrings.forEach(elFretboardString => {
  elFretboardString.querySelector('[data-instrument="fretboard__string-number"]').textContent = ...
});

// ✓ — именованная функция
const getElFretboardStringNumberContainer = (elFretboardString: HTMLTableRowElement) =>
  qs<HTMLTableCellElement>('[data-instrument="fretboard__string-number"]', elFretboardString);
```

### `render.ts` — отрисовка

Читает состояние из `store`, обновляет DOM через `refs`. **Не мутирует состояние.**

**Никакого DOM-обращения** — ни `querySelector`, ни `querySelectorAll`, ни `children`, ни `parentNode`, ни любого другого DOM API. Весь доступ к конкретным элементам — исключительно через `refs`, подготовленные в `ui.ts`.

```typescript
// ✗ — DOM-обращение в render.ts
const cells = row.querySelectorAll('td');
const fret0Cell = cells[1];
const btn = fret0Cell.querySelector('button');

// ✓ — только через refs
const elFretboardStartNoteContainer = refs.elFretboardStartNoteContainers[stringIndex];
const fretNote = refs.elFretboardStringFrets[stringIndex][fretIndex - 1];
```

**Именование переменных** — только из предметной области (типы в `types/index.ts`). Позиционные имена (`fret0`, `cells[i]`) запрещены — они называют место в реализации, а не концепцию.

---

## 4. Стиль кода

### TypeScript

Запрещены:
- **Non-null assertions (`!`)**: если элемент может отсутствовать — используй `if`. Если тип точно известен — используй явный каст.
- **Опциональные цепочки (`?.`)**: если отсутствие значения нормально — используй `if`. Опциональная цепочка скрывает намерение.

```typescript
// ✗ — ! и ?. скрывают намерение
const elStartNoteButton = qs('[data-control="start-note"]', elFretboardString)!;
const name = params?.note;

// ✓ — явный каст и явный if
const elStartNoteButton = <HTMLButtonElement>qs('[data-control="start-note"]', elFretboardString);
if (params) { const { note } = params; }
```

### Выражения

Не инлайнить вложенные вызовы — бить на именованные константы:

```typescript
// ✗ — вложенный вызов в одном выражении
const layout = mu.mapScaleToLayout({ scaleMap, startNotes: [params.startNotes[i]] })[0];

// ✓ — промежуточные константы
const startNote = params.startNotes[i];
const [layout] = mu.mapScaleToLayout({ scaleMap, startNotes: [startNote] });
```

### Bootstrap

Разметка и стилизация строятся на Bootstrap — без inline-стилей и без `!important` в CSS.

Расширение Bootstrap — только через его механизмы:
- SCSS-переменные и карты (`$theme-colors`) — для новых цветов и токенов
- CSS custom properties (`--bs-*`) — для переопределения компонентных значений в конкретном контексте
- Утилитарные классы — по образцу Bootstrap (`width-30px`, а не `myWidth`)

```scss
// ✗ — цвет вне системы
.fret { background: #86efac; }

// ✓ — расширяем через Bootstrap-карту
$theme-colors: map-merge($theme-colors, (
  "octave-4": $green-300,
));
```

DOM-выборка строится по `id` или `data`-атрибутам с именами из предметной области — не по тегам, не по Bootstrap-классам. Это делает выборки независимыми от изменений разметки и библиотеки.

```typescript
// ✗ — по тегу или Bootstrap-классу
qs('td.form-select')
qs('.btn-outline-primary')

// ✓ — по data-атрибуту предметной области
qs('[data-container="tonic"]')
qs('[data-control="start-note"]', elFretboardString)
```

Исключение: Bootstrap JS-компоненты (Tooltip, Popover) инициализируются по `data-bs-*` — это их API, а не наша выборка.

### BEM в значениях `data`-атрибутов

Значения `data`-атрибутов предметной области именуются по BEM: `block__element`. `-` разделяет слова внутри блока или элемента, `__` (двойное подчёркивание) — блок от элемента.

```html
<!-- ✗ — принадлежность к блоку не видна, блоком назначено слишком общее слово -->
<tr data-instrument="fretboard-string">
<td data-instrument="content__fretboard-string-note">

<!-- ✓ — block__element читается сразу -->
<tbody data-instrument="fretboard">
<tr data-instrument="fretboard__string">
<td data-instrument="fretboard__string-note">
```

`__` — семантика имени, а не разделитель, который парсится в коде. Значение обрабатывается целиком — `pseudo-header__configurator` конвертируется в `pseudoHeaderConfigurator`.

---

## 5. Интернационализация (i18n)

### Архитектура

Весь i18n-код живёт в `src/app/i18n.ts`. Он не знает про DOM, не инициализирует Bootstrap-компоненты и не зависит от состояния приложения. Это позволяет импортировать text-сторы в `ui.ts` и `render.ts` без циклических зависимостей.

| Файл | Роль |
|---|---|
| `i18n.ts` | `locale`, `i18n` factory, все text-сторы |
| `ui.ts` | Инициализация Bootstrap-компонентов с i18n-текстом |
| `render.ts` | Подписки text-сторов → обновление DOM через refs |

### Text-сторы

Text-сторы — атомы, значение которых обновляется при смене локали. Называются с префиксом `text`, суффикс — namespace:

```typescript
// ✗
export const scaleParamsTexts = i18n('scaleParams', { ... }); // неверный префикс
export const i18nContent = i18n('content', { ... });           // нет отражения namespace

// ✓
export const textScaleParams = i18n('scaleParams', { ... });
export const textContent = i18n('content', { ... });
```

Дефолтные строки в `i18n()` — это русский текст (базовая локаль). Переводы в `src/translations/en.json` должны содержать те же ключи.

### Чтение текста

**`subscribe()`** — в `render.ts`, когда DOM обновляется реактивно при смене локали:

```typescript
// ✗ — однократное чтение: при смене языка не обновится
const texts = textScaleParams.get();
refs.elScaleParamsOffset.textContent = texts.offset;

// ✓
textScaleParams.subscribe((texts) => {
  refs.elScaleParamsOffset.textContent = texts.offset;
});
```

**`get()`** — в `ui.ts`, когда текст нужен разово при создании компонента. Допустимо только там, где компонент пересоздаётся при каждой смене локали — тогда `get()` всегда возвращает актуальное значение:

```typescript
// ✓ — в content() popover: вызывается при каждом show(), popover пересоздаётся на каждую смену локали
const fretboardTexts = textFretboard.get();
noteSelect.ariaLabel = fretboardTexts.openNoteLabel;
```

### Bootstrap-компоненты с переводимым текстом

**Tooltip.** Bootstrap проверяет наличие контента через `getTitle()` — читает конфиг `title` или атрибут `data-bs-title`. Если оба пустые при инициализации, tooltip не покажется даже после `setContent()`. Поэтому tooltip с i18n-текстом инициализируется отдельно, с явным `title`:

```typescript
// ✗ — без title; getTitle() пустой, tooltip не отобразится
refs.elTooltipTriggers.forEach((el) => new Tooltip(el));
Tooltip.getInstance(el).setContent({ '.tooltip-inner': text });

// ✓ — title задан при инициализации; setContent() обновляет при смене локали
const instance = new Tooltip(el, { title: textScaleParams.get().degreesTooltip });
textScaleParams.subscribe((texts) => {
  instance.setContent({ '.tooltip-inner': texts.degreesTooltip });
});
```

Bootstrap не обрабатывает события мыши на SVG-элементах надёжно. Если tooltip привязан к иконке — оборачивай SVG в `<button>`.

**Popover.** После первого `show()` Bootstrap кеширует DOM в `this._tip` и не вызывает `content()` повторно. При смене локали нужно уничтожить экземпляр и создать новый:

```typescript
// ✗ — Bootstrap возьмёт кешированный DOM, content() не перезапустится
textFretboard.subscribe(() => { popover.hide(); });

// ✓ — dispose() очищает кеш; makePopover() создаёт свежий экземпляр
const makePopover = () => new Popover(el, { content: () => { ... } });
textFretboard.subscribe(() => {
  const existing = Popover.getInstance(el);
  if (existing) existing.dispose();
  makePopover();
});
```

При закрытии popover через `hide()` — получай экземпляр через `Popover.getInstance()`, а не через замыкание над переменной: после `dispose()` и `makePopover()` переменная указывает на старый объект.

### Что не переводится

Нотация нот (`C D E F G A B ♭ ♯`) — интернациональна. Добавлять её в переводы — ошибка.

```typescript
// ✗
textFretboard = i18n('fretboard', { noteC: 'до', noteD: 'ре', ... });

// ✓ — ноты используются напрямую как константы предметной области
opt.textContent = name; // name: noteName = 'C' | 'C♯' | ...
```

### Текст не в HTML

Переводимый текст не хранится в HTML. Исходники строк — JSON-файлы переводов и дефолты в `i18n.ts`. HTML содержит только `data-content` как точку привязки для refs.

```html
<!-- ✗ — текст в HTML дублирует источник правды и не обновляется при смене локали -->
<h1 data-content="page-title">Гаммы и аккорды онлайн</h1>

<!-- ✓ — textContent устанавливается из textContent store -->
<h1 data-content="page-title"></h1>
```

Это распространяется и на `<template>`: переводимый текст не кладётся в разметку шаблона. После клонирования — устанавливать `textContent` и `ariaLabel` из text-стора до вставки в DOM.

```typescript
// ✗ — текст захардкожен в шаблоне, при смене локали не обновится
const form = refs.elFretboardNewStringNoteParams.cloneNode(true);

// ✓ — текст устанавливается после клонирования из актуального text-стора
const form = refs.elFretboardNewStringNoteParams.cloneNode(true);
const fretboardTexts = textFretboard.get();
noteSelect.ariaLabel = fretboardTexts.openNoteLabel;
```

---

## 6. Проверка

Перед тем как считать задачу выполненной:

1. `npm run lint` — без ошибок
2. `npm test` — тесты зелёные
3. `npm start` — приложение запускается, базовая функциональность работает
