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

export const getDomRefs = (): t.domRefs => {
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

export const initPopovers = (refs: t.domRefs) => {
  const pop = new Popover(refs.elFretboardChangeStringNote, {
    html: true,
    sanitize: false,
    content: () => {
      const elFretboardNewStringNoteForm = <HTMLFormElement>refs.elFretboardNewStringNoteParams.cloneNode(true);
      elFretboardNewStringNoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        pop.hide();
      });
      return elFretboardNewStringNoteForm;
    },
  });
};

export const initTooltips = (refs: t.domRefs) => {
  refs.elTooltipTriggers.forEach((tooltipTriggerEl) => new Tooltip(tooltipTriggerEl));
};

export const bindThemeToggle = (refs: t.domRefs, store: t.uiStore) => {
  refs.elThemeToggle.addEventListener('change', () => {
    store.toggleTheme();
  });
};

export const bindDirectionControls = (refs: t.domRefs, onChange: t.directionHandler) => {
  refs.elDirectionControllers.forEach((el) => {
    el.addEventListener('click', () => {
      if (!el.dataset.control || !el.dataset.direction) return;
      const { control, direction } = <{ control: t.directionControl; direction: t.direction }>el.dataset;
      onChange(control, direction);
    });
  });
};
