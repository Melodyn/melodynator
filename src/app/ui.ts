import { Popover, Tooltip } from 'bootstrap';
import * as n from 'nanostores';
import { qs, qsa } from '../commonUtils';
import * as c from '../constants';
import type * as t from '../types';
import { StorageService } from './StorageService';

export const createUiStore = (theme: t.uiTheme, storageService: StorageService): t.uiStore => {
  const themeStore = n.atom<t.uiTheme>(theme);

  themeStore.listen(v => storageService.insert('theme', v));

  const toggleTheme = () => {
    themeStore.set(themeStore.get() === 'dark' ? 'light' : 'dark');
  };

  const stateIntervalDisplayMode = n.atom<t.intervalDisplayMode>('digit');

  const switchIntervalDisplayMode = () => {
    stateIntervalDisplayMode.set(stateIntervalDisplayMode.get() === 'digit' ? 'letter' : 'digit');
  };

  const stateIsEnharmonicSimplify = n.atom<boolean>(false);

  const switchEnharmonicSimplify = () => {
    stateIsEnharmonicSimplify.set(!stateIsEnharmonicSimplify.get());
  };

  return {
    theme: themeStore,
    toggleTheme,
    stateIntervalDisplayMode,
    switchIntervalDisplayMode,
    stateIsEnharmonicSimplify,
    switchEnharmonicSimplify,
  };
};

const getElFretboardStringNumberButton = (elFretboardString: HTMLTableRowElement) => qs<HTMLButtonElement>('[data-control="remove-fretboard-string"]', elFretboardString);
const getElFretboardStartNoteContainer = (elFretboardString: HTMLTableRowElement) => qs<HTMLButtonElement>('[data-control="start-note"]', elFretboardString);
const getElFretboardStringFrets = (elFretboardString: HTMLTableRowElement): HTMLTableCellElement[] =>
  Array.from(qsa<HTMLTableCellElement>('[data-instrument="fretboard-string-fret"]', elFretboardString));

const getDomRefs = (): t.domRefs => {
  const elThemeToggle = qs<HTMLButtonElement>('[data-control="theme-toggle"]');
  const elTooltipTemplate = qs<HTMLTemplateElement>('#template-tooltip');
  const elDirectionControllers = qsa<HTMLButtonElement>('[data-direction]');
  const elResolveErrorContainer = qs<HTMLParagraphElement>('[data-container="resolve-error"]');
  //
  const elTonicContainer = qs<HTMLTableCellElement>('[data-container="tonic"]');
  const elContextContainer = qs<HTMLTableCellElement>('[data-container="context"]');
  const elIntervalContainers = qsa<HTMLTableCellElement>('[data-container="interval-step"]');
  const elSetIntervalSteps = Array.from(qsa<HTMLButtonElement>('[data-control="interval-step"]'));
  const elIntervalDisplaySwitch = qs<HTMLButtonElement>('[data-control="interval-display-switch"]');
  const elIntervalStepParamsTemplate = qs<HTMLTemplateElement>('#template-interval-step-params');
  const elIntervalStepParams = <HTMLFormElement>elIntervalStepParamsTemplate.content.firstElementChild;
  const elScaleToneContainers = qsa<HTMLTableCellElement>('[data-container="scale-tone"]');
  const elSwitchDegreeContainers = qsa<HTMLInputElement>('[data-container="switch-degree"]');
  //
  const elKeyboardNotes = qsa<HTMLTableCellElement>('[data-instrument="keyboard-notes"] td');

  const elFretboardStringTemplate = qs<HTMLTemplateElement>('#template-fretboard-string');
  const elFretboardNewStringNoteParamsTemplate = qs<HTMLTemplateElement>('#template-fretboard-set-string-params');

  const elFretboard = qs<HTMLTableSectionElement>('[data-instrument="fretboard"]');
  const elFretboardStrings: HTMLTableRowElement[] = [];
  const elFretboardStartNoteContainers: HTMLButtonElement[] = [];
  const elFretboardStringFrets: HTMLTableCellElement[][] = [];
  const elFretboardString = <HTMLTableRowElement>elFretboardStringTemplate.content.firstElementChild;
  const elFretboardNewStringNoteParams = <HTMLFormElement>elFretboardNewStringNoteParamsTemplate.content.firstElementChild;
  const noteSelect = qs<HTMLSelectElement>('#fretboard-set-string-note', elFretboardNewStringNoteParams);
  const optionProto = <HTMLOptionElement>noteSelect.firstElementChild;
  c.allNotesNames.forEach((name, i) => {
    const opt = i === 0 ? optionProto : <HTMLOptionElement>optionProto.cloneNode();
    opt.value = name;
    opt.textContent = name;
    if (i > 0) {
      noteSelect.appendChild(opt);
    }
  });

  const elLocaleSwitch = qs<HTMLButtonElement>('[data-control="locale-switch"]');
  const elEnharmonicSimplifyToggle = qs<HTMLInputElement>('[data-control="enharmonic-simplify"]');
  const elAddFretboardString = qs<HTMLButtonElement>('[data-control="add-fretboard-string"]');
  const elAddFretboardStringConfirm = <HTMLButtonElement>qs<HTMLTemplateElement>('#template-add-fretboard-string-confirm').content.firstElementChild;
  const elRemoveFretboardStringConfirm = <HTMLButtonElement>qs<HTMLTemplateElement>('#template-remove-fretboard-string-confirm').content.firstElementChild;

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
    elSetIntervalSteps,
    elIntervalDisplaySwitch,
    elIntervalStepParams,
    elEnharmonicSimplifyToggle,
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
    elAddFretboardString,
    elAddFretboardStringConfirm,
    elRemoveFretboardStringConfirm,
  };
};

