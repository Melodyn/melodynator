import type { Atom, MapStore, ReadableAtom } from 'nanostores';

export type naturalNoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type flatSymbol = '♭';
export type sharpSymbol = '♯';
export type accidental = flatSymbol | sharpSymbol | '';
export type noteName = `${naturalNoteName}${accidental}`;
export type degree = number;

export type octaveParams = {
  sinceNumber: number
  nameHelmholtz: string
};

export type naturalNoteParams = {
  note: naturalNoteName
  degree: degree
  naturalPitchClass: number
};

export type noteParams = {
  note: noteName
  degree: number
  pitchClass: number
};

export type chromaticScaleNoteParams = Pick<noteParams, 'note' | 'pitchClass'>;

export type intervalSize = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12; // количество полутонов для построения интервала
export type intervalDisplayMode = 'digit' | 'letter';
export type contextOffset = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type degreeRotation = number;

export type intervalPattern = [intervalSize, intervalSize, intervalSize, intervalSize, intervalSize, intervalSize, intervalSize];

export type scaleBuildParams = {
  tonic: noteName
  intervalPattern: intervalPattern
  modalShift: number
};

export type scale = noteParams[];
export type chromaticScale = chromaticScaleNoteParams[];
export type scaleMap = Map<noteParams['pitchClass'], noteParams>;
export type altReduceMap = Map<noteName, noteName>;
export type scaleToMap = (scale: scale) => scaleMap;

export type resolvedScaleParams = {
  scale: scale
  intervalPattern: intervalPattern
  canModalShift: boolean
  canApplyContext: boolean
  contextTargets: noteName[]
};

export type resolveScale = (scaleBuildParams: scaleBuildParams) => resolvedScaleParams;

export type buildDiatonicScale = (scaleBuildParams: Pick<scaleBuildParams, 'tonic' | 'intervalPattern'>) => scale;
export type buildChromaticScale = (accidental: flatSymbol | sharpSymbol) => chromaticScale;

export type applyModalShift = (intervalPattern: intervalPattern, modalShift: scaleBuildParams['modalShift']) => intervalPattern;

export type applyDegreeRotation = (resolvedScaleParams: resolvedScaleParams, degreeRotation: degreeRotation) => resolvedScaleParams;

export type applyContextTransform = (resolvedScaleParams: resolvedScaleParams, contextOffset: contextOffset) => resolvedScaleParams;

export type fretboardStartNoteParams = {
  note: noteName
  octave: number
};

export type chromaticNoteParams = {
  note: noteName
  pitchClass: number
  octave: number
};

export type fretboardNoteParams = {
  note: noteName | ''
  pitchClass: number
  octave: number
  degree: degree
};

export type presetInstrument = {
  id: number
  name: string
  tuning: string
  comment: string
  startNotes: fretboardStartNoteParams[]
  isCustomPreset: boolean
};

export type presetInstruments = presetInstrument[];

export type presetScale = {
  id: number
  name: string
  scaleType: string
  tonic: noteName
  intervalPattern: intervalPattern
  modalShift: number
  contextOffset: number
  degreeRotation: number
  hiddenDegrees: degree[]
  mood: string
  family: string
  comment: string
  isCustomPreset: boolean
};

export type presetScales = presetScale[];

export type presetScaleCardTexts = {
  presetScaleName: string
  presetScaleFamilyMood: string
  presetScaleType: string
  presetScaleIntervalTonic: string
  presetScaleIntervalPattern: string
  presetScaleContextOffset: string
  presetScaleModalShift: string
  presetScaleDegreeRotation: string
  presetScaleHiddenDegrees: string
  presetScaleComment: string
};

export type presetScaleCardLabels = {
  labelPresetScaleType: string
  labelPresetScaleIntervalParams: string
  labelPresetScaleContextOffset: string
  labelPresetScaleModalShift: string
  labelPresetScaleDegreeRotation: string
  labelPresetScaleHiddenDegrees: string
  labelPresetScaleComment: string
};

export type presetScaleTexts = presetScaleCardLabels & {
  presetScaleNotes: string
};

export type presetScaleCardTextElements = {
  [key in keyof presetScaleCardTexts]: HTMLSpanElement
};

export type presetScaleCardLabelElements = {
  [key in keyof presetScaleCardLabels]: HTMLSpanElement
};

export type presetScaleCardActionButtons = {
  elApplyPresetScaleButton: HTMLButtonElement
  elEditPresetScaleButton: HTMLButtonElement
  elRemovePresetScaleButton: HTMLButtonElement
};

export type presetFretboardCardTexts = {
  presetFretboardName: string
  presetFretboardStringsCount: string
  presetFretboardTuning: string
  presetFretboardNotes: string
  presetFretboardComment: string
};

