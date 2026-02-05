import { Popover, Tooltip } from 'bootstrap';
import { qs, qsa } from '../commonUtils';
import type * as t from '../types';

export const getDomRefs = (): t.domRefs => {
  const elTonicContainer = qs<HTMLTableCellElement>('[data-container="tonic"]');
  const elHarmonicContainer = qs<HTMLTableCellElement>('[data-container="harmonic"]');
  const elFretboard = qs<HTMLTableSectionElement>('[data-instrument="fretboard"]');
  const elFretboardStringTemplate = qs<HTMLTableRowElement>('[data-instrument="fretboard__string"]', elFretboard);
  const elFretboardChangeStringNote = qs<HTMLButtonElement>('button', elFretboardStringTemplate);
  const elFretboardNewStringNoteParamsTemplate = qs<HTMLTemplateElement>('#template-fretboard__set-string-params');
  const elFretboardNewStringNoteParams = <HTMLFormElement>elFretboardNewStringNoteParamsTemplate.content.firstElementChild;
  const elDirectionControllers = qsa<HTMLButtonElement>('[data-direction]');
  const elTooltipTriggers = qsa('[data-bs-toggle="tooltip"]');

  return {
    elTonicContainer,
    elHarmonicContainer,
    elFretboard,
    elFretboardStringTemplate,
    elFretboardChangeStringNote,
    elFretboardNewStringNoteParamsTemplate,
    elFretboardNewStringNoteParams,
    elDirectionControllers,
    elTooltipTriggers,
  };
};

export const initPopovers = (refs: t.domRefs): void => {
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

export const initTooltips = (refs: t.domRefs): void => {
  refs.elTooltipTriggers.forEach((tooltipTriggerEl) => new Tooltip(tooltipTriggerEl));
};

export const bindDirectionControls = (refs: t.domRefs, onChange: t.directionHandler): void => {
  refs.elDirectionControllers.forEach((el) => {
    el.addEventListener('click', () => {
      if (!el.dataset.control || !el.dataset.direction) return;
      const { control, direction } = el.dataset as { control: t.directionControl; direction: t.direction };
      onChange(control, direction);
    });
  });
};