const initIntervalSteps = (refs: t.domRefs, appStore: t.appStore): void => {
  refs.elSetIntervalSteps.forEach((elSetIntervalStep, index) => {
    const degree = index + 1;

    const makePopover = () => new Popover(elSetIntervalStep, {
      html: true,
      sanitize: false,
      content: () => {
        const form = <HTMLFormElement>refs.elIntervalStepParams.cloneNode(true);
        const select = qs<HTMLSelectElement>('#interval-step-value', form);
        const optionProto = <HTMLOptionElement>select.firstElementChild;
        const intervals = appStore.textIntervals.get();

        const { intervalPattern } = appStore.stateScaleBuildParams.get();
        const prevAbsolute = intervalPattern.slice(0, index).reduce<number>((sum, s) => sum + s, 0);

        c.allIntervalSizes.forEach((relativeStep, i) => {
          const absolutePos = prevAbsolute + relativeStep;
          const wrappedPos = absolutePos > c.OCTAVE_SIZE ? absolutePos % c.OCTAVE_SIZE : absolutePos;
          const opt = i === 0
            ? optionProto
            : <HTMLOptionElement>optionProto.cloneNode();
          opt.value = relativeStep.toString();
          const absoluteName = intervals[<keyof typeof intervals>`interval${wrappedPos}`];
          const intervalName = relativeStep === 1
            ? `${intervals.halfStep} / ${absoluteName}`
            : relativeStep === 2
              ? `${intervals.wholeStep} / ${absoluteName}`
              : absoluteName;
          opt.textContent = `${relativeStep} / ${intervalName}`;
          if (i > 0) {
            select.appendChild(opt);
          }
        });

        select.value = intervalPattern[index].toString();

        select.addEventListener('change', () => {
          appStore.setIntervalStep({ degree, step: <t.intervalSize>Number(select.value) });
          const popover = Popover.getInstance(elSetIntervalStep);
          if (popover) {
            popover.hide();
          }
        });

        return form;
      },
    });

    appStore.textIntervals.subscribe(() => {
      const existing = Popover.getInstance(elSetIntervalStep);
      if (existing) {
        existing.dispose();
      }
      makePopover();
    });
  });
};

