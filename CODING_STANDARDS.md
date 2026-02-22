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

---

## 5. Проверка

Перед тем как считать задачу выполненной:

1. `npm run lint` — без ошибок
2. `npm test` — тесты зелёные
3. `npm start` — приложение запускается, базовая функциональность работает
