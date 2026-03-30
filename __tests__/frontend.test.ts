// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { AudioService } from '../src/app/AudioService';
import { bindRenderers } from '../src/app/render';
import { initI18n } from '../src/app/i18n';
import { StorageService } from '../src/app/StorageService';
import { createStore } from '../src/app/store';
import { createUiStore, initUI } from '../src/app/ui';
import { run } from '../src/index.js';
import enJson from '../src/translations/en.json';

const keys = (obj: object) => Object.keys(obj).sort();
const playMock = vi.fn();

vi.mock('@hawk.so/javascript', () => ({
  default: class HawkCatcher { },
}));

vi.mock('../src/app/AudioService.js', () => ({
  AudioService: class AudioService {
    play = playMock;
  },
}));

vi.mock('bootstrap', () => {
  class BootstrapComponent {
    hide() {
      return undefined;
    }

    dispose() {
      return undefined;
    }

    setContent() {
      return undefined;
    }

    static getInstance() {
      return null;
    }

    static getOrCreateInstance() {
      return new BootstrapComponent();
    }
  }

  return {
    Modal: BootstrapComponent,
    Popover: BootstrapComponent,
    Tooltip: BootstrapComponent,
  };
});

const html = readFileSync(resolve(process.cwd(), 'src/index.html'), 'utf-8');
const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
const bodyHtml = bodyMatch ? bodyMatch[1] : html;

const createTestApp = () => {
  const storageService = new StorageService({
    theme: 'light',
    locale: 'ru',
    tonic: 'C',
    intervalPattern: [2, 2, 1, 2, 2, 2, 1],
    modalShift: 0,
    contextOffset: 0,
    degreeRotation: 0,
    hiddenDegrees: [],
    startNotes: [
      { note: 'E', octave: 4 },
      { note: 'B', octave: 3 },
      { note: 'G', octave: 3 },
      { note: 'D', octave: 3 },
      { note: 'A', octave: 2 },
      { note: 'E', octave: 2 },
    ],
    activeScalePresetId: 1,
    activeFretboardPresetId: 6,
    isEnharmonicSimplify: false,
    intervalDisplayMode: 'digit',
    keyboardAudioStartOctave: 4,
  });
  const saved = storageService.selectAll();
  const i18nStore = initI18n(saved.locale, storageService);
  const uiStore = createUiStore(
    saved.theme,
    saved.isEnharmonicSimplify,
    saved.intervalDisplayMode,
    storageService,
  );
  const store = createStore(saved, storageService, i18nStore.stateLocale);
  const appStore = { ...store, ...uiStore, ...i18nStore };
  const audioService = new AudioService();
  const refs = initUI(appStore, audioService);

  bindRenderers(appStore, refs);

  return { appStore, refs };
};

describe('приложение запустилось', () => {
  beforeEach(() => {
    playMock.mockClear();
    localStorage.clear();
    document.body.innerHTML = bodyHtml;
  });

  afterEach(() => {
    playMock.mockClear();
    document.body.innerHTML = '';
    localStorage.clear();
  });

  test('язык переключается', async () => {
    const user = userEvent.setup();

    run();

    await screen.findByRole('heading', { level: 1, name: 'Мелодинатор' });

    const elLocaleSwitch = await screen.findByRole('button', { name: 'EN' });
    await user.click(elLocaleSwitch);

    await screen.findByRole('heading', { level: 1, name: 'Melodynator' });
  });

  test('тема переключается', async () => {
    const user = userEvent.setup();

    run();

    const elThemeSwitch = await screen.findByRole('button', { name: 'Переключить тему' });

    expect(document.body.dataset.bsTheme).toBe('light');

    await user.click(elThemeSwitch);

    expect(document.body.dataset.bsTheme).toBe('dark');
  });

  test('первая ступень скрывается и возвращается', async () => {
    const user = userEvent.setup();

    run();

    const elHideFirstDegree = <HTMLInputElement>await screen.findByRole('checkbox', { name: 'Скрыть 1 ступень' });
    const elScaleConfigurator = screen.getByRole('table', { name: 'Конфигуратор гаммы' });
    const elKeyboard = screen.getByRole('table', { name: 'Клавиатура' });
    const elFretboard = screen.getByRole('table', { name: 'Гриф' });

    expect(elHideFirstDegree.checked).toBe(false);
    expect(within(elScaleConfigurator).getByRole('checkbox', { name: 'Скрыть 1 ступень' })).toBe(elHideFirstDegree);
    expect(within(elKeyboard).queryAllByText('C').length).toBeGreaterThan(0);
    expect(within(elFretboard).queryAllByText('C').length).toBeGreaterThan(0);

    await user.click(elHideFirstDegree);

    expect(elHideFirstDegree.checked).toBe(true);
    expect(within(elKeyboard).queryAllByText('C')).toHaveLength(0);
    expect(within(elFretboard).queryAllByText('C')).toHaveLength(0);

    await user.click(elHideFirstDegree);

    expect(elHideFirstDegree.checked).toBe(false);
    expect(within(elKeyboard).queryAllByText('C').length).toBeGreaterThan(0);
    expect(within(elFretboard).queryAllByText('C').length).toBeGreaterThan(0);
  });

  test('ошибка резолва переводится', async () => {
    const user = userEvent.setup();

    run();

    const elScaleConfigurator = screen.getByRole('table', { name: 'Конфигуратор гаммы' });
    const elContextShiftUpButton = within(elScaleConfigurator).getByRole('button', { name: 'Контекст выше' });
    const elResolveError = screen.getByRole('alert');

    for (let i = 0; i < 6; i += 1) {
      await user.click(elContextShiftUpButton);
    }

    expect(elResolveError.textContent).toContain('Центр');
    expect(elResolveError.textContent).toContain('не входит в гамму');

    const elLocaleSwitch = await screen.findByRole('button', { name: 'EN' });
    await user.click(elLocaleSwitch);

    await waitFor(() => {
      expect(elResolveError.textContent).toContain('Center');
      expect(elResolveError.textContent).toContain('is not in the');
    });
  });
});