const initFretboard = (refs: t.domRefs, appStore: t.appStore): void => {
  const updateStringNumbers = (): void => {
    refs.elFretboardStrings.slice(c.MIN_FRETBOARD_STRINGS).forEach((elString, i) => {
      const btn = getElFretboardStringNumberButton(elString);
      btn.textContent = `${c.MIN_FRETBOARD_STRINGS + i + 1}`;
    });
  };

  const removeStringRow = (index: number): void => {
    const elFretboardString = refs.elFretboardStrings[index];
    const elStartNoteButton = refs.elFretboardStartNoteContainers[index];
    const elNumberButton = getElFretboardStringNumberButton(elFretboardString);
    const startNotePopover = Popover.getInstance(elStartNoteButton);
    if (startNotePopover) {
      startNotePopover.dispose();
    }
    const numberPopover = Popover.getInstance(elNumberButton);
    if (numberPopover) {
      numberPopover.dispose();
    }
    elFretboardString.remove();
    refs.elFretboardStrings.splice(index, 1);
    refs.elFretboardStartNoteContainers.splice(index, 1);
    refs.elFretboardStringFrets.splice(index, 1);
    updateStringNumbers();
  };

  const addStringRow = (): void => {
    const elFretboardString = <HTMLTableRowElement>refs.elFretboardString.cloneNode(true);
    const elFretboardStartNoteContainer = getElFretboardStartNoteContainer(elFretboardString);
    const stringIndex = refs.elFretboardStrings.length;

    if (stringIndex < c.MIN_FRETBOARD_STRINGS) {
      const elNumberButton = getElFretboardStringNumberButton(elFretboardString);
      const elNumberTd = <HTMLTableCellElement>elNumberButton.parentElement;
      elNumberButton.remove();
      elNumberTd.textContent = `${stringIndex + 1}`;
    } else {
      const elFretboardStringNumberButton = getElFretboardStringNumberButton(elFretboardString);
      elFretboardStringNumberButton.textContent = `${stringIndex + 1}`;

      const makeRemovePopover = () => new Popover(elFretboardStringNumberButton, {
        html: true,
        sanitize: false,
        content: () => {
          const currentIndex = refs.elFretboardStrings.indexOf(elFretboardString);
          const btn = <HTMLButtonElement>refs.elRemoveFretboardStringConfirm.cloneNode(true);
          btn.textContent = appStore.textFretboard.get().removeStringLabel;
          btn.addEventListener('click', () => {
            appStore.removeFretboardString(currentIndex);
            const popover = Popover.getInstance(elFretboardStringNumberButton);
            if (popover) {
              popover.hide();
            }
          });
          return btn;
        },
      });

      appStore.textFretboard.subscribe(() => {
        const existingRemove = Popover.getInstance(elFretboardStringNumberButton);
        if (existingRemove) {
          existingRemove.dispose();
        }
        makeRemovePopover();
      });
    }

    const makeStartNotePopover = () => new Popover(elFretboardStartNoteContainer, {
      html: true,
      sanitize: false,
      content: () => {
        const form = <HTMLFormElement>refs.elFretboardNewStringNoteParams.cloneNode(true);
        const noteSelect = qs<HTMLSelectElement>('#fretboard-set-string-note', form);
        const octaveSelect = qs<HTMLSelectElement>('#fretboard-set-note-octave', form);

        const fretboardTexts = appStore.textFretboard.get();
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

        const currentIndex = refs.elFretboardStrings.indexOf(elFretboardString);
        const currentStartNote = appStore.stateFretboardStartNotes.get()[currentIndex];
        noteSelect.value = currentStartNote.note;
        octaveSelect.value = `${currentStartNote.octave}`;

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const currentIndex = refs.elFretboardStrings.indexOf(elFretboardString);
          appStore.setFretboardStartNote({ note: <t.noteName>noteSelect.value, octave: Number(octaveSelect.value), index: currentIndex });
          const popover = Popover.getInstance(elFretboardStartNoteContainer);
          if (popover) {
            popover.hide();
          }
        });

        return form;
      },
    });

    appStore.textFretboard.subscribe(() => {
      const existingStartNote = Popover.getInstance(elFretboardStartNoteContainer);
      if (existingStartNote) {
        existingStartNote.dispose();
      }
      makeStartNotePopover();
    });

    refs.elFretboard.appendChild(elFretboardString);
    refs.elFretboardStrings.push(elFretboardString);
    refs.elFretboardStartNoteContainers.push(elFretboardStartNoteContainer);
    refs.elFretboardStringFrets.push(getElFretboardStringFrets(elFretboardString));
    updateStringNumbers();
  };

  const initialStartNotes = appStore.stateFretboardStartNotes.get();
  initialStartNotes.forEach(() => {
    addStringRow();
  });

  new Popover(refs.elAddFretboardString, {
    html: true,
    sanitize: false,
    content: () => {
      const btn = <HTMLButtonElement>refs.elAddFretboardStringConfirm.cloneNode(true);
      btn.textContent = appStore.textFretboard.get().addStringLabel;
      btn.addEventListener('click', () => {
        appStore.addFretboardString();
        const popover = Popover.getInstance(refs.elAddFretboardString);
        if (popover) {
          popover.hide();
        }
      });
      return btn;
    },
  });

  appStore.stateFretboardStartNotes.subscribe((startNotes, prevStartNotes) => {
    refs.elAddFretboardString.disabled = startNotes.length >= c.MAX_FRETBOARD_STRINGS;
    if (prevStartNotes === undefined) {
      return;
    }
    if (startNotes.length > prevStartNotes.length) {
      addStringRow();
    } else if (startNotes.length < prevStartNotes.length) {
      const removedIndex = prevStartNotes.findIndex((_prev, i) => i >= startNotes.length || startNotes[i] !== prevStartNotes[i]);
      removeStringRow(removedIndex);
    }
  });
};

