# Стандарты кодирования Melodynator

> **Формат примеров:** каждый `// ✗` сопровождается комментарием — что именно не так; каждый `// ✓` — почему так. Пара `✗/✓` обязательна: одиночный пример без противопоставления не добавлять.

---

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
const elFretboardStringFrets = refs.elFretboardStringFrets[stringIndex];
const elFretboardStringFret = elFretboardStringFrets[fretIndex - 1];
```

---

## 3. Архитектура файлов

### `store.ts` — состояние и действия

Содержит только nanostores-атомы и функции, меняющие их. **Не знает про HTML.**

Производные данные, которые описывают текущее состояние интерфейса или предметной модели, тоже живут здесь. Если `ui.ts` или `render.ts` нужны уже собранные данные вроде текущей хроматической гаммы или audio-ready layout, их источник — derived store, а не локальные вычисления в UI-слое.

### `domRefs.ts` — сбор DOM-ссылок

Единственное место, где вызываются `querySelector` / `querySelectorAll`. Экспортирует `getDomRefs(): t.domRefs` — функцию, которая собирает все ссылки на DOM-элементы и возвращает объект `domRefs`. Вызывается один раз в `src/index.ts`, результат передаётся в `ui.ts` и `render.ts`.

### `ui.ts` — DOM

Все обращения к DOM через поведение — только здесь. Получает готовый `domRefs` из `src/index.ts` и передаёт его в `render.ts`. Если `render.ts` нужен DOM-элемент — он должен приходить через `refs`, а не запрашиваться напрямую.

Весь DOM-контент создаётся через HTML-шаблоны (`<template>`). Создавать структурные DOM-элементы через `document.createElement` — антипаттерн: это возвращает компонентный подход, от которого проект намеренно отказался.

### Сервисные модули

Если модуль представляет автономный сервис с собственным публичным API, он оформляется как класс и файл называется по имени класса в `PascalCase`.

```typescript
// ✗ — утилитарное имя файла скрывает, что модуль экспортирует отдельный сервис
src/app/audio.ts
export class AudioService {}

// ✓ — файл и класс говорят об одной сущности
src/app/AudioService.ts
export class AudioService {}
```

Если сервис должен быть переносимым между проектами, его типы остаются рядом с ним, а не расползаются в общий `types/index.ts`.

```typescript
// ✗ — структура создаётся в JS
const elOpt = document.createElement('option');
elOpt.value = name;
elNoteSelect.appendChild(elOpt);

// ✓ — структура в <template>, JS клонирует
const elFretboardString = <HTMLTableRowElement>refs.elFretboardString.cloneNode(true);
```

Длинные `querySelector`-запросы оборачиваются в именованные функции — для семантики и удобства отладки:

```typescript
// ✗ — инлайн внутри forEach
refs.elFretboardStrings.forEach(elFretboardString => {
  elFretboardString.querySelector('[data-instrument="fretboard-string-number"]').textContent = ...
});

// ✓ — именованная функция
const getElFretboardStringNumberContainer = (elFretboardString: HTMLTableRowElement) =>
  qs<HTMLTableCellElement>('[data-instrument="fretboard-string-number"]', elFretboardString);
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
const elFretboardStringFrets = refs.elFretboardStringFrets[stringIndex];
const elFretboardStringFret = elFretboardStringFrets[fretIndex - 1];
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

DOM-выборка строится **только по `data`-атрибутам** предметной области — не по тегам, не по `id`, не по Bootstrap-классам. Атрибут `id` остаётся в HTML исключительно для `<label for>` (доступность). Это делает выборки независимыми от изменений разметки и библиотеки.

```typescript
// ✗ — по тегу, Bootstrap-классу или id
qs('td.form-select')
qs('.btn-outline-primary')
qs('#theme-toggle')

// ✓ — по data-атрибуту предметной области
qs('[data-container="tonic"]')
qs('[data-control="start-note"]', elFretboardString)
```

Исключение: Bootstrap JS-компоненты (Tooltip, Popover) инициализируются по `data-bs-*` — это их API, а не наша выборка.

**Неймспейсы `data`-атрибутов:**

| Атрибут | Назначение | Пример |
|---|---|---|
| `data-control` | Интерактивный элемент управления | `data-control="tonic-shift"` |
| `data-container` | Контейнер для отображения данных | `data-container="scale-tone"` |
| `data-instrument` | Элемент инструмента (фретборд, клавиатура) | `data-instrument="fretboard-string-fret"` |
| `data-static-content` | Статичный i18n-текст | `data-static-content="page-title"` |
| `data-tooltip` | Плейсхолдер для Bootstrap Tooltip | `data-tooltip="fretboard"` |
| `data-template` | `<template>`-элемент для клонирования | `data-template="fretboard-string"` |
| `data-select` | `<select>` внутри template-формы | `data-select="interval-step-value"` |
| `data-direction` | Кнопка направления (up/down) | `data-direction="up"` |

