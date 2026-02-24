import { Popover, Tooltip } from 'bootstrap';
import * as n from 'nanostores';
import { qs, qsa } from '../commonUtils';
import * as c from '../constants';
import type * as t from '../types';
import { localeStore, locale, textTooltips, textFretboard, textScaleParams, textContent } from './i18n';

export const createUiStore = (): t.uiStore => {
  const theme = n.atom<t.uiTheme>('light');

  const toggleTheme = () => {
    theme.set(theme.get() === 'dark' ? 'light' : 'dark');
  };

  const stateLocale = <n.Atom<t.locale>><unknown>locale;

  const switchLocale = () => {
    localeStore.set(locale.get() === 'ru' ? 'en' : 'ru');
  };

  return {
    theme,
    toggleTheme,
    stateLocale,
    switchLocale,
  };
};

const getElFretboardStringNumberContainer = (elFretboardString: HTMLTableRowElement) => qs<HTMLTableCellElement>('[data-instrument="fretboard__string-number"]', elFretboardString);
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
  const elScaleToneContainers = qsa<HTMLTableCellElement>('[data-container="scale-tone"]');
  const elSwitchDegreeContainers = qsa<HTMLInputElement>('[data-container="switch-degree"]');
  //
  const elKeyboardNotes = qsa<HTMLTableCellElement>('[data-instrument="keyboard__notes"] td');

  const elFretboardStringTemplate = qs<HTMLTemplateElement>('#template-fretboard__string');
  const elFretboardNewStringNoteParamsTemplate = qs<HTMLTemplateElement>('#template-fretboard__set-string-params');

  const elFretboard = qs<HTMLTableSectionElement>('[data-instrument="fretboard"]');
  const elFretboardStrings: HTMLTableRowElement[] = [];
  const elFretboardStartNoteContainers: HTMLButtonElement[] = [];
  const elFretboardStringFrets: HTMLTableCellElement[][] = [];
  const elFretboardString = <HTMLTableRowElement>elFretboardStringTemplate.content.firstElementChild;
  const elFretboardNewStringNoteParams = <HTMLFormElement>elFretboardNewStringNoteParamsTemplate.content.firstElementChild;
  const noteSelect = qs<HTMLSelectElement>('#fretboard__set-string-note', elFretboardNewStringNoteParams);
  const optionProto = <HTMLOptionElement>noteSelect.firstElementChild;
  c.allNotesNames.forEach((name, i) => {
    const opt = i === 0 ? optionProto : <HTMLOptionElement>optionProto.cloneNode();
    opt.value = name;
    opt.textContent = name;
    if (i > 0) noteSelect.appendChild(opt);
  });

  const elLocaleSwitch = qs<HTMLButtonElement>('[data-control="locale-switch"]');

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
        const noteSelect = qs<HTMLSelectElement>('#fretboard__set-string-note', form);
        const octaveSelect = qs<HTMLSelectElement>('#fretboard__set-note-octave', form);

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
          if (popover) popover.hide();
        });

        return form;
      },
    });

    textFretboard.subscribe(() => {
      const existing = Popover.getInstance(elFretboardStartNoteContainer);
      if (existing) existing.dispose();
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

  const SCALE_PARAMS_PREFIX = 'scale-params__';

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
      el.textContent = texts[key];
    });
  });
};

export const initUI = (appStore: t.appStore): t.domRefs => {
  const refs = getDomRefs();

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
      if (!el.dataset.control || !el.dataset.direction) return;
      const { control, direction } = <{ control: t.control, direction: t.controlDirection }>el.dataset;

      const offset: number = direction === 'up' ? 1 : -1;
      const offsetScaleParam: t.offsetScaleParam = controlToOffset[control];

      offsetScaleParam(offset);
    });
  });

  refs.elSwitchDegreeContainers.forEach((el) => {
    el.addEventListener('click', () => {
      appStore.switchDegreeVisibility(Number(el.value));
    });
  });

  return refs;
};
