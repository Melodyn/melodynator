import 'bootstrap';
import '@popperjs/core';
import './colors.scss';
import { Popover, Tooltip } from 'bootstrap';
import * as n from 'nanostores';
import * as t from './types';
import * as c from './constants';
import * as cu from './commonUtils';
import * as mu from './index';

const run = (): void => {
  const elTonicContainer = cu.qs<HTMLTableCellElement>('[data-container="tonic"]');
  const elHarmonicContainer = cu.qs<HTMLTableCellElement>('[data-container="harmonic"]');
  const countChromaticNotes = c.allNotesNames.length;
  const defaultScaleBuildParams: t.scaleBuildParams = {
    tonic: 'C',
    intervalPattern: [2, 2, 1, 2, 2, 2, 1],
    modeShift: 0,
  };
  const stateScaleBuildParams = n.map(defaultScaleBuildParams);
  const stateHarmonicShift = n.atom(0);
  const stateCurrentNoteChromaticIndex = n.computed(stateScaleBuildParams, ({ tonic }) => cu.findIndex(c.allNotesNames, (noteName) => noteName === tonic));
  const stateResolvedScaleParams = n.computed(stateScaleBuildParams, (scaleBuildParams) => mu.resolveScale(scaleBuildParams));
  const changeTonic: t.changer = (direction) => {
    const currentTonicIndex = stateCurrentNoteChromaticIndex.get();
    const offset = direction === 'up' ? 1 : -1;
    const newTonicIndex = (currentTonicIndex + countChromaticNotes + offset) % countChromaticNotes;
    const newTonic = c.allNotesNames[newTonicIndex];
    stateScaleBuildParams.setKey('tonic', newTonic);
  };
  const changeHarmonicShift: t.changer = (direction) => {
    const offset = direction === 'up' ? 1 : -1;
    const currentShift = stateHarmonicShift.get();
    stateHarmonicShift.set((currentShift + c.OCTAVE_SIZE + offset) % c.OCTAVE_SIZE);
  };

  stateScaleBuildParams.subscribe((scaleBuildParams) => {
    elTonicContainer.textContent = scaleBuildParams.tonic;
  });

  stateHarmonicShift.subscribe(() => {
    elHarmonicContainer.textContent = stateHarmonicShift.value.toString();
  });

  //
  const elFretboard = cu.qs<HTMLTableSectionElement>('[data-instrument="fretboard"]');
  const elFretboardStringTemplate = cu.qs<HTMLTableRowElement>('[data-instrument="fretboard__string"]', elFretboard);
  const elFretboardChangeStringNote = cu.qs<HTMLUListElement>('button', elFretboardStringTemplate);
  const elFretboardNewStringNoteParamsTemplate = cu.qs<HTMLTemplateElement>('#template-fretboard__set-string-params');
  const elFretboardNewStringNoteParams = <HTMLFormElement>elFretboardNewStringNoteParamsTemplate.content.firstElementChild;
  const pop = new Popover(elFretboardChangeStringNote, {
    html: true,
    sanitize: false,
    content: () => {
      const elFretboardNewStringNoteForm = <HTMLFormElement>elFretboardNewStringNoteParams.cloneNode(true);
      elFretboardNewStringNoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        pop.hide();
      });
      return elFretboardNewStringNoteForm;
    },
  });
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipTriggerEl => new Tooltip(tooltipTriggerEl));

  const elDirectionControllers = cu.qsa<HTMLButtonElement>('[data-direction]');
  elDirectionControllers.forEach((el) => {
    el.addEventListener('click', () => {
      if (!el.dataset.control || !el.dataset.direction) return;
      const { control, direction } = el.dataset as { control: string, direction: t.direction };

      switch (control) {
        case 'tonic':
          changeTonic(direction);
          break;
        case 'modal':
          break;
        case 'functional':
          break;
        case 'harmonic':
          changeHarmonicShift(direction);
          break;
        default:
          console.log({ control, direction });
      }
    });
  });
};

document.addEventListener('DOMContentLoaded', run);