describe('клавиатура', () => {
  beforeEach(() => {
    playMock.mockClear();
    localStorage.clear();
    document.body.innerHTML = bodyHtml;
  });

  afterEach(() => {
    playMock.mockClear();
    document.body.innerHTML = '';
    localStorage.clear();
  });

  test('клавиши отрисованы как интерактивные', async () => {
    run();

    const elKeyboard = await screen.findByRole('table', { name: 'Клавиатура' });
    const elKeyboardKey = within(elKeyboard).getByRole('button', { name: 'C4' });

    expect(elKeyboardKey).toBeTruthy();
  });

  test('нажатие клавиши вызывает воспроизведение', async () => {
    const user = userEvent.setup();

    run();

    const elKeyboard = await screen.findByRole('table', { name: 'Клавиатура' });
    const elKeyboardKey = within(elKeyboard).getByRole('button', { name: 'C4' });

    await user.click(elKeyboardKey);

    expect(playMock).toHaveBeenCalledTimes(1);
    expect(playMock).toHaveBeenCalledWith({ pitchClass: 0, octave: 4 });
  });

  test('Enter на клавише вызывает воспроизведение', async () => {
    const user = userEvent.setup();

    run();

    const elKeyboard = await screen.findByRole('table', { name: 'Клавиатура' });
    const elKeyboardKey = within(elKeyboard).getByRole('button', { name: 'C4' });

    elKeyboardKey.focus();
    await user.keyboard('{Enter}');

    expect(playMock).toHaveBeenCalledTimes(1);
    expect(playMock).toHaveBeenCalledWith({ pitchClass: 0, octave: 4 });
  });

  test('смена октавы меняет параметр octave', async () => {
    const user = userEvent.setup();

    run();

    const elOctaveUpButton = await screen.findByRole('button', { name: 'Октава выше' });
    await user.click(elOctaveUpButton);

    const elKeyboard = await screen.findByRole('table', { name: 'Клавиатура' });
    const elKeyboardKey = within(elKeyboard).getByRole('button', { name: 'C5' });

    await user.click(elKeyboardKey);

    expect(playMock).toHaveBeenCalledTimes(1);
    expect(playMock).toHaveBeenCalledWith({ pitchClass: 0, octave: 5 });
  });
});