`.row` используется только вместе с `.col` — только для сетки Bootstrap. Для центрирования отдельных элементов — `mx-auto` (block-level) или `d-flex justify-content-center`. Таблицы шире вьюпорта оборачиваются в `overflow-x-auto`, не в `.row.justify-content-center` (flex-center шире вьюпорта выталкивает левый край в отрицательные координаты — недоступно без горизонтального скролла).

```html
<!-- ✗ — flex-center + wide content: левый край уходит за 0 -->
<div class="row m-0 justify-content-center">
  <table class="w-auto">...</table>
</div>

<!-- ✓ — mx-auto центрирует если влезает; overflow-x-auto даёт скролл вправо если нет -->
<div class="overflow-x-auto">
  <table class="w-auto mx-auto">...</table>
</div>
```

### Именование `data`-атрибутов и их значений

`data`-атрибут определяет семантический неймспейс — роль элемента в предметной области. Значение называет конкретную музыкальную сущность в kebab-case.

```html
<!-- ✗ — атрибут generic, не выражает роль; значение описывает позицию, а не сущность -->
<button data-btn="shift-left">
<td data-cell="col-3">
<td data-node="string-fret">

<!-- ✓ — атрибут: неймспейс (контрол / контейнер / инструмент)
         значение: музыкальная сущность в kebab-case -->
<button data-control="tonic-shift">
<td data-container="interval-step">
<td data-instrument="fretboard-string-note">
```

Значение обрабатывается целиком — `fretboard-string-note` конвертируется в `fretboardStringNote`.

---

## 5. Начальные значения и хранилище

### StorageService

`StorageService` в `src/app/StorageService.ts` — единственная абстракция над хранилищем. Инкапсулирует работу с `localStorage` и предоставляет типизированный API:

- `select(key)` — читает значение по ключу; при отсутствии записывает дефолт и возвращает его
- `insert(key, value)` — записывает значение
- `selectAll()` — читает все ключи из `t.savedValues`

Создаётся один раз в `src/index.ts` с дефолтными значениями и передаётся в `createStore`, `createUiStore`, `initI18n`. Начальное состояние — `storageService.selectAll()`.

**Чтение** — только через `storageService.selectAll()` в `src/index.ts`. Сторы не читают localStorage напрямую.

**Запись** — через подписку `listen` в момент изменения стора. Так же, как с любым другим side-эффектом состояния.

```typescript
// ✗ — прямое обращение к localStorage в сторе
if (typeof localStorage !== 'undefined') {
  stateTheme.listen(v => localStorage.setItem('theme', v));
}

// ✗ — запись в storage внутри action-функции (смешение уровней)
const toggleTheme = () => {
  themeStore.set(newTheme);
  storageService.insert('theme', newTheme); // storage-логика в action
};

// ✓ — listen отделяет персистентность от action
const themeStore = n.atom<t.uiTheme>(saved.theme);
themeStore.listen(v => storageService.insert('theme', v));

const toggleTheme = () => {
  themeStore.set(themeStore.get() === 'dark' ? 'light' : 'dark');
};
```

`StorageService` корректно работает в не-браузерном окружении: при отсутствии `localStorage` использует `Map` в памяти. Код снаружи об этом не знает.

---

## 6. Интернационализация (i18n)

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
// ✗ — неверный префикс; название не отражает namespace
export const scaleParamsTexts = i18n('scaleParams', { ... });
export const i18nContent = i18n('content', { ... });

// ✓ — префикс text + namespace как суффикс
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

// ✓ — subscribe() повторяет обновление при каждой смене локали
textScaleParams.subscribe((texts) => {
  refs.elScaleParamsOffset.textContent = texts.offset;
});
```

**`get()`** — в `ui.ts`, когда текст нужен разово при создании компонента. Допустимо только там, где компонент пересоздаётся при каждой смене локали — тогда `get()` всегда возвращает актуальное значение:

```typescript
// ✗ — get() при инициализации вне пересоздающего контекста: при смене локали не обновится
refs.elFretboard.ariaLabel = textFretboard.get().openNoteLabel;

// ✓ — get() внутри content(): вызывается при каждом show(), popover пересоздаётся на каждую смену локали
const makePopover = () => new Popover(el, {
  content: () => {
    const fretboardTexts = textFretboard.get();
    elNoteSelect.ariaLabel = fretboardTexts.openNoteLabel;
    return elContent;
  },
});
```

### Bootstrap-компоненты с переводимым текстом

**Tooltip.** Bootstrap проверяет наличие контента через `getTitle()` — читает конфиг `title` или атрибут `data-bs-title`. Если оба пустые при инициализации, tooltip не покажется даже после `setContent()`. Поэтому tooltip с i18n-текстом инициализируется отдельно, с явным `title`:

```typescript
// ✗ — без title; getTitle() пустой, tooltip не отобразится
refs.elTooltipTriggers.forEach((el) => new Tooltip(el));
Tooltip.getInstance(el).setContent({ '.tooltip-inner': text });

