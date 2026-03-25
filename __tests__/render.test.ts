import { atom } from 'nanostores';
import { describe, expect, test } from 'vitest';
import { bindRenderers } from '../src/app/render';
import { initI18n } from '../src/app/i18n';
import { StorageService } from '../src/app/StorageService';
import { createStore } from '../src/app/store';
import * as c from '../src/constants';
import * as d from '../src/constants/defaults';
import enJson from '../src/translations/en.json';
import * as t from '../src/types';

class FakeClassList {
  private classNames = new Set<string>();

  add(...classNames: string[]) {
    classNames.forEach((className) => this.classNames.add(className));
  }

  remove(...classNames: string[]) {
    classNames.forEach((className) => this.classNames.delete(className));
  }

  toggle(className: string, force?: boolean) {
    if (force === undefined) {
      if (this.classNames.has(className)) {
        this.classNames.delete(className);
        return false;
      }
      this.classNames.add(className);
      return true;
    }

    if (force) {
      this.classNames.add(className);
      return true;
    }

    this.classNames.delete(className);
    return false;
  }

  forEach(callback: (className: string) => void) {
    this.classNames.forEach((className) => callback(className));
  }

  contains(className: string) {
    return this.classNames.has(className);
  }
}

type fakeElement = {
  textContent: string
  disabled: boolean
  value: string
  id: string
  dataset: Record<string, string>
  classList: FakeClassList
};

const createFakeElement = (params: Partial<fakeElement> = {}): fakeElement => ({
  textContent: '',
  disabled: false,
  value: '',
  id: '',
  dataset: {},
  classList: new FakeClassList(),
  ...params,
});

const createSavedValues = (): t.savedValues => ({
  theme: 'light',
  locale: 'ru',
  tonic: 'C',
  intervalPattern: [2, 2, 1, 2, 2, 2, 1],
  modalShift: 0,
  contextOffset: 0,
  degreeRotation: 0,
  hiddenDegrees: [],
  startNotes: [{ note: 'C', octave: 4 }],
  activeScalePresetId: d.DEFAULT_SCALE_PRESET_ID,
  activeFretboardPresetId: 1,
  isEnharmonicSimplify: false,
  intervalDisplayMode: 'digit',
});

const createDomRefs = (): t.domRefs => {
  const elIntervalContainers = Array.from({ length: 8 }, () => createFakeElement());
  const elSetIntervalSteps = Array.from({ length: 7 }, () => createFakeElement());
  const elScaleToneContainers = Array.from({ length: 8 }, () => createFakeElement());
  const elDegreeSwitchContainers = Array.from({ length: 7 }, (_, index) => createFakeElement({ value: `${index + 1}`, id: `degree-${index + 1}` }));
  const elDegreeSwitchLabels = Array.from({ length: 7 }, () => createFakeElement());
  const elKeyboardNotes = Array.from({ length: 13 }, () => createFakeElement());
  const elFretboardStartNoteContainers = [createFakeElement()];
  const elFretboardStringFrets = [Array.from({ length: 12 }, () => createFakeElement())];
  const elDirectionControllers = [
    createFakeElement({ dataset: { control: 'tonic-shift' } }),
    createFakeElement({ dataset: { control: 'modal-shift' } }),
    createFakeElement({ dataset: { control: 'context-shift' } }),
    createFakeElement({ dataset: { control: 'degree-rotation' } }),
  ];

  return <t.domRefs><unknown>{
    elBody: { dataset: {} },
    elThemeSwitch: createFakeElement(),
    elLocaleSwitch: createFakeElement(),
    elTooltipTemplate: {},
    elTooltipPlaceholders: [],
    elStaticContentElements: [],
    elDirectionControllers,
    elResolveErrorContainer: createFakeElement(),
    elTonicContainer: createFakeElement(),
    elContextContainer: createFakeElement(),
    elIntervalContainers,
    elSetIntervalSteps,
    elIntervalDisplaySwitch: createFakeElement(),
    elIntervalStepParams: {},
    elEnharmonicSimplifySwitch: createFakeElement(),
    elScaleToneContainers,
    elDegreeSwitchContainers,
    elDegreeSwitchLabels,
    elKeyboardNotes,
    elFretboard: {},
    elFretboardStrings: [],
    elFretboardStartNoteContainers,
    elFretboardStringFrets,
    elFretboardString: {},
    elFretboardNewStringNoteParams: {},
    elAddFretboardString: createFakeElement(),
    elAddFretboardStringConfirm: createFakeElement(),
    elRemoveFretboardStringConfirm: createFakeElement(),
    getElFretboardStringNumberButton: () => <HTMLButtonElement><unknown>createFakeElement(),
    getElFretboardStartNoteContainer: () => <HTMLButtonElement><unknown>createFakeElement(),
    getElFretboardStringFrets: () => [],
    getElIntervalStepSelect: () => <HTMLSelectElement><unknown>createFakeElement(),
    getElFretboardStringNoteSelect: () => <HTMLSelectElement><unknown>createFakeElement(),
    getElFretboardNoteOctaveSelect: () => <HTMLSelectElement><unknown>createFakeElement(),
  };
};

