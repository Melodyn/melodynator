// import HawkCatcher from '@hawk.so/javascript';

import * as t from './types';
import * as c from './constants';
import * as cu from './commonUtils';
import { AppError } from './constants/errors';

// const hawk = new HawkCatcher({
//   token: 'eyJpbnRlZ3JhdGlvbklkIjoiOTYxYTk2NWMtNDI0Mi00YjE0LWIzZDctYzc3MGRkNzQ2MDYxIiwic2VjcmV0IjoiNDg0ZWY0MTktMjgzNi00NjlhLWEwMDUtNjFjOTAzODUzODI2In0=',
//   context: {
//     env: 'development',
//   },
// });

// hawk.test();

export const getNaturalNoteParams = (noteName: t.noteName): t.naturalNoteParams => cu.
  find(c.naturalNotesParams, ({ note }) => note === noteName[0]);

export const applyModeShift: t.applyModeShift = (intervalPattern, modeShift) => cu.rotate(intervalPattern, modeShift);

export const checkCanModeShift = (intervalPattern: t.intervalPattern): boolean => cu.sum(intervalPattern) === c.OCTAVE_SIZE;

export const calcOffsetPC = (note: t.noteName): -1 | 0 | 1 => {
  if (note.length === 1) {
    return 0;
  }
  return note[1] === c.SHARP_SYMBOL ? 1 : -1;
};

export const alterAccidentalBySemitone = (noteName: t.noteName, direction: 'up' | 'down'): t.noteName => {
  if (noteName.length === 1) {
    const targetAccidental: t.accidental = direction === 'up' ? c.SHARP_SYMBOL : c.FLAT_SYMBOL;
    return <t.noteName>`${noteName}${targetAccidental}`;
  }

  const hasNoteSharpAccidental = noteName[1] === c.SHARP_SYMBOL;
  if (direction === 'up') {
    if (hasNoteSharpAccidental) return <t.noteName>`${noteName}${c.SHARP_SYMBOL}`;
    return <t.noteName>noteName.slice(0, noteName.length - 1);
  }

  if (!hasNoteSharpAccidental) return <t.noteName>`${noteName}${c.FLAT_SYMBOL}`;
  return <t.noteName>noteName.slice(0, noteName.length - 1);
};

export const removeDegrees = (scale: t.scale, degreesForRemove: number[]) => scale.filter(n => !degreesForRemove.includes(n.degree));

// строим по логике диатоники, даже если не диатоника
export const buildDiatonicScale: t.buildDiatonicScale = ({ tonic, intervalPattern }) => {
  const tonicParams = getNaturalNoteParams(tonic);
  const tonicOffsetPC = calcOffsetPC(tonic);
  // + c.OCTAVE_SIZE нужен, чтобы для Cb получился pitchClass 11, а не -1
  let currentPC: number = (tonicParams.naturalPitchClass + tonicOffsetPC + c.OCTAVE_SIZE) % c.OCTAVE_SIZE;
  let currentNaturalNoteIndex = tonicParams.degree - 1;
  let currentDegree = 1;

  const scale: t.noteParams[] = [{ note: tonic, degree: currentDegree, pitchClass: currentPC }];

  for (const interval of intervalPattern) {
    const targetNaturalNoteIndex = (currentNaturalNoteIndex + 1) % c.naturalNotesParams.length;
    const targetNaturalNoteParams = c.naturalNotesParams[targetNaturalNoteIndex];
    const targetDegree = currentDegree + 1;
    const targetNPC = targetNaturalNoteParams.naturalPitchClass;
    const targetPC = (currentPC + interval) % c.OCTAVE_SIZE;

    // смещение натуральной ноты до целевого pitch class
    const diff = targetPC - targetNPC;
    let pitchClassOffset = diff;
    if (diff > c.MAX_PITCH_CLASS_OFFSET) {
      pitchClassOffset = diff - c.OCTAVE_SIZE;
    }
    if (diff < -c.MAX_PITCH_CLASS_OFFSET) {
      pitchClassOffset = diff + c.OCTAVE_SIZE;
    }

    let accidental: t.accidental = '';
    if (pitchClassOffset !== 0) {
      accidental = <t.accidental>(pitchClassOffset > 0 ? c.SHARP_SYMBOL : c.FLAT_SYMBOL)
        .repeat(Math.abs(pitchClassOffset));
    }

    scale.push({
      note: `${targetNaturalNoteParams.note}${accidental}`,
      degree: targetDegree,
      pitchClass: targetPC,
    });

    currentPC = targetPC;
    currentNaturalNoteIndex = targetNaturalNoteIndex;
    currentDegree = targetDegree;
  }

  return scale;
};

