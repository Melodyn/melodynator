import { qs, qsa } from '../commonUtils';
import * as c from '../constants';
import type * as t from '../types';

export const getDomRefs = (): t.domRefs => {
  const elThemeSwitch = qs<HTMLButtonElement>('[data-control="theme-switch"]');
  const elLocaleSwitch = qs<HTMLButtonElement>('[data-control="locale-switch"]');
  const elTooltipTemplate = qs<HTMLTemplateElement>('[data-template="tooltip"]');
  const elTooltipPlaceholders = qsa<HTMLElement>('[data-tooltip]');
  const elStaticContentElements = qsa<HTMLElement>('[data-static-content]');
  const elDirectionControllers = qsa<HTMLButtonElement>('[data-direction]');
  const elResolveErrorContainer = qs<HTMLParagraphElement>('[data-container="resolve-error"]');

  const elTonicContainer = qs<HTMLTableCellElement>('[data-container="tonic"]');
  const elContextContainer = qs<HTMLTableCellElement>('[data-container="context"]');
  const elIntervalContainers = qsa<HTMLTableCellElement>('[data-container="interval-step"]');
  const elSetIntervalSteps = Array.from(qsa<HTMLButtonElement>('[data-control="interval-step"]'));
  const elIntervalDisplaySwitch = qs<HTMLButtonElement>('[data-control="interval-display-switch"]');
  const elIntervalStepParams = <HTMLFormElement>qs<HTMLTemplateElement>('[data-template="interval-step-params"]').content.firstElementChild;
  const elEnharmonicSimplifySwitch = qs<HTMLButtonElement>('[data-control="enharmonic-simplify"]');
  const elScaleToneContainers = qsa<HTMLTableCellElement>('[data-container="scale-tone"]');
  const elDegreeSwitchContainers = qsa<HTMLInputElement>('[data-container="degree-switch"]');

  const elKeyboardNotes = qsa<HTMLTableCellElement>('[data-instrument="keyboard-note"]');

  const elFretboard = qs<HTMLTableSectionElement>('[data-instrument="fretboard"]');
  const elFretboardStrings: HTMLTableRowElement[] = [];
  const elFretboardStartNoteContainers: HTMLButtonElement[] = [];
  const elFretboardStringFrets: HTMLTableCellElement[][] = [];
  const elFretboardString = <HTMLTableRowElement>qs<HTMLTemplateElement>('[data-template="fretboard-string"]').content.firstElementChild;
  const elFretboardNewStringNoteParams = <HTMLFormElement>qs<HTMLTemplateElement>('[data-template="fretboard-set-string-params"]').content.firstElementChild;
  const elNoteList = qs<HTMLSelectElement>('[data-select="fretboard-string-note"]', elFretboardNewStringNoteParams);
  const elNoteListItem = <HTMLOptionElement>elNoteList.firstElementChild;
  c.allNotesNames.forEach((name, i) => {
    const opt = i === 0 ? elNoteListItem : <HTMLOptionElement>elNoteListItem.cloneNode();
    opt.value = name;
    opt.textContent = name;
    if (i > 0) {
      elNoteList.appendChild(opt);
    }
  });

  const elAddFretboardString = qs<HTMLButtonElement>('[data-control="add-fretboard-string"]');
  const elAddFretboardStringConfirm = <HTMLButtonElement>qs<HTMLTemplateElement>('[data-template="add-fretboard-string-confirm"]').content.firstElementChild;
  const elRemoveFretboardStringConfirm = <HTMLButtonElement>qs<HTMLTemplateElement>('[data-template="remove-fretboard-string-confirm"]').content.firstElementChild;

  const getElFretboardStringNumberButton = (el: HTMLTableRowElement) =>
    qs<HTMLButtonElement>('[data-control="remove-fretboard-string"]', el);
  const getElFretboardStartNoteContainer = (el: HTMLTableRowElement) =>
    qs<HTMLButtonElement>('[data-control="start-note"]', el);
  const getElFretboardStringFrets = (el: HTMLTableRowElement): HTMLTableCellElement[] =>
    Array.from(qsa<HTMLTableCellElement>('[data-instrument="fretboard-string-fret"]', el));

  const getElIntervalStepSelect = (form: HTMLFormElement) =>
    qs<HTMLSelectElement>('[data-select="interval-step-value"]', form);
  const getElFretboardStringNoteSelect = (form: HTMLFormElement) =>
    qs<HTMLSelectElement>('[data-select="fretboard-string-note"]', form);
  const getElFretboardNoteOctaveSelect = (form: HTMLFormElement) =>
    qs<HTMLSelectElement>('[data-select="fretboard-note-octave"]', form);

  const elBody = document.body;

  return {
    elBody,
    elThemeSwitch,
    elLocaleSwitch,
    elTooltipTemplate,
    elTooltipPlaceholders,
    elStaticContentElements,
    elDirectionControllers,
    elResolveErrorContainer,
    elTonicContainer,
    elContextContainer,
    elIntervalContainers,
    elSetIntervalSteps,
    elIntervalDisplaySwitch,
    elIntervalStepParams,
    elEnharmonicSimplifySwitch,
    elScaleToneContainers,
    elDegreeSwitchContainers,
    elKeyboardNotes,
    elFretboard,
    elFretboardStrings,
    elFretboardStartNoteContainers,
    elFretboardStringFrets,
    elFretboardString,
    elFretboardNewStringNoteParams,
    elAddFretboardString,
    elAddFretboardStringConfirm,
    elRemoveFretboardStringConfirm,
    getElFretboardStringNumberButton,
    getElFretboardStartNoteContainer,
    getElFretboardStringFrets,
    getElIntervalStepSelect,
    getElFretboardStringNoteSelect,
    getElFretboardNoteOctaveSelect,
  };
};
