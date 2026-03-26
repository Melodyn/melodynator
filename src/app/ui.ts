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

const initScaleConfigSettingsPopover = (refs: t.domRefs, appStore: t.appStore): void => {
  let scaleConfigSettingsElements: t.scaleConfigSettingsElements | null = null;

  const renderScaleConfigSettings = (): void => {
    if (!scaleConfigSettingsElements) {
      return;
    }
    const scaleParamsTexts = appStore.textScaleParams.get();
    scaleConfigSettingsElements.elIntervalDisplayLabel.textContent = scaleParamsTexts.intervalLetters;
    scaleConfigSettingsElements.elEnharmonicSimplifyLabel.textContent = scaleParamsTexts.reduceAccidentals;
    scaleConfigSettingsElements.elIntervalDisplaySwitch.checked = appStore.stateIntervalDisplayMode.get() === 'letter';
    scaleConfigSettingsElements.elEnharmonicSimplifySwitch.checked = appStore.stateIsEnharmonicSimplify.get();
  };

  new Popover(refs.elScaleConfigSettingsButton, {
    html: true,
    sanitize: false,
    content: () => {
      const elScaleConfigSettings = <HTMLDivElement>refs.elScaleConfigSettings.cloneNode(true);
      scaleConfigSettingsElements = refs.getElScaleConfigSettingsElements(elScaleConfigSettings);

      scaleConfigSettingsElements.elIntervalDisplaySwitch.addEventListener('change', () => {
        appStore.switchIntervalDisplayMode();
      });
      scaleConfigSettingsElements.elEnharmonicSimplifySwitch.addEventListener('change', () => {
        appStore.switchEnharmonicSimplify();
      });

      renderScaleConfigSettings();

      return elScaleConfigSettings;
    },
  });

  refs.elScaleConfigSettingsButton.addEventListener('hidden.bs.popover', () => {
    scaleConfigSettingsElements = null;
  });

  appStore.textScaleParams.subscribe(renderScaleConfigSettings);
  appStore.stateIntervalDisplayMode.subscribe(renderScaleConfigSettings);
  appStore.stateIsEnharmonicSimplify.subscribe(renderScaleConfigSettings);
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
    const startNotePopover = Popover.getInstance(elStartNoteButton);
    if (startNotePopover) {
      startNotePopover.dispose();
    }
    if (index >= c.MIN_FRETBOARD_STRINGS) {
      const elNumberButton = refs.getElFretboardStringNumberButton(elFretboardString);
      const numberPopover = Popover.getInstance(elNumberButton);
      if (numberPopover) {
        numberPopover.dispose();
      }
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
    while (refs.elFretboardStrings.length < startNotes.length) {
      addStringRow();
    }
    while (refs.elFretboardStrings.length > startNotes.length) {
      removeStringRow(refs.elFretboardStrings.length - 1);
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
    const elPresetScaleCardHeader = refs.getElPresetScaleCardHeader(elPresetScaleCard);
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
    elPresetScaleCardHeader.classList.toggle('bg-primary-subtle', isActivePreset);
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

const initPresetFretboardModal = (refs: t.domRefs, appStore: t.appStore): void => {
  const getPresetFretboardStringsCount = (
    presetInstrument: t.presetInstrument,
    fretboardTexts: Record<string, string>,
  ): string => `${presetInstrument.startNotes.length} ${fretboardTexts.presetStrings}`;

  const getPresetFretboardNotes = (presetInstrument: t.presetInstrument): string =>
    [...presetInstrument.startNotes]
      .reverse()
      .map(({ note, octave }) => `${note}${octave}`)
      .join(' ');

  const getPresetFretboardCardTexts = (
    presetInstrument: t.presetInstrument,
    fretboardTexts: Record<string, string>,
  ): t.presetFretboardCardTexts => ({
    presetFretboardName: presetInstrument.name,
    presetFretboardStringsCount: `, ${getPresetFretboardStringsCount(presetInstrument, fretboardTexts)}`,
    presetFretboardTuning: presetInstrument.tuning,
    presetFretboardNotes: getPresetFretboardNotes(presetInstrument),
    presetFretboardComment: presetInstrument.comment,
  });

  const getPresetFretboardCardLabels = (fretboardTexts: Record<string, string>): t.presetFretboardCardLabels => ({
    labelPresetFretboardTuning: `${fretboardTexts.presetTuning}: `,
    labelPresetFretboardNotes: `${fretboardTexts.presetNotes}: `,
    labelPresetFretboardComment: `${fretboardTexts.presetComment}: `,
  });

  const renderPresetFretboardCardTexts = (
    elPresetFretboardCard: HTMLDivElement,
    presetFretboardCardTexts: t.presetFretboardCardTexts,
  ): void => {
    const elPresetFretboardCardTextElements = refs.getElPresetFretboardCardTextElements(elPresetFretboardCard);

    Object.entries(elPresetFretboardCardTextElements).forEach(([key, elPresetFretboardCardTextElement]) => {
      const presetFretboardCardTextKey = <keyof t.presetFretboardCardTexts>key;
      elPresetFretboardCardTextElement.textContent = presetFretboardCardTexts[presetFretboardCardTextKey];
    });
  };

  const renderPresetFretboardCardLabels = (
    elPresetFretboardCard: HTMLDivElement,
    presetFretboardCardLabels: t.presetFretboardCardLabels,
  ): void => {
    const elPresetFretboardCardLabelElements = refs.getElPresetFretboardCardLabelElements(elPresetFretboardCard);

    Object.entries(elPresetFretboardCardLabelElements).forEach(([key, elPresetFretboardCardLabelElement]) => {
      const presetFretboardCardLabelKey = <keyof t.presetFretboardCardLabels>key;
      elPresetFretboardCardLabelElement.textContent = presetFretboardCardLabels[presetFretboardCardLabelKey];
    });
  };

  const renderPresetFretboardCardActionButtons = (elPresetFretboardCard: HTMLDivElement, presetInstrument: t.presetInstrument): void => {
    const elPresetFretboardCardActionButtons = refs.getElPresetFretboardCardActionButtons(elPresetFretboardCard);
    const elPresetFretboardCardHeader = refs.getElPresetFretboardCardHeader(elPresetFretboardCard);
    const presetInstrumentId = `${presetInstrument.id}`;
    const isActivePreset = appStore.stateActiveFretboardPresetId.get() === presetInstrument.id;
    const isCustomPreset = presetInstrument.isCustomPreset;
    const actionButtonClassNames = {
      applyActive: 'btn-outline-primary',
      applyDisabled: 'btn-outline-secondary',
      editActive: 'btn-outline-warning',
      editDisabled: 'btn-outline-secondary',
      removeActive: 'btn-outline-danger',
      removeDisabled: 'btn-outline-secondary',
    };

    elPresetFretboardCardActionButtons.elApplyPresetFretboardButton.dataset.presetFretboardId = presetInstrumentId;
    elPresetFretboardCardActionButtons.elEditPresetFretboardButton.dataset.presetFretboardId = presetInstrumentId;
    elPresetFretboardCardActionButtons.elRemovePresetFretboardButton.dataset.presetFretboardId = presetInstrumentId;
    elPresetFretboardCardActionButtons.elApplyPresetFretboardButton.disabled = isActivePreset;
    elPresetFretboardCardActionButtons.elApplyPresetFretboardButton.classList.toggle(actionButtonClassNames.applyActive, !isActivePreset);
    elPresetFretboardCardActionButtons.elApplyPresetFretboardButton.classList.toggle(actionButtonClassNames.applyDisabled, isActivePreset);
    elPresetFretboardCardHeader.classList.toggle('bg-primary-subtle', isActivePreset);
    elPresetFretboardCardActionButtons.elEditPresetFretboardButton.disabled = !isCustomPreset;
    elPresetFretboardCardActionButtons.elRemovePresetFretboardButton.disabled = !isCustomPreset;
    elPresetFretboardCardActionButtons.elEditPresetFretboardButton.classList.toggle(actionButtonClassNames.editActive, isCustomPreset);
    elPresetFretboardCardActionButtons.elEditPresetFretboardButton.classList.toggle(actionButtonClassNames.editDisabled, !isCustomPreset);
    elPresetFretboardCardActionButtons.elRemovePresetFretboardButton.classList.toggle(actionButtonClassNames.removeActive, isCustomPreset);
    elPresetFretboardCardActionButtons.elRemovePresetFretboardButton.classList.toggle(actionButtonClassNames.removeDisabled, !isCustomPreset);
  };

  const renderPresetFretboardCards = () => {
    const locale = appStore.stateLocale.get();
    const fretboardTexts = appStore.textFretboard.get();
    const presetFretboardCardLabels = getPresetFretboardCardLabels(fretboardTexts);
    const elPresetFretboardCards = d.FRETBOARD_PRESETS[locale].map((presetInstrument) => {
      const elPresetFretboardCard = <HTMLDivElement>refs.elPresetFretboardCard.cloneNode(true);
      const elPresetFretboardCardActionButtons = refs.getElPresetFretboardCardActionButtons(elPresetFretboardCard);

      elPresetFretboardCardActionButtons.elApplyPresetFretboardButton.addEventListener('click', () => {
        const presetInstrumentId = Number(elPresetFretboardCardActionButtons.elApplyPresetFretboardButton.dataset.presetFretboardId);
        appStore.applyFretboardPreset(presetInstrumentId);
        Modal.getOrCreateInstance(refs.elPresetFretboardModal).hide();
      });

      renderPresetFretboardCardTexts(elPresetFretboardCard, getPresetFretboardCardTexts(presetInstrument, fretboardTexts));
      renderPresetFretboardCardLabels(elPresetFretboardCard, presetFretboardCardLabels);
      renderPresetFretboardCardActionButtons(elPresetFretboardCard, presetInstrument);

      return elPresetFretboardCard;
    });

    refs.elPresetFretboardList.replaceChildren(...elPresetFretboardCards);
  };

  const renderPresetFretboardModalButtonLabel = () => {
    const activeFretboardPresetId = appStore.stateActiveFretboardPresetId.get();
    if (activeFretboardPresetId === c.NO_ACTIVE_PRESET_ID) {
      refs.elPresetFretboardModalButtonLabel.textContent = appStore.textContent.get().presetFretboardModalTitle;
      return;
    }
    const locale = appStore.stateLocale.get();
    const activePresetFretboard = cu.find(d.FRETBOARD_PRESETS[locale], ({ id }) => id === activeFretboardPresetId);
    refs.elPresetFretboardModalButtonLabel.textContent = `${activePresetFretboard.name}, ${activePresetFretboard.tuning}`;
  };

  appStore.stateLocale.subscribe(renderPresetFretboardCards);
  appStore.textFretboard.subscribe(renderPresetFretboardCards);
  appStore.stateActiveFretboardPresetId.subscribe(renderPresetFretboardCards);
  appStore.stateActiveFretboardPresetId.subscribe(renderPresetFretboardModalButtonLabel);
  appStore.stateLocale.subscribe(renderPresetFretboardModalButtonLabel);
  appStore.textContent.subscribe(renderPresetFretboardModalButtonLabel);
  appStore.textFretboard.subscribe(renderPresetFretboardModalButtonLabel);
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
  initScaleConfigSettingsPopover(refs, appStore);
  initFretboard(refs, appStore);
  initPresetScaleModal(refs, appStore);
  initPresetFretboardModal(refs, appStore);
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
    'fretboard-preset-shift': appStore.offsetFretboardPreset,
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

  refs.elDegreeSwitchContainers.forEach((el) => {
    el.addEventListener('click', () => {
      appStore.switchDegreeVisibility(Number(el.value));
    });
  });

  return refs;
};
