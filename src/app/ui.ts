import { Popover, Tooltip } from 'bootstrap';
import * as n from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import { qs, qsa, getSavedValues } from '../commonUtils';
import * as c from '../constants';
import type * as t from '../types';
import { localeStore, locale, textTooltips, textFretboard, textScaleParams, textContent, textIntervals } from './i18n';

export const createUiStore = (): t.uiStore => {
  const theme = persistentAtom<t.uiTheme>('theme', getSavedValues().theme);

  const toggleTheme = () => {
    theme.set(theme.get() === 'dark' ? 'light' : 'dark');
  };

  const stateLocale = <n.Atom<t.locale>><unknown>locale;

  const switchLocale = () => {
    localeStore.set(locale.get() === 'ru' ? 'en' : 'ru');
  };

  const stateIntervalDisplayMode = n.atom<t.intervalDisplayMode>('digit');

  const switchIntervalDisplayMode = () => {
    stateIntervalDisplayMode.set(stateIntervalDisplayMode.get() === 'digit' ? 'letter' : 'digit');
  };

  const stateIsEnharmonicSimplify = n.atom<boolean>(false);

  const switchEnharmonicSimplify = () => {
    stateIsEnharmonicSimplify.set(!stateIsEnharmonicSimplify.get());
  };

  return {
    theme,
    toggleTheme,
    stateLocale,
    switchLocale,
    stateIntervalDisplayMode,
    switchIntervalDisplayMode,
    stateIsEnharmonicSimplify,
    switchEnharmonicSimplify,
  };
};

const getElFretboardStringNumberContainer = (elFretboardString: HTMLTableRowElement) => qs<HTMLTableCellElement>('[data-instrument="fretboard-string-number"]', elFretboardString);
const getElFretboardStartNoteContainer = (elFretboardString: HTMLTableRowElement) => qs<HTMLButtonElement>('[data-control="start-note"]', elFretboardString);
const getElFretboardStringFrets = (elFretboardString: HTMLTableRowElement): HTMLTableCellElement[] =>
  Array.from(elFretboardString.querySelectorAll<HTMLTableCellElement>('td')).slice(2);

const getDomRefs = (): t.domRefs => {
  const elThemeToggle = qs<HTMLButtonElement>('[data-control="theme-toggle"]');
  const elTooltipTemplate = qs<HTMLTemplateElement>('#template-tooltip');
  const elDirectionControllers = qsa<HTMLButtonElement>('[data-direction]');
  const elResolveErrorContainer = qs<HTMLParagraphElement>('[data-container="resolve-error"]');
  //
  const elTonicContainer = qs<HTMLTableCellElement>('[data-container="tonic"]');
  const elContextContainer = qs<HTMLTableCellElement>('[data-container="context"]');
  const elIntervalContainers = qsa<HTMLTableCellElement>('[data-container="interval-step"]');
  const elIntervalStepButtons = Array.from(qsa<HTMLButtonElement>('[data-control="interval-step"]'));
  const elIntervalDisplaySwitch = qs<HTMLButtonElement>('[data-control="interval-display-switch"]');
  const elIntervalStepParamsTemplate = qs<HTMLTemplateElement>('#template-interval-step-params');
  const elIntervalStepParams = <HTMLFormElement>elIntervalStepParamsTemplate.content.firstElementChild;
  const elScaleToneContainers = qsa<HTMLTableCellElement>('[data-container="scale-tone"]');
  const elSwitchDegreeContainers = qsa<HTMLInputElement>('[data-container="switch-degree"]');
  //
  const elKeyboardNotes = qsa<HTMLTableCellElement>('[data-instrument="keyboard-notes"] td');

  const elFretboardStringTemplate = qs<HTMLTemplateElement>('#template-fretboard-string');
  const elFretboardNewStringNoteParamsTemplate = qs<HTMLTemplateElement>('#template-fretboard-set-string-params');

  const elFretboard = qs<HTMLTableSectionElement>('[data-instrument="fretboard"]');
  const elFretboardStrings: HTMLTableRowElement[] = [];
  const elFretboardStartNoteContainers: HTMLButtonElement[] = [];
  const elFretboardStringFrets: HTMLTableCellElement[][] = [];
  const elFretboardString = <HTMLTableRowElement>elFretboardStringTemplate.content.firstElementChild;
  const elFretboardNewStringNoteParams = <HTMLFormElement>elFretboardNewStringNoteParamsTemplate.content.firstElementChild;
  const noteSelect = qs<HTMLSelectElement>('#fretboard-set-string-note', elFretboardNewStringNoteParams);
  const optionProto = <HTMLOptionElement>noteSelect.firstElementChild;
  c.allNotesNames.forEach((name, i) => {
    const opt = i === 0 ? optionProto : <HTMLOptionElement>optionProto.cloneNode();
    opt.value = name;
    opt.textContent = name;
    if (i > 0) {
      noteSelect.appendChild(opt);
    }
  });

  const elLocaleSwitch = qs<HTMLButtonElement>('[data-control="locale-switch"]');
  const elEnharmonicSimplifyToggle = qs<HTMLInputElement>('[data-control="enharmonic-simplify"]');

  return {
    elThemeToggle,
    elLocaleSwitch,
    elTooltipTemplate,
    elDirectionControllers,
    elResolveErrorContainer,
    //
    elTonicContainer,
    elContextContainer,
    elIntervalContainers,
    elIntervalStepButtons,
    elIntervalDisplaySwitch,
    elIntervalStepParams,
    elEnharmonicSimplifyToggle,
    elScaleToneContainers,
    elSwitchDegreeContainers,
    //
    elKeyboardNotes,
    elFretboard,
    elFretboardStrings,
    elFretboardStartNoteContainers,
    elFretboardStringFrets,
    elFretboardString,
    elFretboardNewStringNoteParams,
  };
};