export const resolveScale: t.resolveScale = ({ tonic, intervalPattern, modeShift }) => {
  const canModeShift = checkCanModeShift(intervalPattern);
  const shiftedIntervalPattern = (canModeShift && modeShift > 0)
    ? applyModeShift(intervalPattern, modeShift)
    : intervalPattern;
  const scale = buildDiatonicScale({ tonic, intervalPattern: shiftedIntervalPattern });

  const resolvedScaleParams: t.resolvedScaleParams = {
    scale,
    intervalPattern: shiftedIntervalPattern,
    canModeShift,
  };

  return resolvedScaleParams;
};

export const applyFunctionalShift: t.applyFunctionalShift = (resolvedScaleParams, functionalShift) => {
  if (!resolvedScaleParams.canModeShift || functionalShift === 0) return resolvedScaleParams;

  const newCenterNote: t.noteName = resolvedScaleParams.scale[functionalShift].note;
  return resolveScale({
    tonic: newCenterNote,
    intervalPattern: resolvedScaleParams.intervalPattern,
    modeShift: functionalShift,
  });
};

export const applyHarmonicTransform: t.applyHarmonicTransform = (resolvedScaleParams, harmonicIntervalSize) => {
  if (harmonicIntervalSize === 0) return resolvedScaleParams;

  const homeCenterNoteParams: t.noteParams = resolvedScaleParams.scale[0];
  const targetTonicPC = (homeCenterNoteParams.pitchClass + harmonicIntervalSize) % c.OCTAVE_SIZE;
  const targetTonicInHomeScale = resolvedScaleParams.scale.find((n) => n.pitchClass === targetTonicPC);

  const resolveScaleByTonic = (tonic: t.noteName) => resolveScale({
    tonic,
    intervalPattern: resolvedScaleParams.intervalPattern,
    modeShift: 0,
  });

  // нота содержится в текущей гамме?
  if (targetTonicInHomeScale) {
    const targetResolvedScaleParams = resolveScaleByTonic(targetTonicInHomeScale.note);

    const homeCenterInTargetScale = targetResolvedScaleParams.scale.find(n => n.note === homeCenterNoteParams.note);
    if (homeCenterInTargetScale) {
      return applyFunctionalShift(targetResolvedScaleParams, homeCenterInTargetScale.degree - 1);
    }

    throw new AppError(`${homeCenterNoteParams.note} не входит в гамму ${targetTonicInHomeScale.note}`);
  }
  // если нет, ищем в нотах с именами повышенной (C#) и пониженной (Db) альтерации

  const chromaticUpperTonicParams = cu.find(resolvedScaleParams.scale, (n) => n.pitchClass === targetTonicPC + 1);
  const chromaticUpperTonicName = alterAccidentalBySemitone(chromaticUpperTonicParams.note, 'down');
  const chromaticUpperScaleParams = resolveScaleByTonic(chromaticUpperTonicName);

  const homeCenterInUpperTargetScale = chromaticUpperScaleParams.scale.find(n => n.note === homeCenterNoteParams.note);
  if (homeCenterInUpperTargetScale) {
    return applyFunctionalShift(chromaticUpperScaleParams, homeCenterInUpperTargetScale.degree - 1);
  }

  const chromaticLowerTonicParams = cu.find(resolvedScaleParams.scale, (n) => n.pitchClass === targetTonicPC - 1);
  const chromaticLowerTonicName = alterAccidentalBySemitone(chromaticLowerTonicParams.note, 'up');
  const chromaticLowerScaleParams = resolveScaleByTonic(chromaticLowerTonicName);

  const homeCenterInLowerTargetScale = chromaticLowerScaleParams.scale.find(n => n.note === homeCenterNoteParams.note);
  if (homeCenterInLowerTargetScale) {
    return applyFunctionalShift(chromaticLowerScaleParams, homeCenterInLowerTargetScale.degree - 1);
  }

  throw new AppError(`${homeCenterNoteParams.note} не входит в гаммы ${chromaticLowerTonicName}/${chromaticUpperTonicName}`);
};