const initTooltips = (refs: t.domRefs, appStore: t.appStore): void => {
  const tooltipInstances = new Map<string, Tooltip>();
  const tooltipPlaceholders = qsa<HTMLElement>('[data-tooltip]');
  const elTooltipButton = <HTMLButtonElement>refs.elTooltipTemplate.content.firstElementChild;

  tooltipPlaceholders.forEach((placeholder) => {
    const key = <string>placeholder.dataset.tooltip;
    const button = <HTMLButtonElement>elTooltipButton.cloneNode(true);
    button.dataset.tooltip = key;
    button.dataset.bsPlacement = <string>placeholder.dataset.tooltipPlacement;
    placeholder.replaceWith(button);

    const tooltipTexts = appStore.textTooltips.get();
    const instance = new Tooltip(button, {
      title: tooltipTexts[<keyof typeof tooltipTexts>key],
    });
    tooltipInstances.set(key, instance);
  });

  appStore.textTooltips.subscribe((texts) => {
    tooltipInstances.forEach((instance, key) => {
      instance.setContent({ '.tooltip-inner': texts[<keyof typeof texts>key] });
    });
  });
};

const initStaticText = (appStore: t.appStore): void => {
  const kebabToCamel = (s: string): string =>
    s.replace(/[-_]+([a-z])/g, (_, c: string) => c.toUpperCase());

  const SCALE_PARAMS_PREFIX = 'scale-params-';

  qsa<HTMLElement>('[data-static-content]').forEach((el) => {
    const value = <string>el.dataset.staticContent;
    let atom: t.i18nTextAtom;
    let key: string;
    if (value.startsWith(SCALE_PARAMS_PREFIX)) {
      atom = appStore.textScaleParams;
      key = kebabToCamel(value.slice(SCALE_PARAMS_PREFIX.length));
    } else {
      atom = appStore.textContent;
      key = kebabToCamel(value);
    }
    atom.subscribe((texts) => {
      if (key in texts) {
        el.textContent = texts[key];
      }
    });
  });
};

export const initUI = (appStore: t.appStore): t.domRefs => {
  const refs = getDomRefs();

  initIntervalSteps(refs, appStore);
  initFretboard(refs, appStore);
  initTooltips(refs, appStore);
  initStaticText(appStore);

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
      if (!el.dataset.control || !el.dataset.direction) {
        return;
      }
      const { control, direction } = <{ control: t.control, direction: t.controlDirection }>el.dataset;

      const offset: number = direction === 'up' ? 1 : -1;
      const offsetScaleParam: t.offsetScaleParam = controlToOffset[control];

      offsetScaleParam(offset);
    });
  });

  // Interval display mode switch
  refs.elIntervalDisplaySwitch.addEventListener('click', () => {
    appStore.switchIntervalDisplayMode();
  });

  refs.elEnharmonicSimplifyToggle.addEventListener('change', () => {
    appStore.switchEnharmonicSimplify();
  });

  refs.elSwitchDegreeContainers.forEach((el) => {
    el.addEventListener('click', () => {
      appStore.switchDegreeVisibility(Number(el.value));
    });
  });

  return refs;
};