const createUiStore = (): t.uiStore => {
  const theme = atom<t.uiTheme>('light');
  const stateIntervalDisplayMode = atom<t.intervalDisplayMode>('digit');
  const stateIsEnharmonicSimplify = atom<boolean>(false);

  return {
    theme,
    toggleTheme: () => {
      theme.set(theme.get() === 'dark' ? 'light' : 'dark');
    },
    stateIntervalDisplayMode,
    switchIntervalDisplayMode: () => {
      stateIntervalDisplayMode.set(stateIntervalDisplayMode.get() === 'digit' ? 'letter' : 'digit');
    },
    stateIsEnharmonicSimplify,
    switchEnharmonicSimplify: () => {
      stateIsEnharmonicSimplify.set(!stateIsEnharmonicSimplify.get());
    },
  };
};

const waitFor = async (assertion: () => boolean) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (assertion()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error('Condition was not met in time');
};

const createRenderContext = () => {
  const storageService = new StorageService(createSavedValues());
  const saved = storageService.selectAll();
  const i18nStore = initI18n(saved.locale, storageService);
  const store = createStore(saved, storageService, i18nStore.stateLocale);
  const uiStore = createUiStore();
  const appStore = { ...store, ...uiStore, ...i18nStore };
  const refs = createDomRefs();

  bindRenderers(appStore, refs);

  return { appStore, refs };
};

describe('bindRenderers', () => {
  test('hiddenDegrees rerenders keyboard and fretboard without recomputing resolvedScaleParams', () => {
    const { appStore, refs } = createRenderContext();

    const resolvedScaleParams = appStore.stateResolvedScaleParams.get();

    expect(refs.elKeyboardNotes[0].textContent).toBe('C');
    expect(refs.elFretboardStartNoteContainers[0].textContent).toBe('C');

    appStore.switchDegreeVisibility(1);

    expect(appStore.stateResolvedScaleParams.get()).toBe(resolvedScaleParams);
    expect(refs.elKeyboardNotes[0].textContent).toBe(c.EMPTY_VALUE);
    expect(refs.elFretboardStartNoteContainers[0].textContent).toBe(c.EMPTY_VALUE);
    expect(refs.elDegreeSwitchLabels[0].classList.contains('text-secondary')).toBe(true);

    appStore.switchDegreeVisibility(1);

    expect(refs.elKeyboardNotes[0].textContent).toBe('C');
    expect(refs.elFretboardStartNoteContainers[0].textContent).toBe('C');
    expect(refs.elDegreeSwitchLabels[0].classList.contains('text-secondary')).toBe(false);
  });

  test('resolve error text updates on state change and locale switch', async () => {
    const { appStore, refs } = createRenderContext();

    appStore.offsetContext(6);

    const resolvedScaleParams = appStore.stateResolvedScaleParams.get();
    const { tonic } = appStore.stateScaleBuildParams.get();
    const targets = resolvedScaleParams.contextTargets.join('/');
    const expectedRu = appStore.textErrors.get().resolveError({ note: tonic, targets });

    expect(refs.elResolveErrorContainer.textContent).toBe(expectedRu);

    appStore.switchLocale();

    await waitFor(() => appStore.textErrors.get().openPatternError === enJson.errors.openPatternError);

    const expectedEn = appStore.textErrors.get().resolveError({ note: tonic, targets });
    await waitFor(() => refs.elResolveErrorContainer.textContent === expectedEn);

    expect(expectedEn).not.toBe(expectedRu);
    expect(refs.elResolveErrorContainer.textContent).toBe(expectedEn);
  });

  test('applyScalePreset applies preset values and keeps unrelated state intact', () => {
    const { appStore } = createRenderContext();

    appStore.applyScalePreset(18);

    expect(appStore.stateScaleBuildParams.get()).toEqual({
      tonic: 'A',
      intervalPattern: [2, 2, 1, 2, 2, 2, 1],
      modalShift: 5,
    });
    expect(appStore.stateContextOffset.get()).toBe(0);
    expect(appStore.stateDegreeRotation.get()).toBe(0);
    expect([...appStore.stateHiddenDegrees.get()]).toEqual([2, 6]);
    expect(appStore.stateActiveScalePresetId.get()).toBe(18);
    expect(appStore.stateLocale.get()).toBe('ru');
    expect(appStore.theme.get()).toBe('light');
    expect(appStore.stateIntervalDisplayMode.get()).toBe('digit');
    expect(appStore.stateIsEnharmonicSimplify.get()).toBe(false);
    expect(appStore.stateActiveFretboardPresetId.get()).toBe(1);
  });

  test.each([
    ['offsetTonicShift', (appStore: t.appStore) => appStore.offsetTonicShift(1)],
    ['offsetModalShift', (appStore: t.appStore) => appStore.offsetModalShift(1)],
    ['offsetDegreeRotation', (appStore: t.appStore) => appStore.offsetDegreeRotation(1)],
    ['offsetContext', (appStore: t.appStore) => appStore.offsetContext(1)],
    ['setIntervalStep', (appStore: t.appStore) => appStore.setIntervalStep({ degree: 1, step: 1 })],
    ['switchDegreeVisibility', (appStore: t.appStore) => appStore.switchDegreeVisibility(1)],
  ])('%s resets activeScalePresetId after apply', (_actionName, mutateScale) => {
    const { appStore } = createRenderContext();

    appStore.applyScalePreset(18);
    mutateScale(appStore);

    expect(appStore.stateActiveScalePresetId.get()).toBe(c.NO_ACTIVE_PRESET_ID);
  });
});
