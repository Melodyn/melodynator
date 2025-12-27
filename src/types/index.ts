export type naturalNoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type noteName = naturalNoteName | 'C♯' | 'D♭' | 'D♯' | 'E♭' | 'F♯' | 'G♭' | 'G♯' | 'A♭' | 'A♯' | 'B♭';

export type naturalNoteParams = {
  tone: naturalNoteName
  hasFlat: boolean
  hasSharp: boolean
  octaveOrder: number
  naturalPitchClass: number
};

export type semitoneStep = 1 | 2;

export type scaleBuildParams = {
  tonic: noteName
  intervalPattern: semitoneStep[]
  removeDegrees: number[]
  modeShift: number
};

export type scaleNotes = noteName[];

export type resolvedScaleParams = scaleBuildParams & {
  scale: scaleNotes
  canModeShift: boolean
};
export type resolvedScale = resolvedScaleParams['scale'];
export type intervalPattern = resolvedScaleParams['intervalPattern'];

export type resolveScale = (scaleBuildParams: scaleBuildParams) => resolvedScaleParams;

export type buildDiatonicScale = (scaleBuildParams: Pick<scaleBuildParams, 'tonic' | 'intervalPattern'>) => resolvedScale;

export type applyModeShift = (semitoneStep: intervalPattern, step: scaleBuildParams['modeShift']) => intervalPattern;

export type removeDegrees = (scale: resolvedScale, degrees: resolvedScaleParams['removeDegrees']) => resolvedScale;
