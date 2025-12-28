import * as t from './types';
import * as c from './constants';
import * as cu from './commonUtils';

const getNaturalNoteParams = (noteName: t.noteName): t.naturalNoteParams => cu.
  find(c.naturalNotesParams, ({ tone }) => tone === noteName[0]);

const applyModeShift: t.applyModeShift = (intervalPattern, modeShift) => intervalPattern
  .map((_, i) => intervalPattern[(modeShift + i) % intervalPattern.length]);

const removeDegrees: t.removeDegrees = (scale, degrees) => scale.map(({ note, degree, pitchClass }) => ({
  note: degrees.includes(degree) ? '' : note,
  pitchClass,
  degree,
}));

const checkCanModeShift = (intervalPattern: t.intervalPattern): boolean => cu.sum(intervalPattern) === c.OCTAVE_SIZE;

const calcOffsetPC = (note: t.noteName): -1 | 0 | 1 => {
  if (note.length === 1) {
    return 0;
  }
  return note[1] === c.SHARP_SYMBOL ? 1 : -1;
};

// строим по логике диатоники, даже если не диатоника
const buildDiatonicScale: t.buildDiatonicScale = (scaleBuildParams) => {
  const tonic = scaleBuildParams.tonic;
  const tonicParams = getNaturalNoteParams(tonic);
  const tonicOffsetPC = calcOffsetPC(tonic);
  let currentPC: number = (tonicParams.naturalPitchClass + tonicOffsetPC) % c.OCTAVE_SIZE;
  let currentNaturalNoteIndex = tonicParams.degree - 1;
  let currentDegree = tonicParams.degree;

  const scale: t.noteParams[] = [{ note: tonic, pitchClass: currentPC, degree: currentDegree }];

  for (const interval of scaleBuildParams.intervalPattern) {
    if (interval === 2) {
      scale.push({ note: '', pitchClass: (currentPC + 1) % c.OCTAVE_SIZE, degree: currentDegree });
    }
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
      accidental = (pitchClassOffset > 0 ? c.SHARP_SYMBOL : c.FLAT_SYMBOL)
        .repeat(Math.abs(pitchClassOffset));
    }

    scale.push({
      note: <t.noteName>`${targetNaturalNoteParams.tone}${accidental}`,
      pitchClass: targetPC,
      degree: targetNaturalNoteParams.degree,
    });

    currentPC = targetPC;
    currentNaturalNoteIndex = targetNaturalNoteIndex;
    currentDegree = targetNaturalNoteParams.degree;
  }

  return scale;
};

export const resolveScale: t.resolveScale = ({
  tonic,
  intervalPattern,
  degreesForRemove = [],
  modeShift = 0,
}) => {
  const canModeShift = checkCanModeShift(intervalPattern);
  const shiftedIntervalPattern = (canModeShift && modeShift > 0)
    ? applyModeShift(intervalPattern, modeShift)
    : intervalPattern;

  const scale = buildDiatonicScale({ tonic, intervalPattern: shiftedIntervalPattern });
  const scaleWithoutDegrees = (degreesForRemove.length === 0)
    ? scale
    : removeDegrees(scale, degreesForRemove);

  const resolvedScaleParams: t.resolvedScaleParams = {
    tonic,
    degreesForRemove,
    intervalPattern: shiftedIntervalPattern,
    canModeShift,
    modeShift,
    scale: scaleWithoutDegrees,
  };

  return resolvedScaleParams;
};

// --
type calcNotesDistanceParams = { startNote: t.noteName, targetNote: t.noteName }
type calcNotesDistance = (calcNotesDistanceParams: calcNotesDistanceParams) => number;
const calcNotesDistance: calcNotesDistance = ({ startNote, targetNote }) => {
  const startNoteNaturalParams = getNaturalNoteParams(startNote);
  const startNoteOffsetPC = calcOffsetPC(startNote);
  const startNotePC = (startNoteNaturalParams.naturalPitchClass + startNoteOffsetPC) % c.OCTAVE_SIZE;

  const targetNoteNaturalParams = getNaturalNoteParams(targetNote);
  const targetNoteOffsetPC = calcOffsetPC(targetNote);
  const targetNotePC = (targetNoteNaturalParams.naturalPitchClass + targetNoteOffsetPC) % c.OCTAVE_SIZE;

  return targetNotePC - startNotePC;
};

// --
type findNearestNoteInScaleParams = {
  note: t.noteName,
  scale: t.resolvedScaleParams['scale'],
};
type findNearestNoteInScale = (findNearestNoteInScaleParams: findNearestNoteInScaleParams) => t.noteParams;

const findNearestNoteInScale: findNearestNoteInScale = ({ note, scale }) => {
  const startNoteNaturalParams = getNaturalNoteParams(note);
  const startNoteOffsetPC = calcOffsetPC(note);
  const startNotePC = startNoteNaturalParams.naturalPitchClass + startNoteOffsetPC;
  const sortedScale = scale.slice(0, scale.length - 1).sort((a, b) => a.pitchClass > b.pitchClass ? 1 : -1);
  return cu.find(sortedScale, (note) => note.pitchClass > startNotePC);
};

console.log(findNearestNoteInScale({
  note: 'E',
  scale: resolveScale({
    tonic: 'A',
    intervalPattern: [2, 1, 2, 2, 1, 2, 2],
    degreesForRemove: [],
    modeShift: 0,
  }).scale
}));