const initIntervalSteps = (refs: t.domRefs, appStore: t.appStore): void => {
  refs.elIntervalStepButtons.forEach((elButton, buttonIndex) => {
    const degree = buttonIndex + 1;

    const makePopover = () => new Popover(elButton, {
      html: true,
      sanitize: false,
      content: () => {
        const form = <HTMLFormElement>refs.elIntervalStepParams.cloneNode(true);
        const select = qs<HTMLSelectElement>('#interval-step-value', form);
        const optionProto = <HTMLOptionElement>select.firstElementChild;
        const intervals = textIntervals.get();

        const { intervalPattern } = appStore.stateScaleBuildParams.get();
        const prevAbsolute = intervalPattern.slice(0, buttonIndex).reduce<number>((sum, s) => sum + s, 0);

        c.allIntervalSizes.forEach((relativeStep, i) => {
          const absolutePos = prevAbsolute + relativeStep;
          const wrappedPos = absolutePos > c.OCTAVE_SIZE ? absolutePos % c.OCTAVE_SIZE : absolutePos;
          const opt = i === 0
            ? optionProto
            : <HTMLOptionElement>optionProto.cloneNode();
          opt.value = relativeStep.toString();
          const absoluteName = intervals[<keyof typeof intervals>`interval${wrappedPos}`];
          const intervalName = relativeStep === 1
            ? `${intervals.halfStep} / ${absoluteName}`
            : relativeStep === 2
              ? `${intervals.wholeStep} / ${absoluteName}`
              : absoluteName;
          opt.textContent = `${relativeStep} / ${intervalName}`;
          if (i > 0) {
            select.appendChild(opt);
          }
        });

        select.value = intervalPattern[buttonIndex].toString();

        select.addEventListener('change', () => {
          appStore.setIntervalStep({ degree, step: <t.intervalSize>Number(select.value) });
          const popover = Popover.getInstance(elButton);
          if (popover) {
            popover.hide();
          }
        });

        return form;
      },
    });

    textIntervals.subscribe(() => {
      const existing = Popover.getInstance(elButton);
      if (existing) {
        existing.dispose();
      }
      makePopover();
    });
  });
};

const initFretboard = (refs: t.domRefs, appStore: t.appStore): void => {
  const startNotes = appStore.stateFretboardStartNotes.get();

  startNotes.forEach((_startNote, stringIndex) => {
    const elFretboardString = <HTMLTableRowElement>refs.elFretboardString.cloneNode(true);
    const elFretboardStringNumberContainer = getElFretboardStringNumberContainer(elFretboardString);
    const elFretboardStartNoteContainer = getElFretboardStartNoteContainer(elFretboardString);

    const makePopover = () => new Popover(elFretboardStartNoteContainer, {
      html: true,
      sanitize: false,
      content: () => {
        const form = <HTMLFormElement>refs.elFretboardNewStringNoteParams.cloneNode(true);
        const noteSelect = qs<HTMLSelectElement>('#fretboard-set-string-note', form);
        const octaveSelect = qs<HTMLSelectElement>('#fretboard-set-note-octave', form);

        const fretboardTexts = textFretboard.get();
        noteSelect.ariaLabel = fretboardTexts.openNoteLabel;
        octaveSelect.ariaLabel = fretboardTexts.octaveLabel;
        const octaveNames = [
          fretboardTexts.octaveName0, fretboardTexts.octaveName1, fretboardTexts.octaveName2,
          fretboardTexts.octaveName3, fretboardTexts.octaveName4, fretboardTexts.octaveName5,
          fretboardTexts.octaveName6, fretboardTexts.octaveName7, fretboardTexts.octaveName8,
        ];
        Array.from(octaveSelect.options).forEach((opt, i) => {
          opt.textContent = `${opt.value} — ${octaveNames[i]}`;
        });

        const startNotes = appStore.stateFretboardStartNotes.get();
        const currentStartNote = startNotes[stringIndex];
        noteSelect.value = currentStartNote.note;
        octaveSelect.value = `${currentStartNote.octave}`;

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          appStore.setFretboardStartNote({ note: <t.noteName>noteSelect.value, octave: Number(octaveSelect.value), index: stringIndex });
          const popover = Popover.getInstance(elFretboardStartNoteContainer);
          if (popover) {
            popover.hide();
          }
        });

        return form;
      },
    });

    textFretboard.subscribe(() => {
      const existing = Popover.getInstance(elFretboardStartNoteContainer);
      if (existing) {
        existing.dispose();
      }
      makePopover();
    });

    elFretboardStringNumberContainer.textContent = `${stringIndex + 1}`;
    refs.elFretboard.appendChild(elFretboardString);
    refs.elFretboardStrings.push(elFretboardString);
    refs.elFretboardStartNoteContainers.push(elFretboardStartNoteContainer);
    refs.elFretboardStringFrets.push(getElFretboardStringFrets(elFretboardString));
  });
};