// ✓ — title задан при инициализации; setContent() обновляет при смене локали
const scaleParamsTexts = textScaleParams.get();
const instance = new Tooltip(el, { title: scaleParamsTexts.degreesTooltip });
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
// ✗ — ноты универсальны, добавлять их в i18n — ошибка
textFretboard = i18n('fretboard', { noteC: 'до', noteD: 'ре', ... });

// ✓ — ноты используются напрямую как константы предметной области
elOpt.textContent = name; // name: noteName = 'C' | 'C♯' | ...
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
// ✗ — хардкод вместо text-стора: при смене локали не обновится
const elForm = refs.elFretboardNewStringNoteParams.cloneNode(true);
elNoteSelect.ariaLabel = 'Открытая нота';

// ✓ — текст из text-стора: всегда актуален при каждом клонировании
const elForm = refs.elFretboardNewStringNoteParams.cloneNode(true);
const fretboardTexts = textFretboard.get();
elNoteSelect.ariaLabel = fretboardTexts.openNoteLabel;
```

### `aria-*` и семантика интерфейса

`aria`-атрибуты в Melodynator нужны не «для галочки», а для двух конкретных целей:

1. чтобы интерфейс был понятен assistive-технологиям;
2. чтобы frontend-тесты можно было писать по ролям и именам (`Testing Library way`), а не по внутренним `data-*` и DOM-структуре.

Приоритет такой:
- если HTML уже даёт хорошую нативную семантику — используем её;
- если визуал не должен меняться, но элементу нужно доступное имя — добавляем `aria-label`;
- имя должно описывать **музыкальный смысл действия**, а не направление в пикселях и не реализацию.

Для стрелок `data-direction="up/down"` семантика задаётся не как `left/right`, а как **выше/ниже** в предметной области: выше тональность, выше модальность, выше пресет, выше количество струн и т.п.

```html
<!-- ✗ — стрелка названа по геометрии, а не по музыкальному смыслу -->
<button data-control="context-shift" data-direction="up" aria-label="Сдвинуть контекст вправо">→</button>

<!-- ✓ — имя выражает предметное действие -->
<button data-control="context-shift" data-direction="up" aria-label="Контекст выше">→</button>
```

```html
<!-- ✗ — без имени: в тестах и для screen reader это просто button -->
<button data-control="tonic-shift" data-direction="down">←</button>

<!-- ✓ — короткое и предметное имя -->
<button data-control="tonic-shift" data-direction="down" aria-label="Тоника ниже">←</button>
```

Крупные зоны интерфейса, с которыми работает пользователь и frontend-тесты, получают доступные имена без изменения визуала — обычно через `aria-label`.

```html
<!-- ✗ — таблица без имени, тесты вынуждены искать её по data-атрибутам -->
<table data-instrument="keyboard">...</table>

<!-- ✓ — таблица имеет доступное имя; тесты ищут её по role="table" -->
<table data-instrument="keyboard" aria-label="Клавиатура">...</table>
```

Динамические сообщения состояния и ошибок должны иметь роль, соответствующую их характеру. Для ошибок, которые должны быть объявлены сразу, используем `role="alert"`.

```html
<!-- ✗ — просто span: screen reader не знает, что это важное сообщение -->
<span data-container="resolve-error"></span>

<!-- ✓ — доступное сообщение об ошибке -->
<span data-container="resolve-error" role="alert"></span>
```

`aria-label` не подменяет содержимое интерфейса и не дублирует всё подряд. Не нужно навешивать его на каждый элемент “на всякий случай”. Если элемент уже имеет корректное имя через `<label>`, текст кнопки или нативную роль — этого достаточно.

```html
<!-- ✗ — лишнее дублирование -->
<input id="switch-degree-1" aria-label="1 ступень" />
<label for="switch-degree-1">1</label>

<!-- ✓ — aria-label нужен только когда требуется более точный смысл -->
<input id="switch-degree-1" aria-label="Скрыть 1 ступень" />
<label for="switch-degree-1">1</label>
```

Если имя должно меняться вместе с локалью — источник текста берётся из `text`-стора, так же как для `textContent`. Не хардкодить переводимые `aria-label` в JS-логике, если они не являются сознательно зафиксированной технической семантикой для тестов.

Если в новой разметке есть интерактивный элемент или крупная зона интерфейса, которую в тестах приходится искать по `data-*` или по хрупкой DOM-структуре, — предложи автору добавить уместный `aria`-атрибут. Это не означает «размечать всё подряд», а только усиливать семантику там, где она реально улучшает доступность и тестируемость.

---

## 7. Проверка

Перед тем как считать задачу выполненной: `make check` — без ошибок линтера, typescript, тесты зелёные