export type presetFretboardCardLabels = {
  labelPresetFretboardTuning: string
  labelPresetFretboardNotes: string
  labelPresetFretboardComment: string
};

export type presetFretboardCardTextElements = {
  [key in keyof presetFretboardCardTexts]: HTMLSpanElement
};

export type presetFretboardCardLabelElements = {
  [key in keyof presetFretboardCardLabels]: HTMLSpanElement
};

export type presetFretboardCardActionButtons = {
  elApplyPresetFretboardButton: HTMLButtonElement
  elEditPresetFretboardButton: HTMLButtonElement
  elRemovePresetFretboardButton: HTMLButtonElement
};

export type scaleConfigSettingsElements = {
  elIntervalDisplaySwitch: HTMLInputElement
  elEnharmonicSimplifySwitch: HTMLInputElement
  elIntervalDisplayLabel: HTMLLabelElement
  elEnharmonicSimplifyLabel: HTMLLabelElement
};

export type scaleLayout = fretboardNoteParams[];

export type scaleLayouts = scaleLayout[];

export type mapScaleToLayout = (layoutParams: { scaleMap: scaleMap, startNotes: fretboardStartNoteParams[] }) => scaleLayouts;

// UI level (user intention)
export type setIntervalStep = (params: { degree: degree, step: intervalSize }) => void;
export type control = 'tonic-shift' | 'modal-shift' | 'degree-rotation' | 'context-shift' | 'scale-preset-shift' | 'fretboard-preset-shift' | 'keyboard-audio-octave';

export type controlDirection = 'up' | 'down';

export type controlDirectionHandler = (control: control, direction: controlDirection) => void;

// Business logic level (scale transformation)
export type offsetScaleParam = (offset: number) => void;
export type switchDegreeVisibility = (degree: degree) => void;
export type setFretboardStartNote = (startNoteParams: fretboardStartNoteParams & { index: number }) => void;
export type addFretboardString = () => void;
export type removeFretboardString = (index: number) => void;
export type applyScalePreset = (presetScaleId: number) => void;
export type applyFretboardPreset = (presetInstrumentId: number) => void;
export type offsetScalePreset = offsetScaleParam;
export type offsetFretboardPreset = offsetScaleParam;

export type store = {
  stateScaleBuildParams: MapStore<scaleBuildParams>
  stateContextOffset: Atom<number>
  stateCurrentNoteChromaticIndex: Atom<number>
  stateResolvedScaleParams: Atom<resolvedScaleParams>
  stateUnshiftResolvedScaleParams: Atom<resolvedScaleParams>
  stateDegreeRotation: Atom<number>
  stateHiddenDegrees: Atom<Set<degree>>
  stateFretboardStartNotes: Atom<fretboardStartNoteParams[]>
  stateChromaticScale: ReadableAtom<chromaticScale>
  stateFretboardLayout: Atom<scaleLayouts>
  stateKeyboardAudioStartOctave: Atom<number>
  offsetKeyboardAudioStartOctave: (offset: number) => void
  stateKeyboardAudioLayout: ReadableAtom<chromaticNoteParams[]>
  offsetTonicShift: offsetScaleParam
  offsetModalShift: offsetScaleParam
  offsetDegreeRotation: offsetScaleParam
  offsetContext: offsetScaleParam
  switchDegreeVisibility: switchDegreeVisibility
  setFretboardStartNote: setFretboardStartNote
  addFretboardString: addFretboardString
  removeFretboardString: removeFretboardString
  setIntervalStep: setIntervalStep
  applyScalePreset: applyScalePreset
  applyFretboardPreset: applyFretboardPreset
  offsetScalePreset: offsetScalePreset
  offsetFretboardPreset: offsetFretboardPreset
  stateActiveScalePresetId: Atom<number>
  stateActiveFretboardPresetId: Atom<number>
};

