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

export const applyModalShift: t.applyModalShift = (intervalPattern, modalShift) => cu.rotate(intervalPattern, modalShift);

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

export const resolveScale: t.resolveScale = ({ tonic, intervalPattern, modalShift }) => {
  const canModalShift = checkCanModeShift(intervalPattern);
  const shiftedIntervalPattern = (canModalShift && modalShift > 0)
    ? applyModalShift(intervalPattern, modalShift)
    : intervalPattern;
  const scale = buildDiatonicScale({ tonic, intervalPattern: shiftedIntervalPattern });

  const resolvedScaleParams: t.resolvedScaleParams = {
    scale,
    intervalPattern: shiftedIntervalPattern,
    canModalShift,
    canHarmonicTransform: true,
    harmonicTargets: [tonic],
  };

  return resolvedScaleParams;
};

export const applyDegreeRotation: t.applyDegreeRotation = (resolvedScaleParams, degreeRotation) => {
  if (!resolvedScaleParams.canModalShift || degreeRotation === 0) return resolvedScaleParams;

  const newCenterNote: t.noteName = resolvedScaleParams.scale[degreeRotation].note;
  return resolveScale({
    tonic: newCenterNote,
    intervalPattern: resolvedScaleParams.intervalPattern,
    modalShift: degreeRotation,
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
    modalShift: 0,
  });

  // нота содержится в текущей гамме?
  if (targetTonicInHomeScale) {
    const targetResolvedScaleParams = resolveScaleByTonic(targetTonicInHomeScale.note);

    const homeCenterInTargetScale = targetResolvedScaleParams.scale.find(n => n.note === homeCenterNoteParams.note);
    if (homeCenterInTargetScale) {
      const resolvedScale = applyDegreeRotation(targetResolvedScaleParams, homeCenterInTargetScale.degree - 1);
      return {
        ...resolvedScale,
        harmonicTargets: [targetTonicInHomeScale.note],
      };
    }

    return {
      ...targetResolvedScaleParams,
      canHarmonicTransform: false,
      harmonicTargets: [targetTonicInHomeScale.note],
    };
  }
  // если нет, ищем в нотах с именами повышенной (C#) и пониженной (Db) альтерации

  const chromaticUpperTonicParams = cu.find(resolvedScaleParams.scale, (n) => n.pitchClass === (targetTonicPC + 1) % c.OCTAVE_SIZE);
  const chromaticUpperTonicName = alterAccidentalBySemitone(chromaticUpperTonicParams.note, 'down');
  const chromaticUpperScaleParams = resolveScaleByTonic(chromaticUpperTonicName);

  const chromaticLowerTonicParams = cu.find(resolvedScaleParams.scale, (n) => n.pitchClass === (targetTonicPC + c.OCTAVE_SIZE - 1) % c.OCTAVE_SIZE);
  const chromaticLowerTonicName = alterAccidentalBySemitone(chromaticLowerTonicParams.note, 'up');

  const homeCenterInUpperTargetScale = chromaticUpperScaleParams.scale.find(n => n.note === homeCenterNoteParams.note);
  if (homeCenterInUpperTargetScale) {
    const resolvedScale = applyDegreeRotation(chromaticUpperScaleParams, homeCenterInUpperTargetScale.degree - 1);
    return {
      ...resolvedScale,
      harmonicTargets: [chromaticLowerTonicName, chromaticUpperTonicName],
    };
  }

  const chromaticLowerScaleParams = resolveScaleByTonic(chromaticLowerTonicName);

  const homeCenterInLowerTargetScale = chromaticLowerScaleParams.scale.find(n => n.note === homeCenterNoteParams.note);
  if (homeCenterInLowerTargetScale) {
    const resolvedScale = applyDegreeRotation(chromaticLowerScaleParams, homeCenterInLowerTargetScale.degree - 1);
    return {
      ...resolvedScale,
      harmonicTargets: [chromaticLowerTonicName, chromaticUpperTonicName],
    };
  }

  return {
    ...chromaticLowerScaleParams,
    canHarmonicTransform: false,
    harmonicTargets: [chromaticLowerTonicName, chromaticUpperTonicName],
  };
};

export const scaleToMap: t.scaleToMap = (scale) => scale
  .reduce((m, n) => {
    const { pitchClass } = n;
    if (!m.has(pitchClass)) {
      m.set(pitchClass, n);
    }
    return m;
  }, new Map());

export const mapScaleToLayout: t.mapScaleToLayout = ({ startNotes, scaleMap }) => startNotes.map(({ note, octave }) => {
  const scaleLayout: t.scaleLayout = [];
  const startNoteNaturalParams = getNaturalNoteParams(note);
  const startNoteOffsetPC = calcOffsetPC(note);
  const startNotePC = startNoteNaturalParams.naturalPitchClass + startNoteOffsetPC + c.OCTAVE_SIZE;
  let currentOctave = octave;

  for (let semitoneIndex = 0; semitoneIndex <= c.OCTAVE_SIZE; semitoneIndex += 1) {
    const currentPC = (startNotePC + semitoneIndex) % c.OCTAVE_SIZE;
    const scaleNoteParams = scaleMap.get(currentPC);
    const currentNote = scaleNoteParams === undefined ? '' : scaleNoteParams.note;
    currentOctave = currentOctave + Number(semitoneIndex > 0 && currentPC === 0);

    scaleLayout.push({ note: currentNote, octave: currentOctave });
  }

  return scaleLayout;
});
