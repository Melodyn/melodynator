import * as t from './types';
import * as c from './constants';
import * as u from './constants/musicUtils';

const getNaturalNoteParams = (noteName: t.noteName): t.naturalNoteParams => {
  const naturalNoteParams = c.naturalNotesParams.find(({ tone }) => tone === noteName[0]);
  if (naturalNoteParams == null) throw new Error(`Не найдена натуральная нота для ${noteName}`);
  return naturalNoteParams;
};

// строим по логике диатоники, даже если не диатоника
const buildDiatonicScale: t.buildDiatonicScale = (scaleBuildParams) => {
  const tonic = scaleBuildParams.tonic;
  const tonicParams = getNaturalNoteParams(tonic);
  const tonicHasAccidental = tonic.length > 1;
  let tonicAccidentalOffset: number = 0; // смещение тоники в полутонах за счёт знака альтерации
  if (tonicHasAccidental) {
    tonicAccidentalOffset = tonic[1] === c.SHARP_SYMBOL ? 1 : -1;
  }
  let currentPC: number = tonicParams.naturalPitchClass + tonicAccidentalOffset;
  let currentNaturalNoteIndex = tonicParams.octaveOrder - 1;

  const scale: t.noteName[] = [tonic];

  for (const interval of scaleBuildParams.intervalPattern) {
    const targetPC = (currentPC + interval) % c.OCTAVE_SIZE;
    const targetNaturalNoteIndex = (currentNaturalNoteIndex + 1) % c.naturalNotesParams.length;
    const targetNaturalNoteParams = c.naturalNotesParams[targetNaturalNoteIndex];
    const targetNPC = targetNaturalNoteParams.naturalPitchClass;

    // смещение натуральной ноты до целевого pitch class
    const diff = targetPC - targetNPC;
    let pitchClassOffset = diff;
    if (diff > c.MAX_PITCH_CLASS_OFFSET) {
      pitchClassOffset = diff - c.OCTAVE_SIZE;
    }
    if (diff < -c.MAX_PITCH_CLASS_OFFSET) {
      pitchClassOffset = diff + c.OCTAVE_SIZE;
    }
    let accidental = '';
    if (pitchClassOffset !== 0) {
      accidental = (pitchClassOffset > 0 ? c.SHARP_SYMBOL : c.FLAT_SYMBOL).repeat(Math.abs(pitchClassOffset));
    }

    scale.push(<t.noteName>`${targetNaturalNoteParams.tone}${accidental}`);

    currentPC = targetPC;
    currentNaturalNoteIndex = targetNaturalNoteIndex;
  }

  return scale;
};

const applyModeShift: t.applyModeShift = (intervalPattern, modeShift) => intervalPattern
  .map((_, i) => intervalPattern[(modeShift + i) % intervalPattern.length]);

const removeDegrees: t.removeDegrees = (scale, degrees) => scale.filter((e, i) => !degrees.includes(i + 1));

export const resolveScale: t.resolveScale = (scaleBuildParams) => {
  const { tonic, modeShift, intervalPattern, removeDegrees: removingDegrees } = scaleBuildParams;

  const canModeShift = u.checkCanModeShift(intervalPattern);
  const shiftedIntervalPattern = (canModeShift && modeShift > 0)
    ? applyModeShift(intervalPattern, modeShift)
    : intervalPattern;

  const scale = buildDiatonicScale({ tonic, intervalPattern: shiftedIntervalPattern });
  const scaleWithoutDegrees = (removingDegrees.length === 0)
    ? scale
    : removeDegrees(scale, removingDegrees);

  const resolvedScaleParams: t.resolvedScaleParams = {
    tonic,
    removeDegrees: scaleBuildParams.removeDegrees,
    intervalPattern: shiftedIntervalPattern,
    canModeShift,
    modeShift,
    scale: scaleWithoutDegrees,
  };

  return resolvedScaleParams;
};
