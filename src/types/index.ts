import type { Atom, MapStore } from 'nanostores';

export type naturalNoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type flatSymbol = '♭';
export type sharpSymbol = '♯';
export type accidental = flatSymbol | sharpSymbol | '';
export type noteName = `${naturalNoteName}${accidental}`;

export type octaveParams = {
  sinceNumber: number
  nameHelmholtz: string
};

export type naturalNoteParams = {
  note: naturalNoteName
  degree: number
  naturalPitchClass: number
};

export type noteParams = {
  note: noteName
  degree: number
  pitchClass: number
};

export type intervalSize = 1 | 2; // количество полутонов для построения интервала
export type harmonicIntervalSize = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
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
  canHarmonicTransform: boolean
  harmonicTargets: noteName[]
};

export type resolveScale = (scaleBuildParams: scaleBuildParams) => resolvedScaleParams;

export type buildDiatonicScale = (scaleBuildParams: Pick<scaleBuildParams, 'tonic' | 'intervalPattern'>) => scale;

export type applyModalShift = (intervalPattern: intervalPattern, modalShift: scaleBuildParams['modalShift']) => intervalPattern;

export type applyDegreeRotation = (resolvedScaleParams: resolvedScaleParams, degreeRotation: degreeRotation) => resolvedScaleParams;

export type applyHarmonicTransform = (resolvedScaleParams: resolvedScaleParams, harmonicIntervalSize: harmonicIntervalSize) => resolvedScaleParams;

export type instrumentStartNoteParams = {
  note: noteName
  octave: number;
};

export type instrumentNoteParams = {
  note: noteName | ''
  octave: number;
};

export type instrumentParams = {
  name: string
  startNotes: instrumentStartNoteParams[]
  scaleMap: scaleMap
};

export type scaleLayout = instrumentNoteParams[];

export type scaleLayouts = scaleLayout[];

export type mapScaleToLayout = (instrumentParams: instrumentParams) => scaleLayouts;

export type direction = 'up' | 'down';

export type directionOffset = -1 | 1;

export type changer = (offset: directionOffset) => void;

export type directionControl = 'tonic-shift' | 'modal-shift' | 'degree-rotation' | 'harmonic-transform';

export type directionHandler = (control: directionControl, direction: direction) => void;

export type querySelectorParam = Parameters<typeof document.querySelector>[0];

export type store = {
  stateScaleBuildParams: MapStore<scaleBuildParams>
  stateHarmonicIntervalSize: Atom<number>
  stateCurrentNoteChromaticIndex: Atom<number>
  stateResolvedScaleParams: Atom<resolvedScaleParams>
  stateUnshiftResolvedScaleParams: Atom<resolvedScaleParams>
  stateDegreeRotation: Atom<number>
  changeTonic: changer
  changeHarmonicIntervalSize: changer
  changeModalShift: changer
  changeDegreeRotation: changer
};

export type domRefs = {
  elResolveErrorContainer: HTMLParagraphElement
  elTonicContainer: HTMLTableCellElement
  elHarmonicContainer: HTMLTableCellElement
  elThemeToggle: HTMLInputElement
  elFretboard: HTMLTableSectionElement
  elFretboardStringTemplate: HTMLTableRowElement
  elFretboardChangeStringNote: HTMLButtonElement
  elFretboardNewStringNoteParamsTemplate: HTMLTemplateElement
  elFretboardNewStringNoteParams: HTMLFormElement
  elDirectionControllers: NodeListOf<HTMLButtonElement>
  elTooltipTriggers: NodeListOf<Element>
  elKeyboardNotes: NodeListOf<HTMLTableCellElement>
  elIntervalContainers: NodeListOf<HTMLTableCellElement>
  elScaleToneContainers: NodeListOf<HTMLTableCellElement>
};

export type uiTheme = 'light' | 'dark';

export type uiStore = {
  theme: Atom<uiTheme>
  toggleTheme: () => void
};

export type appStore = store & uiStore;
