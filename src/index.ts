import cn from 'classnames';
import type * as t from './types';
import {
  allNotes,
  allNotesCount,
  scales,
  tunings,
  gammas,
  fullNotes,
} from './constants';
import { buildChord } from './functions';
import { find } from './utils';

type qsFirstParameter = Parameters<typeof document.querySelector>[0];
type creParams = {
  textContent?: Node['textContent']
  classList?: string[]
  className?: string
  attributes?: Record<string, string>
};
type tStaffNote = Extract<t.fullToneName, 'G'> | Extract<t.fullToneName, 'F'> | Extract<t.fullToneName, 'C'>;
const staffNoteStartNoteMap: Record<tStaffNote, t.fullToneName> = {
  G: 'C',
  C: 'D',
  F: 'E',
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

const prepareArray = (plus: number = 0, length = allNotesCount): number[] => Array(length + 1).fill(0).map((_, i) => i + plus);

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

const bgcolors = [
  '',
  '',
  'success',
  'warning',
  'primary',
  'danger',
];

const makeRowEl = (
  items: number[] | t.gnote[],
  params: { type: 'jopa' | 'lala', order: number } = { type: 'jopa', order: 0 },
): HTMLTableRowElement => {
  const elRow = createElement<HTMLTableRowElement>('tr');

  let firstColumnTextContent = '';
  if (params.type === 'lala') {
    firstColumnTextContent = params.order.toString();
  }
  const firstColumn = createElement<HTMLTableCellElement>('td', {
    textContent: firstColumnTextContent,
    classList: ['p-0', 'text-secondary'],
  });
  elRow.append(firstColumn);

  items.forEach((value, i) => {
    const bgColorNumber = (typeof value === 'number') ? 0 : value.octave.sinceNumber;
    const col = createElement<HTMLTableCellElement>('td', {
      textContent: value.toString(),
      className: cn('p-0', {
        'text-secondary': (params.type === 'jopa') || (params.type === 'lala' && i === 0),
        [`bg-${bgcolors[bgColorNumber]} bg-opacity-25`]: (bgColorNumber > 0) && (i > 0),
        'fw-medium': (bgColorNumber > 0) && (i > 0),
      }),
    });
    elRow.append(col);
  });

  return elRow;
};

const makeKeyCellEls = (
  items: t.note[],
): HTMLTableCellElement[] => items.map((value) => createElement<HTMLTableCellElement>('td', {
  textContent: value.toString(),
  className: 'p-0',
}));

const buildStrings = (gamma: t.gamma, isChord: boolean = false): t.gstring[] => {
  const repo = isChord ? buildChord(gamma) : gamma;

  const strings = tunings.classic.strings.map((string): t.gstring => {
    const notes = string.notes.map((stringNote): t.gnote => {
      const repoNote = repo.notes.find((note) => note.is(<t.toneName>stringNote[stringNote.activeTone]));
      return (repoNote === undefined)
        ? <t.gnote>{ toString: () => '', octave: { sinceNumber: 0 } }
        : { ...repoNote, octave: stringNote.octave };
    });

    return {
      ...string,
      note: notes[0],
      notes,
    };
  });

  return strings;
};

const buildKeys = (gamma: t.gamma, isChord: boolean = false): t.note[] => {
  const repo = isChord ? buildChord(gamma) : gamma;

  const twoOctave = allNotes.concat(allNotes);

  let repoNoteIndex = 0;
  return twoOctave.map((currNote): t.note => {
    const repoNote = repo.notes[repoNoteIndex];
    if (repoNoteIndex < repo.notes.length && repoNote.is(<t.toneName>currNote[currNote.activeTone])) {
      repoNoteIndex += 1;
      return { ...repoNote };
    }
    return <t.note>{ toString: () => '' };
  });
};

const renderNotes = (elTableBody: HTMLTableSectionElement, strings: t.gstring[]): void => {
  elTableBody.innerHTML = '';
  strings.forEach((string) => {
    const elTableBodyRow = makeRowEl(string.notes, {
      type: 'lala',
      order: string.order,
    });
    elTableBody.append(elTableBodyRow);
  });
};

const renderKeys = (elTableKeysNotesRow: HTMLTableRowElement, notes: t.note[]): void => {
  const cells = makeKeyCellEls(notes);
  elTableKeysNotesRow.innerHTML = '';
  cells.forEach((cell) => {
    elTableKeysNotesRow.append(cell);
  });
};

const makeGammaOptionEl = (toneName: t.toneName, tonica: t.toneName): HTMLOptionElement => {
  const elOption = createElement<HTMLOptionElement>('option', {
    textContent: toneName,
    attributes: { value: toneName },
  });
  if (toneName === tonica) {
    elOption.toggleAttribute('selected');
  }
  return elOption;
};

const renderGammas = (elGammaList: HTMLSelectElement, gammas: t.gamma[], tonica: t.toneName): void => {
  elGammaList.innerHTML = '';
  gammas.forEach((gamma) => {
    const gammaTonica = gamma.notes[0];
    const elOption = makeGammaOptionEl(<t.toneName>gammaTonica[gammaTonica.activeTone], tonica);
    elGammaList.append(elOption);
  });
};

const renderStaff = (
  elTableStaffNotesRows: NodeListOf<HTMLTableRowElement>,
  gamma: t.gamma,
  staffNote: tStaffNote,
  isChord: boolean = false,
): void => {
  const preparedNotes = gamma.notes.filter((_, i) => i < 7);
  const notes: t.note[] = !isChord
    ? preparedNotes
    : preparedNotes.map((n, i) => {
      if (i === 0 || i === 2 || i === 4) {
        return n;
      }
      return { ...n, toString: () => '' };
    });
  const gammaNoteIndex = notes
    .reverse()
    .findIndex((note) => note[note.activeTone].startsWith(staffNoteStartNoteMap[staffNote]));

  elTableStaffNotesRows.forEach((elRow, i) => {
    const elCell = qs<HTMLTableCellElement>('td', elRow);
    const index = (gammaNoteIndex + i) % notes.length;
    elCell.textContent = notes[index].toString();
  });
};

const run = (): void => {
  const elTableString = qs<HTMLTableElement>('table#string');
  const elTableStringHead = qs<HTMLTableSectionElement>('thead', elTableString);
  const elTableStringBody = qs<HTMLTableSectionElement>('tbody', elTableString);
  const elTableStringFoot = qs<HTMLTableSectionElement>('tfoot', elTableString);
  const elTableStringHeadRow = makeRowEl(prepareArray());
  const elTableStringFootRow = makeRowEl(prepareArray(allNotesCount));
  elTableStringHead.append(elTableStringHeadRow);
  elTableStringFoot.append(elTableStringFootRow);

  const elTableKeysNotesRow = qs<HTMLTableRowElement>('table#keys tr#keys__notes');
  const elTableStaffNotesRows = qsa<HTMLTableRowElement>('table#staff__notes tr');

  let isChord = false;
  let tonica: t.toneName = 'C';
  let staffNote: tStaffNote = 'G';
  let scale: t.scale = scales.major;
  let activeGammas = gammas.filter((gamma) => gamma.scale.name === scale.name);
  let gamma: t.gamma = find(activeGammas, (gm) => (gm.notes[0][gm.notes[0].activeTone] === tonica));

  renderStaff(elTableStaffNotesRows, gamma, staffNote);

  const elFormConfigurator = document.forms.namedItem('configurator');
  if (elFormConfigurator === null) {
    throw new Error();
  }
  const elGammaList = qs<HTMLSelectElement>('#gamma', elFormConfigurator);
  renderGammas(elGammaList, activeGammas, tonica);

  const strings = buildStrings(gamma, isChord);
  renderNotes(elTableStringBody, strings);

  renderKeys(elTableKeysNotesRow, buildKeys(gamma, isChord));

  const rerenderStrings = (): void => {
    gamma = find(activeGammas, (gm) => (gm.notes[0][gm.notes[0].activeTone] === tonica));
    const strings = buildStrings(gamma, isChord);

    renderKeys(elTableKeysNotesRow, buildKeys(gamma, isChord));
    renderGammas(elGammaList, activeGammas, tonica);
    renderNotes(elTableStringBody, strings);
    renderStaff(elTableStaffNotesRows, gamma, staffNote, isChord);
  };

  const rerenderScale = (): void => {
    activeGammas = gammas.filter((gamma) => gamma.scale.name === scale.name);
    const hasCurrentTonica = activeGammas.some(({ notes }) => notes[0][notes[0].activeTone] === tonica);
    tonica = hasCurrentTonica ? tonica : <t.toneName>activeGammas[0].notes[0][activeGammas[0].notes[0].activeTone];

    rerenderStrings();
  };

  const elIsChord = qs<HTMLInputElement>('#isChord', elFormConfigurator);
  elIsChord.addEventListener('change', (e) => {
    const elInput = <HTMLInputElement>e.target;
    isChord = elInput.checked;

    rerenderStrings();
  });

  const elScale = qs<HTMLSelectElement>('#scale', elFormConfigurator);
  elScale.addEventListener('change', (e) => {
    const elSelect = <HTMLSelectElement>e.target;
    scale = scales[<t.scaleName>elSelect.value];

    rerenderScale();
  });

  elScale.addEventListener('keydown', (e) => {
    const elScale = <HTMLSelectElement>e.target;

    if (e.code === 'ArrowDown' && elScale.selectedIndex === (elScale.length - 1)) {
      e.preventDefault();
      elScale.selectedIndex = 0;
      const elOption = <HTMLOptionElement>elScale.item(elScale.selectedIndex);
      scale = scales[<t.scaleName>elOption.value];

      rerenderScale();
    }

    if (e.code === 'ArrowUp' && elScale.selectedIndex === 0) {
      e.preventDefault();
      elScale.selectedIndex = (elScale.length - 1);
      const elOption = <HTMLOptionElement>elScale.item(elScale.selectedIndex);
      scale = scales[<t.scaleName>elOption.value];

      rerenderScale();
    }
  });

  const elGammaSelect = qs<HTMLSelectElement>('#gamma', elFormConfigurator);
  elGammaSelect.addEventListener('change', (e) => {
    const elGamma = <HTMLSelectElement>e.target;
    tonica = <t.toneName>elGamma.value;

    rerenderStrings();
  });

  elGammaSelect.addEventListener('keydown', (e) => {
    const elGamma = <HTMLSelectElement>e.target;

    if (e.code === 'ArrowDown' && elGamma.selectedIndex === (elGamma.length - 1)) {
      e.preventDefault();
      elGamma.selectedIndex = 0;
      const elOption = <HTMLOptionElement>elGamma.item(elGamma.selectedIndex);
      tonica = <t.toneName>elOption.value;

      rerenderStrings();
    }

    if (e.code === 'ArrowUp' && elGamma.selectedIndex === 0) {
      e.preventDefault();
      elGamma.selectedIndex = (elGamma.length - 1);
      const elOption = <HTMLOptionElement>elGamma.item(elGamma.selectedIndex);
      tonica = <t.toneName>elOption.value;

      rerenderStrings();
    }
  });

  const elStaffNoteSelect = qs<HTMLSelectElement>('#staff__note');
  elStaffNoteSelect.addEventListener('change', (e) => {
    const elStaffNote = <HTMLSelectElement>e.target;
    staffNote = <tStaffNote>elStaffNote.value;

    renderStaff(elTableStaffNotesRows, gamma, staffNote, isChord);
  });

  elStaffNoteSelect.append(createElement<HTMLOptionElement>('option', {
    textContent: 'G (скрипичный)',
    attributes: { value: 'G', selected: 'selected' },
  }));
  elStaffNoteSelect.append(createElement<HTMLOptionElement>('option', {
    textContent: 'F (басовый)',
    attributes: { value: 'F' },
  }));
  elStaffNoteSelect.append(createElement<HTMLOptionElement>('option', {
    textContent: 'C (альтовый)',
    attributes: { value: 'C' },
  }));
};

document.addEventListener('DOMContentLoaded', run);
