import type { Atom, MapStore } from 'nanostores';

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

export type intervalSize = 1 | 2; // количество полутонов для построения интервала
export type contextOffset = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type degreeRotation = number;

export type intervalPattern = intervalSize[];

export type scaleBuildParams = {
  tonic: noteName
  intervalPattern: intervalPattern
  modalShift: number
};

export type scale = noteParams[];
export type scaleMap = Map<noteParams['pitchClass'], noteParams>;
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

export type applyModalShift = (intervalPattern: intervalPattern, modalShift: scaleBuildParams['modalShift']) => intervalPattern;

export type applyDegreeRotation = (resolvedScaleParams: resolvedScaleParams, degreeRotation: degreeRotation) => resolvedScaleParams;

export type applyContextTransform = (resolvedScaleParams: resolvedScaleParams, contextOffset: contextOffset) => resolvedScaleParams;

export type fretboardStartNoteParams = {
  note: noteName
  octave: number
};

export type fretboardNoteParams = {
  note: noteName | ''
  octave: number
  degree: degree
};

export type fretboardParams = {
  name: string
  startNotes: fretboardStartNoteParams[]
};

export type scaleLayout = fretboardNoteParams[];

export type scaleLayouts = scaleLayout[];

export type mapScaleToLayout = (layoutParams: { scaleMap: scaleMap, startNotes: fretboardStartNoteParams[] }) => scaleLayouts;

// UI level (user intention)
export type control = 'tonic-shift' | 'modal-shift' | 'degree-rotation' | 'context-shift';

export type controlDirection = 'up' | 'down';

export type controlDirectionHandler = (control: control, direction: controlDirection) => void;

// Business logic level (scale transformation)
export type offsetScaleParam = (offset: number) => void;
export type switchDegreeVisibility = (degree: degree) => void;
export type setFretboardStartNote = (startNoteParams: fretboardStartNoteParams & { index: number }) => void;

export type store = {
  stateScaleBuildParams: MapStore<scaleBuildParams>
  stateContextOffset: Atom<number>
  stateCurrentNoteChromaticIndex: Atom<number>
  stateResolvedScaleParams: Atom<resolvedScaleParams>
  stateUnshiftResolvedScaleParams: Atom<resolvedScaleParams>
  stateDegreeRotation: Atom<number>
  stateHiddenDegrees: Atom<Set<degree>>
  stateFretboardStartNotes: Atom<fretboardStartNoteParams[]>
  stateFretboardLayout: Atom<scaleLayouts | null>
  offsetTonicShift: offsetScaleParam
  offsetModalShift: offsetScaleParam
  offsetDegreeRotation: offsetScaleParam
  offsetContext: offsetScaleParam
  switchDegreeVisibility: switchDegreeVisibility
  setFretboardStartNote: setFretboardStartNote
};

export type domRefs = {
  elThemeToggle: HTMLButtonElement
  elLocaleSwitch: HTMLButtonElement
  elTooltipTemplate: HTMLTemplateElement
  elDirectionControllers: NodeListOf<HTMLButtonElement>
  elResolveErrorContainer: HTMLParagraphElement
  //
  elTonicContainer: HTMLTableCellElement
  elContextContainer: HTMLTableCellElement
  elIntervalContainers: NodeListOf<HTMLTableCellElement>
  elScaleToneContainers: NodeListOf<HTMLTableCellElement>
  elSwitchDegreeContainers: NodeListOf<HTMLInputElement>
  //
  elKeyboardNotes: NodeListOf<HTMLTableCellElement>
  elFretboard: HTMLTableSectionElement
  elFretboardStrings: HTMLTableRowElement[]
  elFretboardStartNoteContainers: HTMLButtonElement[]
  elFretboardStringFrets: HTMLTableCellElement[][]
  elFretboardString: HTMLTableRowElement
  elFretboardNewStringNoteParams: HTMLFormElement
};

export type uiTheme = 'light' | 'dark';

export type locale = 'ru' | 'en';

export type savedValues = {
  theme: uiTheme
  locale: locale
};

export type uiStore = {
  theme: Atom<uiTheme>
  toggleTheme: () => void
  stateLocale: Atom<locale>
  switchLocale: () => void
};

export type appStore = store & uiStore;
