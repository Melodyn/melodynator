import { Popover, Tooltip } from 'bootstrap';
import * as n from 'nanostores';
import * as c from '../constants';
import type * as t from '../types';
import { StorageService } from './StorageService';
import { getDomRefs } from './domRefs';

export const createUiStore = (theme: t.uiTheme, isEnharmonicSimplify: boolean, intervalDisplayMode: t.intervalDisplayMode, storageService: StorageService): t.uiStore => {
  const themeStore = n.atom<t.uiTheme>(theme);

  themeStore.listen(v => storageService.insert('theme', v));

  const toggleTheme = () => {
    themeStore.set(themeStore.get() === 'dark' ? 'light' : 'dark');
  };

  const stateIntervalDisplayMode = n.atom<t.intervalDisplayMode>(intervalDisplayMode);

  stateIntervalDisplayMode.listen(v => storageService.insert('intervalDisplayMode', v));

  const switchIntervalDisplayMode = () => {
    stateIntervalDisplayMode.set(stateIntervalDisplayMode.get() === 'digit' ? 'letter' : 'digit');
  };

  const stateIsEnharmonicSimplify = n.atom<boolean>(isEnharmonicSimplify);

  stateIsEnharmonicSimplify.listen(v => storageService.insert('isEnharmonicSimplify', v));

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

const initIntervalSteps = (refs: t.domRefs, appStore: t.appStore): void => {
  refs.elSetIntervalSteps.forEach((elSetIntervalStep, index) => {
    const degree = index + 1;

    const makePopover = () => new Popover(elSetIntervalStep, {
      html: true,
      sanitize: false,
      content: () => {
        const form = <HTMLFormElement>refs.elIntervalStepParams.cloneNode(true);
        const select = refs.getElIntervalStepSelect(form);
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
      const btn = refs.getElFretboardStringNumberButton(elString);
      btn.textContent = `${c.MIN_FRETBOARD_STRINGS + i + 1}`;
    });
  };

  const removeStringRow = (index: number): void => {
    const elFretboardString = refs.elFretboardStrings[index];
    const elStartNoteButton = refs.elFretboardStartNoteContainers[index];
    const elNumberButton = refs.getElFretboardStringNumberButton(elFretboardString);
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
    const elFretboardStartNoteContainer = refs.getElFretboardStartNoteContainer(elFretboardString);
    const stringIndex = refs.elFretboardStrings.length;

    if (stringIndex < c.MIN_FRETBOARD_STRINGS) {
      const elNumberButton = refs.getElFretboardStringNumberButton(elFretboardString);
      const elNumberTd = <HTMLTableCellElement>elNumberButton.parentElement;
      elNumberButton.remove();
      elNumberTd.textContent = `${stringIndex + 1}`;
    } else {
      const elFretboardStringNumberButton = refs.getElFretboardStringNumberButton(elFretboardString);
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
        const noteSelect = refs.getElFretboardStringNoteSelect(form);
        const octaveSelect = refs.getElFretboardNoteOctaveSelect(form);

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
    refs.elFretboardStringFrets.push(refs.getElFretboardStringFrets(elFretboardString));
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
  const elTooltipButton = <HTMLButtonElement>refs.elTooltipTemplate.content.firstElementChild;

  refs.elTooltipPlaceholders.forEach((placeholder) => {
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

const initStaticText = (refs: t.domRefs, appStore: t.appStore): void => {
  const kebabToCamel = (s: string): string =>
    s.replace(/[-_]+([a-z])/g, (_, c: string) => c.toUpperCase());

  const SCALE_PARAMS_PREFIX = 'scale-params-';

  refs.elStaticContentElements.forEach((el) => {
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
  initStaticText(refs, appStore);

  // Locale switch
  refs.elLocaleSwitch.addEventListener('click', () => {
    appStore.switchLocale();
  });

  // Theme switch
  refs.elThemeSwitch.addEventListener('click', () => {
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

  refs.elEnharmonicSimplifySwitch.addEventListener('click', () => {
    appStore.switchEnharmonicSimplify();
  });

  refs.elDegreeSwitchContainers.forEach((el) => {
    el.addEventListener('click', () => {
      appStore.switchDegreeVisibility(Number(el.value));
    });
  });

  return refs;
};
