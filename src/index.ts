import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import * as t from './types';
import * as c from './constants';
import * as cu from './commonUtils';
import { AppError } from './constants/errors';

const getNaturalNoteParams = (noteName: t.noteName): t.naturalNoteParams => cu.
  find(c.naturalNotesParams, ({ note }) => note === noteName[0]);

const applyModeShift: t.applyModeShift = (intervalPattern, modeShift) => cu.rotate(intervalPattern, modeShift);

const checkCanModeShift = (intervalPattern: t.intervalPattern): boolean => cu.sum(intervalPattern) === c.OCTAVE_SIZE;

const calcOffsetPC = (note: t.noteName): -1 | 0 | 1 => {
  if (note.length === 1) {
    return 0;
  }
  return note[1] === c.SHARP_SYMBOL ? 1 : -1;
};

const alterAccidentalBySemitone = (noteName: t.noteName, direction: 'up' | 'down'): t.noteName => {
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

// строим по логике диатоники, даже если не диатоника
const buildDiatonicScale: t.buildDiatonicScale = ({ tonic, intervalPattern }) => {
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

const applyFunctionalShift: t.applyFunctionalShift = (resolvedScaleParams, functionalShift) => {
  if (!resolvedScaleParams.canModeShift || functionalShift === 0) return resolvedScaleParams;

  const newCenterNote: t.noteName = resolvedScaleParams.scale[functionalShift].note;
  return resolveScale({
    tonic: newCenterNote,
    intervalPattern: resolvedScaleParams.intervalPattern,
    modeShift: functionalShift,
  });
};

const applyHarmonicTransform: t.applyHarmonicTransform = (resolvedScaleParams, harmonicIntervalSize) => {
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

// отображение

const scaleToMap: t.scaleToMap = (scale) => scale
  .reduce((m, n) => {
    const { pitchClass } = n;
    if (!m.has(pitchClass)) {
      m.set(pitchClass, n);
    }
    return m;
  }, new Map());


const mapScaleToLayout: t.mapScaleToLayout = ({ startNotes, scaleMap }) => startNotes.map(({ note, octave }) => {
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

// использование

const tonic: t.noteName = 'C';
const scaleBuildParams: t.scaleBuildParams = {
  tonic,
  intervalPattern: [2, 2, 1, 2, 2, 2, 1],
  modeShift: 0,
};
const resolvedScaleParams = resolveScale(scaleBuildParams);
const resolvedFunctionalShiftedScaleParams = applyFunctionalShift(resolvedScaleParams, 0);
const harmonicTransformedScaleParams = applyHarmonicTransform(resolvedFunctionalShiftedScaleParams, 0);
console.log(harmonicTransformedScaleParams);

const scaleMap = scaleToMap(harmonicTransformedScaleParams.scale);
console.log(
  mapScaleToLayout({ scaleMap, startNotes: [{ note: tonic, octave: 4 }], name: '' })
    .map((scaleLayout) => scaleLayout.map(({ note }) => note.length > 0 ? `${note.length === 1 ? ` ${note} ` : ` ${note}`}` : '   ').join(' | '))
    .join('\n')
);

// console.log(
//   mapScaleToLayout({
//     scaleMap,
//     startNotes: [
//       { note: 'E', octave: 4 },
//       { note: 'B', octave: 3 },
//       { note: 'G', octave: 3 },
//       { note: 'D', octave: 3 },
//       { note: 'A', octave: 2 },
//       { note: 'E', octave: 2 },
//     ],
//     name: 'Гитара',
//   })
//     .map((scaleLayout) => scaleLayout.map(({ note }) => note.length > 0 ? `${note.length === 1 ? ` ${note} ` : ` ${note}`}` : '   ').join(' | '))
//     .join('\n')
// );
// console.log('-'.repeat(61));
// console.log(
//   mapScaleToLayout({
//     scaleMap,
//     startNotes: [
//       { note: 'A', octave: 4 },
//       { note: 'E', octave: 4 },
//       { note: 'C', octave: 4 },
//       { note: 'G', octave: 4 },
//     ],
//     name: 'Укулеле',
//   })
//     .map((scaleLayout) => scaleLayout.map(({ note }) => note.length > 0 ? `${note.length === 1 ? ` ${note} ` : ` ${note}`}` : '   ').join(' | '))
//     .join('\n')
// );
