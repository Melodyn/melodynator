import { Modal, Popover, Tooltip } from 'bootstrap';
import * as n from 'nanostores';
import * as c from '../constants';
import * as cu from '../commonUtils';
import * as d from '../constants/defaults';
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
        const elIntervalStepParams = <HTMLFormElement>refs.elIntervalStepParams.cloneNode(true);
        const elIntervalStepSelect = refs.getElIntervalStepSelect(elIntervalStepParams);
        const elIntervalListItem = <HTMLOptionElement>elIntervalStepSelect.firstElementChild;
        const intervals = appStore.textIntervals.get();

        const { intervalPattern } = appStore.stateScaleBuildParams.get();
        const prevAbsolute = intervalPattern.slice(0, index).reduce<number>((sum, s) => sum + s, 0);

        c.allIntervalSizes.forEach((relativeStep, i) => {
          const absolutePos = prevAbsolute + relativeStep;
          const wrappedPos = absolutePos > c.OCTAVE_SIZE ? absolutePos % c.OCTAVE_SIZE : absolutePos;
          const elIntervalStepOption = i === 0
            ? elIntervalListItem
            : <HTMLOptionElement>elIntervalListItem.cloneNode();
          elIntervalStepOption.value = relativeStep.toString();
          const absoluteName = intervals[<keyof typeof intervals>`interval${wrappedPos}`];
          const intervalName = relativeStep === 1
            ? `${intervals.halfStep} / ${absoluteName}`
            : relativeStep === 2
              ? `${intervals.wholeStep} / ${absoluteName}`
              : absoluteName;
          elIntervalStepOption.textContent = `${relativeStep} / ${intervalName}`;
          if (i > 0) {
            elIntervalStepSelect.appendChild(elIntervalStepOption);
          }
        });

        elIntervalStepSelect.value = intervalPattern[index].toString();

        elIntervalStepSelect.addEventListener('change', () => {
          appStore.setIntervalStep({ degree, step: <t.intervalSize>Number(elIntervalStepSelect.value) });
          const popover = Popover.getInstance(elSetIntervalStep);
          if (popover) {
            popover.hide();
          }
        });

        return elIntervalStepParams;
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
      const elFretboardStringNumberContainer = <HTMLTableCellElement>elNumberButton.parentElement;
      elNumberButton.remove();
      elFretboardStringNumberContainer.textContent = `${stringIndex + 1}`;
    } else {
      const elFretboardStringNumberButton = refs.getElFretboardStringNumberButton(elFretboardString);
      elFretboardStringNumberButton.textContent = `${stringIndex + 1}`;

      const makeRemovePopover = () => new Popover(elFretboardStringNumberButton, {
        html: true,
        sanitize: false,
        content: () => {
          const currentIndex = refs.elFretboardStrings.indexOf(elFretboardString);
          const elRemoveFretboardStringConfirm = <HTMLButtonElement>refs.elRemoveFretboardStringConfirm.cloneNode(true);
          elRemoveFretboardStringConfirm.textContent = appStore.textFretboard.get().removeStringLabel;
          elRemoveFretboardStringConfirm.addEventListener('click', () => {
            appStore.removeFretboardString(currentIndex);
            const popover = Popover.getInstance(elFretboardStringNumberButton);
            if (popover) {
              popover.hide();
            }
          });
          return elRemoveFretboardStringConfirm;
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
        const elFretboardNewStringNoteParams = <HTMLFormElement>refs.elFretboardNewStringNoteParams.cloneNode(true);
        const elFretboardStringNoteSelect = refs.getElFretboardStringNoteSelect(elFretboardNewStringNoteParams);
        const elFretboardNoteOctaveSelect = refs.getElFretboardNoteOctaveSelect(elFretboardNewStringNoteParams);

        const fretboardTexts = appStore.textFretboard.get();
        elFretboardStringNoteSelect.ariaLabel = fretboardTexts.openNoteLabel;
        elFretboardNoteOctaveSelect.ariaLabel = fretboardTexts.octaveLabel;
        const octaveNames = [
          fretboardTexts.octaveName0, fretboardTexts.octaveName1, fretboardTexts.octaveName2,
          fretboardTexts.octaveName3, fretboardTexts.octaveName4, fretboardTexts.octaveName5,
          fretboardTexts.octaveName6, fretboardTexts.octaveName7, fretboardTexts.octaveName8,
        ];
        Array.from(elFretboardNoteOctaveSelect.options).forEach((opt, i) => {
          opt.textContent = `${opt.value} — ${octaveNames[i]}`;
        });

        const currentIndex = refs.elFretboardStrings.indexOf(elFretboardString);
        const currentStartNote = appStore.stateFretboardStartNotes.get()[currentIndex];
        elFretboardStringNoteSelect.value = currentStartNote.note;
        elFretboardNoteOctaveSelect.value = `${currentStartNote.octave}`;

        elFretboardNewStringNoteParams.addEventListener('submit', (e) => {
          e.preventDefault();
          const currentIndex = refs.elFretboardStrings.indexOf(elFretboardString);
          appStore.setFretboardStartNote({ note: <t.noteName>elFretboardStringNoteSelect.value, octave: Number(elFretboardNoteOctaveSelect.value), index: currentIndex });
          const popover = Popover.getInstance(elFretboardStartNoteContainer);
          if (popover) {
            popover.hide();
          }
        });

        return elFretboardNewStringNoteParams;
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
      const elAddFretboardStringConfirm = <HTMLButtonElement>refs.elAddFretboardStringConfirm.cloneNode(true);
      elAddFretboardStringConfirm.textContent = appStore.textFretboard.get().addStringLabel;
      elAddFretboardStringConfirm.addEventListener('click', () => {
        appStore.addFretboardString();
        const popover = Popover.getInstance(refs.elAddFretboardString);
        if (popover) {
          popover.hide();
        }
      });
      return elAddFretboardStringConfirm;
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

const initPresetScaleModal = (refs: t.domRefs, appStore: t.appStore): void => {
  const getPresetScaleVisibleDegreeCount = (presetScale: t.presetScale): number => {
    const visibleDegreesCount = presetScale.intervalPattern.filter((intervalStep) => intervalStep > 0).length;
    return visibleDegreesCount - presetScale.hiddenDegrees.length;
  };

  const getPresetScaleFamilyMood = (presetScale: t.presetScale): string => {
    const familyMood = [presetScale.mood, presetScale.family].filter(value => value.length > 0).join(', ');
    if (familyMood.length > 0) {
      return ` (${familyMood})`;
    }
    return '';
  };

  const getPresetScaleHiddenDegrees = (presetScale: t.presetScale): string => {
    if (presetScale.hiddenDegrees.length > 0) {
      return presetScale.hiddenDegrees.join(', ');
    }
    return '0';
  };

  const getPresetScaleCardTexts = (presetScale: t.presetScale, presetScaleTexts: t.presetScaleTexts): t.presetScaleCardTexts => {
    const visibleDegreesCount = getPresetScaleVisibleDegreeCount(presetScale);

    return {
      presetScaleName: presetScale.name,
      presetScaleFamilyMood: getPresetScaleFamilyMood(presetScale),
      presetScaleType: `${presetScale.scaleType}, ${visibleDegreesCount} ${presetScaleTexts.presetScaleNotes}`,
      presetScaleIntervalTonic: presetScale.tonic,
      presetScaleIntervalPattern: presetScale.intervalPattern.join(' '),
      presetScaleContextOffset: `${presetScale.contextOffset}`,
      presetScaleModalShift: `${presetScale.modalShift}`,
      presetScaleDegreeRotation: `${presetScale.degreeRotation}`,
      presetScaleHiddenDegrees: getPresetScaleHiddenDegrees(presetScale),
      presetScaleComment: presetScale.comment,
    };
  };

  const getPresetScaleCardLabels = (presetScaleTexts: t.presetScaleTexts): t.presetScaleCardLabels => ({
    labelPresetScaleType: presetScaleTexts.labelPresetScaleType,
    labelPresetScaleIntervalParams: presetScaleTexts.labelPresetScaleIntervalParams,
    labelPresetScaleContextOffset: presetScaleTexts.labelPresetScaleContextOffset,
    labelPresetScaleModalShift: presetScaleTexts.labelPresetScaleModalShift,
    labelPresetScaleDegreeRotation: presetScaleTexts.labelPresetScaleDegreeRotation,
    labelPresetScaleHiddenDegrees: presetScaleTexts.labelPresetScaleHiddenDegrees,
    labelPresetScaleComment: presetScaleTexts.labelPresetScaleComment,
  });

  const renderPresetScaleCardTexts = (elPresetScaleCard: HTMLDivElement, presetScaleCardTexts: t.presetScaleCardTexts): void => {
    const elPresetScaleCardTextElements = refs.getElPresetScaleCardTextElements(elPresetScaleCard);

    Object.entries(elPresetScaleCardTextElements).forEach(([key, elPresetScaleCardTextElement]) => {
      const presetScaleCardTextKey = <keyof t.presetScaleCardTexts>key;
      elPresetScaleCardTextElement.textContent = presetScaleCardTexts[presetScaleCardTextKey];
    });
  };

  const renderPresetScaleCardLabels = (elPresetScaleCard: HTMLDivElement, presetScaleCardLabels: t.presetScaleCardLabels): void => {
    const elPresetScaleCardLabelElements = refs.getElPresetScaleCardLabelElements(elPresetScaleCard);

    Object.entries(elPresetScaleCardLabelElements).forEach(([key, elPresetScaleCardLabelElement]) => {
      const presetScaleCardLabelKey = <keyof t.presetScaleCardLabels>key;
      elPresetScaleCardLabelElement.textContent = presetScaleCardLabels[presetScaleCardLabelKey];
    });
  };

  const renderPresetScaleCardActionButtons = (elPresetScaleCard: HTMLDivElement, presetScale: t.presetScale): void => {
    const elPresetScaleCardActionButtons = refs.getElPresetScaleCardActionButtons(elPresetScaleCard);
    const presetScaleId = `${presetScale.id}`;
    const isActivePreset = appStore.stateActiveScalePresetId.get() === presetScale.id;
    const isCustomPreset = presetScale.isCustomPreset;
    const actionButtonClassNames = {
      applyActive: 'btn-outline-primary',
      applyDisabled: 'btn-outline-secondary',
      editActive: 'btn-outline-warning',
      editDisabled: 'btn-outline-secondary',
      removeActive: 'btn-outline-danger',
      removeDisabled: 'btn-outline-secondary',
    };

    elPresetScaleCardActionButtons.elApplyPresetScaleButton.dataset.presetScaleId = presetScaleId;
    elPresetScaleCardActionButtons.elEditPresetScaleButton.dataset.presetScaleId = presetScaleId;
    elPresetScaleCardActionButtons.elRemovePresetScaleButton.dataset.presetScaleId = presetScaleId;
    elPresetScaleCardActionButtons.elApplyPresetScaleButton.disabled = isActivePreset;
    elPresetScaleCardActionButtons.elApplyPresetScaleButton.classList.toggle(actionButtonClassNames.applyActive, !isActivePreset);
    elPresetScaleCardActionButtons.elApplyPresetScaleButton.classList.toggle(actionButtonClassNames.applyDisabled, isActivePreset);
    elPresetScaleCardActionButtons.elEditPresetScaleButton.disabled = !isCustomPreset;
    elPresetScaleCardActionButtons.elRemovePresetScaleButton.disabled = !isCustomPreset;
    elPresetScaleCardActionButtons.elEditPresetScaleButton.classList.toggle(actionButtonClassNames.editActive, isCustomPreset);
    elPresetScaleCardActionButtons.elEditPresetScaleButton.classList.toggle(actionButtonClassNames.editDisabled, !isCustomPreset);
    elPresetScaleCardActionButtons.elRemovePresetScaleButton.classList.toggle(actionButtonClassNames.removeActive, isCustomPreset);
    elPresetScaleCardActionButtons.elRemovePresetScaleButton.classList.toggle(actionButtonClassNames.removeDisabled, !isCustomPreset);
  };

  const renderPresetScaleCards = () => {
    const locale = appStore.stateLocale.get();
    const presetScaleTexts = <t.presetScaleTexts><unknown>appStore.textPresetScale.get();
    const presetScaleCardLabels = getPresetScaleCardLabels(presetScaleTexts);
    const elPresetScaleCards = d.SCALE_PRESETS[locale].map((presetScale) => {
      const elPresetScaleCard = <HTMLDivElement>refs.elPresetScaleCard.cloneNode(true);
      const elPresetScaleCardActionButtons = refs.getElPresetScaleCardActionButtons(elPresetScaleCard);

      elPresetScaleCardActionButtons.elApplyPresetScaleButton.addEventListener('click', () => {
        const presetScaleId = Number(elPresetScaleCardActionButtons.elApplyPresetScaleButton.dataset.presetScaleId);
        appStore.applyScalePreset(presetScaleId);
        Modal.getOrCreateInstance(refs.elPresetScaleModal).hide();
      });

      renderPresetScaleCardTexts(elPresetScaleCard, getPresetScaleCardTexts(presetScale, presetScaleTexts));
      renderPresetScaleCardLabels(elPresetScaleCard, presetScaleCardLabels);
      renderPresetScaleCardActionButtons(elPresetScaleCard, presetScale);

      return elPresetScaleCard;
    });

    refs.elPresetScaleList.replaceChildren(...elPresetScaleCards);
  };

  const renderPresetScaleModalButtonLabel = () => {
    const activeScalePresetId = appStore.stateActiveScalePresetId.get();
    if (activeScalePresetId === c.NO_ACTIVE_PRESET_ID) {
      refs.elPresetScaleModalButtonLabel.textContent = appStore.textContent.get().presetScaleModalTitle;
      return;
    }
    const locale = appStore.stateLocale.get();
    const activePresetScale = cu.find(d.SCALE_PRESETS[locale], ({ id }) => id === activeScalePresetId);
    refs.elPresetScaleModalButtonLabel.textContent = activePresetScale.name;
  };

  appStore.stateLocale.subscribe(renderPresetScaleCards);
  appStore.textPresetScale.subscribe(renderPresetScaleCards);
  appStore.stateActiveScalePresetId.subscribe(renderPresetScaleCards);
  appStore.stateActiveScalePresetId.subscribe(renderPresetScaleModalButtonLabel);
  appStore.stateLocale.subscribe(renderPresetScaleModalButtonLabel);
  appStore.textContent.subscribe(renderPresetScaleModalButtonLabel);
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
  const LABEL_PRESET_SCALE_PREFIX = 'label-preset-scale-';

  refs.elStaticContentElements.forEach((el) => {
    const value = <string>el.dataset.staticContent;
    let atom: t.i18nTextAtom;
    let key: string;
    if (value.startsWith(SCALE_PARAMS_PREFIX)) {
      atom = appStore.textScaleParams;
      key = kebabToCamel(value.slice(SCALE_PARAMS_PREFIX.length));
    } else if (value.startsWith(LABEL_PRESET_SCALE_PREFIX)) {
      atom = appStore.textPresetScale;
      key = kebabToCamel(value);
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
  initPresetScaleModal(refs, appStore);
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
    'scale-preset-shift': appStore.offsetScalePreset,
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