describe('гриф', () => {
  beforeEach(() => {
    playMock.mockClear();
    localStorage.clear();
    document.body.innerHTML = bodyHtml;
  });

  afterEach(() => {
    playMock.mockClear();
    document.body.innerHTML = '';
    localStorage.clear();
  });

  test('открытая струна отрисована как интерактивная', async () => {
    run();

    const elFretboard = await screen.findByRole('table', { name: 'Гриф' });
    const elFirstString = <HTMLTableRowElement>elFretboard.querySelector('tbody tr');
    const elOpenString = within(elFirstString).getByRole('button', { name: 'E4' });

    expect(elOpenString).toBeTruthy();
  });

  test('нажатие открытой струны вызывает воспроизведение', async () => {
    const user = userEvent.setup();

    run();

    const elFretboard = await screen.findByRole('table', { name: 'Гриф' });
    const elFirstString = <HTMLTableRowElement>elFretboard.querySelector('tbody tr');
    const elOpenString = within(elFirstString).getByRole('button', { name: 'E4' });

    await user.click(elOpenString);

    expect(playMock).toHaveBeenCalledTimes(1);
    expect(playMock).toHaveBeenCalledWith({ pitchClass: 4, octave: 4 });
  });

  test('пустой лад тоже вызывает воспроизведение', async () => {
    const user = userEvent.setup();

    run();

    const elFretboard = await screen.findByRole('table', { name: 'Гриф' });
    const elFirstString = <HTMLTableRowElement>elFretboard.querySelector('tbody tr');
    const elEmptyFret = within(elFirstString).getByRole('button', { name: 'F♯4' });

    await user.click(elEmptyFret);

    expect(playMock).toHaveBeenCalledTimes(1);
    expect(playMock).toHaveBeenCalledWith({ pitchClass: 6, octave: 4 });
  });

  test('Enter на ячейке грифа вызывает воспроизведение', async () => {
    const user = userEvent.setup();

    run();

    const elFretboard = await screen.findByRole('table', { name: 'Гриф' });
    const elFirstString = <HTMLTableRowElement>elFretboard.querySelector('tbody tr');
    const elOpenString = within(elFirstString).getByRole('button', { name: 'E4' });

    elOpenString.focus();
    await user.keyboard('{Enter}');

    expect(playMock).toHaveBeenCalledTimes(1);
    expect(playMock).toHaveBeenCalledWith({ pitchClass: 4, octave: 4 });
  });

  test('Space на ячейке грифа вызывает воспроизведение', async () => {
    const user = userEvent.setup();

    run();

    const elFretboard = await screen.findByRole('table', { name: 'Гриф' });
    const elFirstString = <HTMLTableRowElement>elFretboard.querySelector('tbody tr');
    const elOpenString = within(elFirstString).getByRole('button', { name: 'E4' });

    elOpenString.focus();
    await user.keyboard(' ');

    expect(playMock).toHaveBeenCalledTimes(1);
    expect(playMock).toHaveBeenCalledWith({ pitchClass: 4, octave: 4 });
  });

  test('после добавления струны новые ячейки интерактивны и звучат', async () => {
    const user = userEvent.setup();

    const { appStore } = createTestApp();

    appStore.addFretboardString();

    const elFretboard = await screen.findByRole('table', { name: 'Гриф' });
    const elStrings = elFretboard.querySelectorAll('tbody tr');
    const elLastString = <HTMLTableRowElement>elStrings[elStrings.length - 1];
    const elOpenString = within(elLastString).getByRole('button', { name: 'B1' });

    await user.click(elOpenString);

    expect(playMock).toHaveBeenCalledTimes(1);
    expect(playMock).toHaveBeenCalledWith({ pitchClass: 11, octave: 1 });
  });

  test('после удаления струны оставшиеся ячейки сохраняют правильные индексы', async () => {
    const user = userEvent.setup();

    const { appStore } = createTestApp();

    appStore.removeFretboardString(3);

    const elFretboard = await screen.findByRole('table', { name: 'Гриф' });
    const elStrings = elFretboard.querySelectorAll('tbody tr');
    const elFourthString = <HTMLTableRowElement>elStrings[3];
    const elOpenString = within(elFourthString).getByRole('button', { name: 'A2' });

    await user.click(elOpenString);

    expect(playMock).toHaveBeenCalledTimes(1);
    expect(playMock).toHaveBeenCalledWith({ pitchClass: 9, octave: 2 });
  });
});

describe('i18n', () => {
  const storageService = new StorageService({
    theme: 'light',
    locale: 'ru',
    tonic: 'C',
    intervalPattern: [2, 2, 1, 2, 2, 2, 1],
    modalShift: 0,
    contextOffset: 0,
    degreeRotation: 0,
    hiddenDegrees: [],
    startNotes: [{ note: 'C', octave: 4 }],
    activeScalePresetId: 1,
    activeFretboardPresetId: 1,
    isEnharmonicSimplify: false,
    intervalDisplayMode: 'digit',
    keyboardAudioStartOctave: 4,
  });
  const i18n = initI18n('ru', storageService);

  test('scaleParams: ключи совпадают с базовой локалью', () => {
    expect(keys(enJson.scaleParams)).toEqual(keys(i18n.textScaleParams.get()));
  });

  test('fretboard: ключи совпадают с базовой локалью', () => {
    expect(keys(enJson.fretboard)).toEqual(keys(i18n.textFretboard.get()));
  });

  test('content: ключи совпадают с базовой локалью', () => {
    expect(keys(enJson.content)).toEqual(keys(i18n.textContent.get()));
  });

  test('errors: ключи совпадают с базовой локалью', () => {
    expect(keys(enJson.errors)).toEqual(keys(i18n.textErrors.get()));
  });

  test('presetScale: ключи совпадают с базовой локалью', () => {
    expect(keys(enJson.presetScale)).toEqual(keys(i18n.textPresetScale.get()));
  });

  test('initial en locale: загружаются переведённые тексты', async () => {
    const enStorageService = new StorageService({
      theme: 'light',
      locale: 'en',
      tonic: 'C',
      intervalPattern: [2, 2, 1, 2, 2, 2, 1],
      modalShift: 0,
      contextOffset: 0,
      degreeRotation: 0,
      hiddenDegrees: [],
      startNotes: [{ note: 'C', octave: 4 }],
      activeScalePresetId: 1,
      activeFretboardPresetId: 1,
      isEnharmonicSimplify: false,
      intervalDisplayMode: 'digit',
      keyboardAudioStartOctave: 4,
    });
    const enI18n = initI18n('en', enStorageService);

    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (enI18n.textContent.get().pageTitle === enJson.content.pageTitle) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    expect(enI18n.textContent.get().pageTitle).toBe(enJson.content.pageTitle);
    expect(enI18n.textScaleParams.get().offset).toBe(enJson.scaleParams.offset);
    expect(enI18n.textFretboard.get().presetTuning).toBe(enJson.fretboard.presetTuning);
  });
});
