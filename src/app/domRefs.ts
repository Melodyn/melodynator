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
  const elPresetScaleModalButtonLabel = qs<HTMLSpanElement>('[data-container="preset-scale-modal-button-label"]');
  const elPresetScaleModal = qs<HTMLDivElement>('[data-container="preset-scale-modal"]');
  const elPresetScaleList = qs<HTMLDivElement>('[data-container="preset-scale-list"]');
  const elScaleToneContainers = qsa<HTMLTableCellElement>('[data-container="scale-tone"]');
  const elDegreeSwitchContainers = qsa<HTMLInputElement>('[data-container="degree-switch"]');
  const elDegreeSwitchLabels = Array.from(elDegreeSwitchContainers).map((elDegreeSwitchContainer) => {
    const degreeSwitchLabels = elDegreeSwitchContainer.labels;
    if (degreeSwitchLabels && degreeSwitchLabels.length > 0) {
      const [elDegreeSwitchLabel] = degreeSwitchLabels;
      if (elDegreeSwitchLabel) {
        return elDegreeSwitchLabel;
      }
    }
    throw new Error(`Missing label for degree switch "${elDegreeSwitchContainer.id}"`);
  });

  const elKeyboardNotes = qsa<HTMLTableCellElement>('[data-instrument="keyboard-note"]');

  const elFretboard = qs<HTMLTableSectionElement>('[data-instrument="fretboard"]');
  const elFretboardStrings: HTMLTableRowElement[] = [];
  const elFretboardStartNoteContainers: HTMLButtonElement[] = [];
  const elFretboardStringFrets: HTMLTableCellElement[][] = [];
  const elFretboardString = <HTMLTableRowElement>qs<HTMLTemplateElement>('[data-template="fretboard-string"]').content.firstElementChild;
  const elPresetScaleCard = <HTMLDivElement>qs<HTMLTemplateElement>('[data-template="preset-scale-card"]').content.firstElementChild;
  const elFretboardNewStringNoteParams = <HTMLFormElement>qs<HTMLTemplateElement>('[data-template="fretboard-set-string-params"]').content.firstElementChild;
  const elNoteList = qs<HTMLSelectElement>('[data-select="fretboard-string-note"]', elFretboardNewStringNoteParams);
  const elNoteListItemTemplate = <HTMLOptionElement>elNoteList.firstElementChild;
  elNoteList.innerHTML = '';
  c.allNotesNames.forEach((name) => {
    const elNoteListItem = <HTMLOptionElement>elNoteListItemTemplate.cloneNode();
    elNoteListItem.value = name;
    elNoteListItem.textContent = name;
    elNoteList.appendChild(elNoteListItem);
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
  const getElPresetScaleCardTextElements = (el: HTMLDivElement): t.presetScaleCardTextElements => ({
    presetScaleName: qs<HTMLSpanElement>(`[data-container="${c.PRESET_SCALE_CARD_CONTAINERS.presetScaleName}"]`, el),
    presetScaleFamilyMood: qs<HTMLSpanElement>(`[data-container="${c.PRESET_SCALE_CARD_CONTAINERS.presetScaleFamilyMood}"]`, el),
    presetScaleType: qs<HTMLSpanElement>(`[data-container="${c.PRESET_SCALE_CARD_CONTAINERS.presetScaleType}"]`, el),
    presetScaleIntervalTonic: qs<HTMLSpanElement>(`[data-container="${c.PRESET_SCALE_CARD_CONTAINERS.presetScaleIntervalTonic}"]`, el),
    presetScaleIntervalPattern: qs<HTMLSpanElement>(`[data-container="${c.PRESET_SCALE_CARD_CONTAINERS.presetScaleIntervalPattern}"]`, el),
    presetScaleContextOffset: qs<HTMLSpanElement>(`[data-container="${c.PRESET_SCALE_CARD_CONTAINERS.presetScaleContextOffset}"]`, el),
    presetScaleModalShift: qs<HTMLSpanElement>(`[data-container="${c.PRESET_SCALE_CARD_CONTAINERS.presetScaleModalShift}"]`, el),
    presetScaleDegreeRotation: qs<HTMLSpanElement>(`[data-container="${c.PRESET_SCALE_CARD_CONTAINERS.presetScaleDegreeRotation}"]`, el),
    presetScaleHiddenDegrees: qs<HTMLSpanElement>(`[data-container="${c.PRESET_SCALE_CARD_CONTAINERS.presetScaleHiddenDegrees}"]`, el),
    presetScaleComment: qs<HTMLSpanElement>(`[data-container="${c.PRESET_SCALE_CARD_CONTAINERS.presetScaleComment}"]`, el),
  });
  const getElPresetScaleCardLabelElements = (el: HTMLDivElement): t.presetScaleCardLabelElements => ({
    labelPresetScaleType: qs<HTMLSpanElement>(`[data-static-content="${c.PRESET_SCALE_CARD_STATIC_CONTENTS.labelPresetScaleType}"]`, el),
    labelPresetScaleIntervalParams: qs<HTMLSpanElement>(`[data-static-content="${c.PRESET_SCALE_CARD_STATIC_CONTENTS.labelPresetScaleIntervalParams}"]`, el),
    labelPresetScaleContextOffset: qs<HTMLSpanElement>(`[data-static-content="${c.PRESET_SCALE_CARD_STATIC_CONTENTS.labelPresetScaleContextOffset}"]`, el),
    labelPresetScaleModalShift: qs<HTMLSpanElement>(`[data-static-content="${c.PRESET_SCALE_CARD_STATIC_CONTENTS.labelPresetScaleModalShift}"]`, el),
    labelPresetScaleDegreeRotation: qs<HTMLSpanElement>(`[data-static-content="${c.PRESET_SCALE_CARD_STATIC_CONTENTS.labelPresetScaleDegreeRotation}"]`, el),
    labelPresetScaleHiddenDegrees: qs<HTMLSpanElement>(`[data-static-content="${c.PRESET_SCALE_CARD_STATIC_CONTENTS.labelPresetScaleHiddenDegrees}"]`, el),
    labelPresetScaleComment: qs<HTMLSpanElement>(`[data-static-content="${c.PRESET_SCALE_CARD_STATIC_CONTENTS.labelPresetScaleComment}"]`, el),
  });
  const getElPresetScaleCardActionButtons = (el: HTMLDivElement): t.presetScaleCardActionButtons => ({
    elApplyPresetScaleButton: qs<HTMLButtonElement>('[data-control="apply-preset-scale"]', el),
    elEditPresetScaleButton: qs<HTMLButtonElement>('[data-control="edit-preset-scale"]', el),
    elRemovePresetScaleButton: qs<HTMLButtonElement>('[data-control="remove-preset-scale"]', el),
  });

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
    elPresetScaleModalButtonLabel,
    elPresetScaleModal,
    elPresetScaleList,
    elScaleToneContainers,
    elDegreeSwitchContainers,
    elDegreeSwitchLabels,
    elKeyboardNotes,
    elFretboard,
    elFretboardStrings,
    elFretboardStartNoteContainers,
    elFretboardStringFrets,
    elFretboardString,
    elPresetScaleCard,
    elFretboardNewStringNoteParams,
    elAddFretboardString,
    elAddFretboardStringConfirm,
    elRemoveFretboardStringConfirm,
    getElFretboardStringNumberButton,
    getElFretboardStartNoteContainer,
    getElFretboardStringFrets,
    getElPresetScaleCardTextElements,
    getElPresetScaleCardLabelElements,
    getElPresetScaleCardActionButtons,
    getElIntervalStepSelect,
    getElFretboardStringNoteSelect,
    getElFretboardNoteOctaveSelect,
  };
};