export type domRefs = {
  elBody: HTMLElement
  elThemeSwitch: HTMLButtonElement
  elLocaleSwitch: HTMLButtonElement
  elTooltipTemplate: HTMLTemplateElement
  elTooltipPlaceholders: NodeListOf<HTMLElement>
  elStaticContentElements: NodeListOf<HTMLElement>
  elDirectionControllers: NodeListOf<HTMLButtonElement>
  elResolveErrorContainer: HTMLParagraphElement
  elTonicContainer: HTMLTableCellElement
  elContextContainer: HTMLTableCellElement
  elIntervalContainers: NodeListOf<HTMLTableCellElement>
  elSetIntervalSteps: HTMLButtonElement[]
  elScaleConfigSettingsButton: HTMLButtonElement
  elScaleConfigSettings: HTMLDivElement
  elIntervalStepParams: HTMLFormElement
  elPresetScaleModalButtonLabel: HTMLSpanElement
  elPresetScaleModal: HTMLDivElement
  elPresetScaleList: HTMLDivElement
  elPresetFretboardModalButtonLabel: HTMLSpanElement
  elPresetFretboardModal: HTMLDivElement
  elPresetFretboardList: HTMLDivElement
  elScaleToneContainers: NodeListOf<HTMLTableCellElement>
  elDegreeSwitchContainers: NodeListOf<HTMLInputElement>
  elDegreeSwitchLabels: HTMLLabelElement[]
  elKeyboardAudioStartOctaveContainer: HTMLSpanElement
  elKeyboardAudioStartOctaveName: HTMLSpanElement
  elKeyboardKeys: NodeListOf<HTMLTableCellElement>
  elKeyboardNotes: NodeListOf<HTMLTableCellElement>
  elFretboard: HTMLTableSectionElement
  elFretboardStrings: HTMLTableRowElement[]
  elFretboardStartNoteContainers: HTMLButtonElement[]
  elFretboardStringFrets: HTMLTableCellElement[][]
  elFretboardString: HTMLTableRowElement
  elPresetScaleCard: HTMLDivElement
  elPresetFretboardCard: HTMLDivElement
  elFretboardNewStringNoteParams: HTMLFormElement
  elAddFretboardString: HTMLButtonElement
  elAddFretboardStringConfirm: HTMLButtonElement
  elRemoveFretboardStringConfirm: HTMLButtonElement
  getElFretboardStringNumberButton: (el: HTMLTableRowElement) => HTMLButtonElement
  getElFretboardStartNoteContainer: (el: HTMLTableRowElement) => HTMLButtonElement
  getElFretboardStringFrets: (el: HTMLTableRowElement) => HTMLTableCellElement[]
  getElPresetScaleCardTextElements: (el: HTMLDivElement) => presetScaleCardTextElements
  getElPresetScaleCardLabelElements: (el: HTMLDivElement) => presetScaleCardLabelElements
  getElPresetScaleCardActionButtons: (el: HTMLDivElement) => presetScaleCardActionButtons
  getElPresetScaleCardHeader: (el: HTMLDivElement) => HTMLDivElement
  getElPresetFretboardCardTextElements: (el: HTMLDivElement) => presetFretboardCardTextElements
  getElPresetFretboardCardLabelElements: (el: HTMLDivElement) => presetFretboardCardLabelElements
  getElPresetFretboardCardActionButtons: (el: HTMLDivElement) => presetFretboardCardActionButtons
  getElPresetFretboardCardHeader: (el: HTMLDivElement) => HTMLDivElement
  getElScaleConfigSettingsElements: (el: HTMLDivElement) => scaleConfigSettingsElements
  getElIntervalStepSelect: (form: HTMLFormElement) => HTMLSelectElement
  getElFretboardStringNoteSelect: (form: HTMLFormElement) => HTMLSelectElement
  getElFretboardNoteOctaveSelect: (form: HTMLFormElement) => HTMLSelectElement
};

export type uiTheme = 'light' | 'dark';

export type locale = 'ru' | 'en';

export type savedValues = {
  theme: uiTheme
  locale: locale
  tonic: noteName
  intervalPattern: intervalPattern
  modalShift: number
  contextOffset: contextOffset
  degreeRotation: number
  hiddenDegrees: degree[]
  startNotes: fretboardStartNoteParams[]
  activeScalePresetId: number
  activeFretboardPresetId: number
  isEnharmonicSimplify: boolean
  intervalDisplayMode: intervalDisplayMode
  keyboardAudioStartOctave: number
};

export type savedKeys = keyof savedValues;

export type uiStore = {
  theme: Atom<uiTheme>
  toggleTheme: () => void
  stateIntervalDisplayMode: Atom<intervalDisplayMode>
  switchIntervalDisplayMode: () => void
  stateIsEnharmonicSimplify: Atom<boolean>
  switchEnharmonicSimplify: () => void
};

export type i18nTextAtom = ReadableAtom<Record<string, string>>;

export type i18nErrors = {
  resolveError: (params: Record<string, string>) => string
  openPatternError: string
};

export type i18nStore = {
  stateLocale: Atom<locale>
  switchLocale: () => void
  textScaleParams: i18nTextAtom
  textTooltips: i18nTextAtom
  textFretboard: i18nTextAtom
  textContent: i18nTextAtom
  textErrors: ReadableAtom<i18nErrors>
  textIntervals: i18nTextAtom
  textPresetScale: i18nTextAtom
};

export type appStore = store & uiStore & i18nStore;

export type i18nData<T> = {
  [key in locale]: T
};
