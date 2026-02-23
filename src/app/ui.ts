import { Popover, Tooltip } from 'bootstrap';
import * as n from 'nanostores';
import { qs, qsa } from '../commonUtils';
import * as c from '../constants';
import type * as t from '../types';
import { localeStore, locale, textScaleParams, textFretboard } from './i18n';

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
  const elTooltipTriggers = qsa('[data-bs-toggle="tooltip"]');
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
  // data-content — метки конфигуратора гаммы
  const elScaleParamsOffset = qs<HTMLTableCellElement>('[data-content="scale-params-offset"]');
  const elScaleParamsCenter = qs<HTMLTableCellElement>('[data-content="scale-params-center"]');
  const elScaleParamsContext = qs<HTMLTableCellElement>('[data-content="scale-params-context"]');
  const elScaleParamsTonal = qs<HTMLTableCellElement>('[data-content="scale-params-tonal"]');
  const elScaleParamsModal = qs<HTMLTableCellElement>('[data-content="scale-params-modal"]');
  const elScaleParamsDegrees = qs<HTMLSpanElement>('[data-content="scale-params-degrees"]');
  const elScaleParamsHide = qs<HTMLSpanElement>('[data-content="scale-params-hide"]');
  const elScaleParamsDegreesTooltip = qs<HTMLButtonElement>('[data-bs-toggle="tooltip"].tooltip-configurator');
  // data-content — статичный текст страницы
  const elPageTitle = qs<HTMLHeadingElement>('[data-content="page-title"]');
  const elPageDescription = qs<HTMLParagraphElement>('[data-content="page-description"]');
  const elSectionTheoryTitle = qs<HTMLHeadingElement>('[data-content="section-theory-title"]');
  const elSectionTheoryText = qs<HTMLParagraphElement>('[data-content="section-theory-text"]');
  const elSectionFeaturesTitle = qs<HTMLHeadingElement>('[data-content="section-features-title"]');
  const elFeatureScales = qs<HTMLLIElement>('[data-content="feature-scales"]');
  const elFeatureChords = qs<HTMLLIElement>('[data-content="feature-chords"]');
  const elFeatureIntervals = qs<HTMLLIElement>('[data-content="feature-intervals"]');
  const elFeatureDegrees = qs<HTMLLIElement>('[data-content="feature-degrees"]');
  const elSectionAudienceTitle = qs<HTMLHeadingElement>('[data-content="section-audience-title"]');
  const elSectionAudienceText = qs<HTMLParagraphElement>('[data-content="section-audience-text"]');
  const elSectionInstrumentsTitle = qs<HTMLHeadingElement>('[data-content="section-instruments-title"]');
  const elSectionInstrumentsText = qs<HTMLParagraphElement>('[data-content="section-instruments-text"]');
  const elFooterText = qs<HTMLParagraphElement>('[data-content="footer-text"]');

  return {
    elThemeToggle,
    elLocaleSwitch,
    elTooltipTriggers,
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
    // data-content — метки конфигуратора гаммы
    elScaleParamsOffset,
    elScaleParamsCenter,
    elScaleParamsContext,
    elScaleParamsTonal,
    elScaleParamsModal,
    elScaleParamsDegrees,
    elScaleParamsHide,
    elScaleParamsDegreesTooltip,
    // data-content — статичный текст страницы
    elPageTitle,
    elPageDescription,
    elSectionTheoryTitle,
    elSectionTheoryText,
    elSectionFeaturesTitle,
    elFeatureScales,
    elFeatureChords,
    elFeatureIntervals,
    elFeatureDegrees,
    elSectionAudienceTitle,
    elSectionAudienceText,
    elSectionInstrumentsTitle,
    elSectionInstrumentsText,
    elFooterText,
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

export const initUI = (appStore: t.appStore): t.domRefs => {
  const refs = getDomRefs();

  initFretboard(refs, appStore);

  // Bootstrap tooltips (degrees tooltip initialized separately — needs i18n title)
  refs.elTooltipTriggers.forEach((tooltipTriggerEl) => {
    if (tooltipTriggerEl !== refs.elScaleParamsDegreesTooltip) new Tooltip(tooltipTriggerEl);
  });

  // Degrees tooltip — initialized with i18n title so Bootstrap _isWithContent() passes
  const degreesTooltipInstance = new Tooltip(refs.elScaleParamsDegreesTooltip, {
    title: textScaleParams.get().degreesTooltip,
  });
  textScaleParams.subscribe((texts) => {
    degreesTooltipInstance.setContent({ '.tooltip-inner': texts.degreesTooltip });
  });

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
