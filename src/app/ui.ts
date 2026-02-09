import { Popover, Tooltip } from 'bootstrap';
import * as n from 'nanostores';
import { qs, qsa } from '../commonUtils';
import type * as t from '../types';

export const createUiStore = (): t.uiStore => {
  const theme = n.atom<t.uiTheme>('light');

  const toggleTheme = () => {
    theme.set(theme.get() === 'dark' ? 'light' : 'dark');
  };

  return {
    theme,
    toggleTheme,
  };
};

const getDomRefs = (): t.domRefs => {
  const elThemeToggle = qs<HTMLInputElement>('[data-control="theme-toggle"]');
  const elTooltipTriggers = qsa('[data-bs-toggle="tooltip"]');
  const elDirectionControllers = qsa<HTMLButtonElement>('[data-direction]');
  const elResolveErrorContainer = qs<HTMLParagraphElement>('[data-container="resolve-error"]');
  //
  const elTonicContainer = qs<HTMLTableCellElement>('[data-container="tonic"]');
  const elHarmonicContainer = qs<HTMLTableCellElement>('[data-container="harmonic"]');
  const elIntervalContainers = qsa<HTMLTableCellElement>('[data-container="interval-step"]');
  const elScaleToneContainers = qsa<HTMLTableCellElement>('[data-container="scale-tone"]');
  //
  const elFretboard = qs<HTMLTableSectionElement>('[data-instrument="fretboard"]');
  const elFretboardStringTemplate = qs<HTMLTableRowElement>('[data-instrument="fretboard__string"]', elFretboard);
  const elFretboardChangeStringNote = qs<HTMLButtonElement>('button', elFretboardStringTemplate);
  const elFretboardNewStringNoteParamsTemplate = qs<HTMLTemplateElement>('#template-fretboard__set-string-params');
  const elFretboardNewStringNoteParams = <HTMLFormElement>elFretboardNewStringNoteParamsTemplate.content.firstElementChild;
  const elKeyboardNotes = qsa<HTMLTableCellElement>('[data-instrument="keyboard__notes"] td');

  return {
    elThemeToggle,
    elTooltipTriggers,
    elDirectionControllers,
    elResolveErrorContainer,
    //
    elTonicContainer,
    elHarmonicContainer,
    elIntervalContainers,
    elScaleToneContainers,
    //
    elFretboard,
    elFretboardStringTemplate,
    elFretboardChangeStringNote,
    elFretboardNewStringNoteParamsTemplate,
    elFretboardNewStringNoteParams,
    elKeyboardNotes,
  };
};

export const initUI = (appStore: t.appStore): t.domRefs => {
  const refs = getDomRefs();

  // Bootstrap popovers
  new Popover(refs.elFretboardChangeStringNote, {
    html: true,
    sanitize: false,
    content: () => {
      const elFretboardNewStringNoteForm = <HTMLFormElement>refs.elFretboardNewStringNoteParams.cloneNode(true);
      elFretboardNewStringNoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // TODO: implement logic
      });
      return elFretboardNewStringNoteForm;
    },
  });

  // Bootstrap tooltips
  refs.elTooltipTriggers.forEach((tooltipTriggerEl) => new Tooltip(tooltipTriggerEl));

  // Theme toggle
  refs.elThemeToggle.addEventListener('change', () => {
    appStore.toggleTheme();
  });

  // Direction controls - mapping UI control -> business logic
  const controlToOffset: Record<t.control, t.offsetScaleParam> = {
    'tonic-shift': appStore.offsetTonicShift,
    'modal-shift': appStore.offsetModalShift,
    'degree-rotation': appStore.offsetDegreeRotation,
    'harmonic-transform': appStore.offsetHarmonicTransform,
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

  return refs;
};
