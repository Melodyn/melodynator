import 'bootstrap';
import '@popperjs/core';
import './colors.scss';
import { Popover, Tooltip } from 'bootstrap';

type qsFirstParameter = Parameters<typeof document.querySelector>[0];
type creParams = {
  textContent?: Node['textContent']
  classList?: string[]
  className?: string
  attributes?: Record<string, string>
};

const qs = <E extends Element>(
  selector: qsFirstParameter,
  on: Element | Document = document,
): E => {
  const element = on.querySelector<E>(selector);
  if (element !== null) return element;
  throw new Error(`Not found element by selector "${selector}"`);
};
const qsa = <E extends Element>(
  selector: qsFirstParameter,
  on: Element | Document = document,
): NodeListOf<E> => on.querySelectorAll<E>(selector);

const createElement = <E extends HTMLElement>(
  tagName: qsFirstParameter,
  params: creParams = {},
): E => {
  const mergedParams: Required<creParams> = {
    textContent: '',
    classList: [],
    className: '',
    attributes: {},
    ...params,
  };
  const element = document.createElement(tagName);
  element.textContent = mergedParams.textContent;
  if (mergedParams.classList.length > 0) {
    element.classList.add(...mergedParams.classList);
  } else if (mergedParams.className.length > 0) {
    element.className = mergedParams.className;
  }
  Object.entries(mergedParams.attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return <E>element;
};

const run = (): void => {
  const elFretboard = qs<HTMLTableSectionElement>('[data-instrument="fretboard"]');
  const elFretboardStringTemplate = qs<HTMLTableRowElement>('[data-instrument="fretboard__string"]', elFretboard);
  const elFretboardChangeStringNote = qs<HTMLUListElement>('button', elFretboardStringTemplate);
  const elFretboardNewStringNoteParamsTemplate = qs<HTMLTemplateElement>('#template-fretboard__set-string-params');
  const elFretboardNewStringNoteParams = <HTMLFormElement>elFretboardNewStringNoteParamsTemplate.content.firstElementChild;
  const pop = new Popover(elFretboardChangeStringNote, {
    html: true,
    sanitize: false,
    content: () => {
      const elFretboardNewStringNoteForm = <HTMLFormElement>elFretboardNewStringNoteParams.cloneNode(true);
      elFretboardNewStringNoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const elForm = <HTMLFormElement>e.target;
        // console.log(elForm.elements['fretboard__set-string-note'].value, elForm.elements['fretboard__set-note-octave'].value);
        pop.hide();
      });
      return elFretboardNewStringNoteForm;
    },
  });
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipTriggerEl => new Tooltip(tooltipTriggerEl))
};

document.addEventListener('DOMContentLoaded', run);
