export type naturalNoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type noteName = naturalNoteName | 'C♯' | 'D♭' | 'D♯' | 'E♭' | 'F♯' | 'G♭' | 'G♯' | 'A♭' | 'A♯' | 'B♭';

export type naturalNoteParams = {
  tone: naturalNoteName
  degree: number
  naturalPitchClass: number
};

export type noteParams = {
  note: noteName | ''
  degree: number
  pitchClass: number
}

export type intervalStep = 1 | 2;

export type scaleBuildParams = {
  tonic: noteName
  intervalPattern: intervalStep[]
  degreesForRemove: number[]
  modeShift: number
};

export type scaleNotes = noteParams[];

export type resolvedScaleParams = scaleBuildParams & {
  scale: scaleNotes
  canModeShift: boolean
};
export type resolvedScale = scaleNotes;
export type intervalPattern = resolvedScaleParams['intervalPattern'];

export type resolveScale = (scaleBuildParams: scaleBuildParams) => resolvedScaleParams;

export type buildDiatonicScale = (scaleBuildParams: Pick<scaleBuildParams, 'tonic' | 'intervalPattern'>) => resolvedScale;

export type applyModeShift = (intervalPattern: intervalPattern, modeShift: scaleBuildParams['modeShift']) => intervalPattern;

export type removeDegrees = (scale: resolvedScale, degreesForRemove: scaleBuildParams['degreesForRemove']) => resolvedScale;
