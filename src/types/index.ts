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
export type functionalShift = number;

export type intervalPattern = intervalSize[];

export type scaleBuildParams = {
  tonic: noteName
  intervalPattern: intervalPattern
  modeShift: number
};

export type scale = noteParams[];
export type scaleMap = Map<noteParams['pitchClass'], noteParams>;
export type scaleToMap = (scale: scale) => scaleMap;

export type resolvedScaleParams = {
  scale: scale
  intervalPattern: intervalPattern
  canModeShift: boolean
};

export type resolveScale = (scaleBuildParams: scaleBuildParams) => resolvedScaleParams;

export type buildDiatonicScale = (scaleBuildParams: Pick<scaleBuildParams, 'tonic' | 'intervalPattern'>) => scale;

export type applyModeShift = (intervalPattern: intervalPattern, modeShift: scaleBuildParams['modeShift']) => intervalPattern;

export type applyFunctionalShift = (resolvedScaleParams: resolvedScaleParams, functionalShift: functionalShift) => resolvedScaleParams;

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

export type changer = (direction: direction) => void;