const initTooltips = (refs: t.domRefs): void => {
  const tooltipInstances = new Map<string, Tooltip>();
  const tooltipPlaceholders = qsa<HTMLElement>('[data-tooltip]');
  const elTooltipButton = <HTMLButtonElement>refs.elTooltipTemplate.content.firstElementChild;

  tooltipPlaceholders.forEach((placeholder) => {
    const key = <string>placeholder.dataset.tooltip;
    const button = <HTMLButtonElement>elTooltipButton.cloneNode(true);
    button.dataset.tooltip = key;
    button.dataset.bsPlacement = <string>placeholder.dataset.tooltipPlacement;
    placeholder.replaceWith(button);

    const tooltipTexts = textTooltips.get();
    const instance = new Tooltip(button, {
      title: tooltipTexts[<keyof typeof tooltipTexts>key],
    });
    tooltipInstances.set(key, instance);
  });

  textTooltips.subscribe((texts) => {
    tooltipInstances.forEach((instance, key) => {
      instance.setContent({ '.tooltip-inner': texts[<keyof typeof texts>key] });
    });
  });
};

const initStaticText = (): void => {
  type i18nTextAtom = n.ReadableAtom<Record<string, string>>;

  const kebabToCamel = (s: string): string =>
    s.replace(/[-_]+([a-z])/g, (_, c: string) => c.toUpperCase());

  const SCALE_PARAMS_PREFIX = 'scale-params-';

  qsa<HTMLElement>('[data-static-content]').forEach((el) => {
    const value = <string>el.dataset.staticContent;
    let store: i18nTextAtom;
    let key: string;
    if (value.startsWith(SCALE_PARAMS_PREFIX)) {
      store = <i18nTextAtom><unknown>textScaleParams;
      key = kebabToCamel(value.slice(SCALE_PARAMS_PREFIX.length));
    } else {
      store = <i18nTextAtom><unknown>textContent;
      key = kebabToCamel(value);
    }
    store.subscribe((texts) => {
      if (key in texts) {
        el.textContent = texts[key];
      }
    });
  });
};

export const initUI = (appStore: t.appStore): t.domRefs => {
  const refs = getDomRefs();

  initIntervalSteps(refs, appStore);
  initFretboard(refs, appStore);
  initTooltips(refs);
  initStaticText();

  // Locale switch
  refs.elLocaleSwitch.addEventListener('click', () => {
    appStore.switchLocale();
  });

  // Theme toggle
  refs.elThemeToggle.addEventListener('click', () => {
    appStore.toggleTheme();
  });

  // Direction controls - mapping UI control -> business logic
  const controlToOffset: Record<t.control, t.offsetScaleParam> = {
    'tonic-shift': appStore.offsetTonicShift,
    'modal-shift': appStore.offsetModalShift,
    'degree-rotation': appStore.offsetDegreeRotation,
    'context-shift': appStore.offsetContext,
  };

  refs.elDirectionControllers.forEach((el) => {
    el.addEventListener('click', () => {
      if (!el.dataset.control || !el.dataset.direction) {
        return;
      }
      const { control, direction } = <{ control: t.control, direction: t.controlDirection }>el.dataset;

      const offset: number = direction === 'up' ? 1 : -1;
      const offsetScaleParam: t.offsetScaleParam = controlToOffset[control];

      offsetScaleParam(offset);
    });
  });

  // Interval display mode switch
  refs.elIntervalDisplaySwitch.addEventListener('click', () => {
    appStore.switchIntervalDisplayMode();
  });

  refs.elEnharmonicSimplifyToggle.addEventListener('change', () => {
    appStore.switchEnharmonicSimplify();
  });

  refs.elSwitchDegreeContainers.forEach((el) => {
    el.addEventListener('click', () => {
      appStore.switchDegreeVisibility(Number(el.value));
    });
  });

  return refs;
};
