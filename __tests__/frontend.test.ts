// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { initI18n } from '../src/app/i18n';
import { StorageService } from '../src/app/StorageService';
import { run } from '../src/index.js';
import enJson from '../src/translations/en.json';

const keys = (obj: object) => Object.keys(obj).sort();

vi.mock('@hawk.so/javascript', () => ({
  default: class HawkCatcher { },
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

describe('приложение запустилось', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = bodyHtml;
  });

  afterEach(() => {
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
