import { Popover, Tooltip } from 'bootstrap';
import * as n from 'nanostores';
import { qs, qsa } from '../commonUtils';
import * as c from '../constants';
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

const getElFretboardStringNumberContainer = (elFretboardString: HTMLTableRowElement) => qs<HTMLTableCellElement>('[data-instrument="fretboard__string-number"]', elFretboardString);
const getElFretboardStartNoteContainer = (elFretboardString: HTMLTableRowElement) => qs<HTMLButtonElement>('[data-control="start-note"]', elFretboardString);
const getElFretboardStringFrets = (elFretboardString: HTMLTableRowElement): HTMLTableCellElement[] =>
  Array.from(elFretboardString.querySelectorAll<HTMLTableCellElement>('td')).slice(2);

const getDomRefs = (): t.domRefs => {
  const elThemeToggle = qs<HTMLInputElement>('[data-control="theme-toggle"]');
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

  return {
    elThemeToggle,
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
  };
};

const initFretboard = (refs: t.domRefs, appStore: t.appStore): void => {
  const startNotes = appStore.stateFretboardStartNotes.get();

  startNotes.forEach((_startNote, stringIndex) => {
    const elFretboardString = <HTMLTableRowElement>refs.elFretboardString.cloneNode(true);
    const elFretboardStringNumberContainer = getElFretboardStringNumberContainer(elFretboardString);
    const elFretboardStartNoteContainer = getElFretboardStartNoteContainer(elFretboardString);

    const elFretboardStartNotePopover = new Popover(elFretboardStartNoteContainer, {
      html: true,
      sanitize: false,
      content: () => {
        const form = <HTMLFormElement>refs.elFretboardNewStringNoteParams.cloneNode(true);
        const noteSelect = qs<HTMLSelectElement>('#fretboard__set-string-note', form);
        const octaveSelect = qs<HTMLSelectElement>('#fretboard__set-note-octave', form);

        const startNotes = appStore.stateFretboardStartNotes.get();
        const currentStartNote = startNotes[stringIndex];
        noteSelect.value = currentStartNote.note;
        octaveSelect.value = `${currentStartNote.octave}`;

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          appStore.setFretboardStartNote({ note: <t.noteName>noteSelect.value, octave: Number(octaveSelect.value), index: stringIndex });
          elFretboardStartNotePopover.hide();
        });

        return form;
      },
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
