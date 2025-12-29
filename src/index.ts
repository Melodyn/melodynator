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
  let currentDegree = 1;

  const scale: t.noteParams[] = [{ note: tonic, pitchClass: currentPC, degree: currentDegree }];

  for (const interval of scaleBuildParams.intervalPattern) {
    if (interval === 2) {
      scale.push({ note: '', pitchClass: (currentPC + 1) % c.OCTAVE_SIZE, degree: currentDegree });
    }
    const targetPC = (currentPC + interval) % c.OCTAVE_SIZE;
    const targetNaturalNoteIndex = (currentNaturalNoteIndex + 1) % c.naturalNotesParams.length;
    const targetNaturalNoteParams = c.naturalNotesParams[targetNaturalNoteIndex];
    const targetNPC = targetNaturalNoteParams.naturalPitchClass;
    const targetDegree = currentDegree + 1;

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
      degree: targetDegree,
    });

    currentPC = targetPC;
    currentNaturalNoteIndex = targetNaturalNoteIndex;
    currentDegree = targetDegree;
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
type findNoteInScaleParams = {
  note: t.noteName
  scale: t.resolvedScale
};
type findNoteIndexInScale = (findNoteInScaleParams: findNoteInScaleParams) => number;

const findNoteIndexInScale: findNoteIndexInScale = ({ note, scale }) => {
  const noteNaturalParams = getNaturalNoteParams(note);
  const noteOffsetPC = calcOffsetPC(note);
  const notePC = noteNaturalParams.naturalPitchClass + noteOffsetPC;
  return cu.findIndex(scale, (note) => note.pitchClass === notePC);
};

// --

type instrumentNoteParams = {
  note: t.noteName
  octave: number;
};
type instrumentParams = {
  name: string
  type: 'string' | 'piano'
  startNotes: instrumentNoteParams[]
  scale: t.resolvedScale
};
type scaleLayout = instrumentNoteParams[];
type scaleLayouts = scaleLayout[];

type mapScaleToLayout = (instrumentParams: instrumentParams) => scaleLayouts;

const mapScaleToLayout: mapScaleToLayout = ({ startNotes, scale }) => {
  return startNotes.map(({ note, octave }) => {
    const firstNoteIndexInScale = findNoteIndexInScale({ note, scale });
    const scaleLayout: scaleLayout = [];
    let currentOctave = octave;
    for (let step = 0; step <= c.OCTAVE_SIZE; step += 1) {
      const currentNoteIndex = (firstNoteIndexInScale + step) % c.OCTAVE_SIZE;
      const currentNote = scale[currentNoteIndex];
      currentOctave = currentOctave + Number(step > 0 && currentNote.pitchClass === 0);
      scaleLayout.push({ note: <t.noteName>currentNote.note, octave: currentOctave });
    }
    return scaleLayout;
  });
};

const { scale } = resolveScale({
  tonic: 'C',
  intervalPattern: [2, 2, 1, 2, 2, 2, 1],
  degreesForRemove: [2, 4, 6, 7],
  modeShift: 0,
});

// console.log(scale);
// console.log(
//   mapScaleToLayout({
//     scale,
//     startNotes: [
//       { note: 'E', octave: 4 },
//       { note: 'B', octave: 3 },
//       { note: 'G', octave: 3 },
//       { note: 'D', octave: 3 },
//       { note: 'A', octave: 2 },
//       { note: 'E', octave: 2 },
//     ],
//     name: 'guitar',
//     type: 'string',
//   })
//     .map((scaleLayout) => scaleLayout.map(({ note }) => note.length > 0 ? `${note.length === 1 ? `${note} ` : note}` : '  ').join(' | '))
//     .join('\n')
// );
console.log(
  mapScaleToLayout({
    scale,
    startNotes: [
      { note: 'G', octave: 3 },
      { note: 'C', octave: 4 },
      { note: 'E', octave: 4 },
      { note: 'A', octave: 4 },
    ],
    name: 'ukulele',
    type: 'string',
  })
    .map((scaleLayout) => scaleLayout.map(({ note }) => note.length > 0 ? `${note.length === 1 ? `${note} ` : note}` : '  ').join(' | '))
    .join('\n')
);

// // -- наверное не нужно, т.к. можно смотреть pitchClass первой ноты в гамме
// type calcNotesDistanceParams = { startNote: t.noteName, targetNote: t.noteName }
// type calcNotesDistance = (calcNotesDistanceParams: calcNotesDistanceParams) => number;
// const calcNotesDistance: calcNotesDistance = ({ startNote, targetNote }) => {
//   const startNoteNaturalParams = getNaturalNoteParams(startNote);
//   const startNoteOffsetPC = calcOffsetPC(startNote);
//   const startNotePC = (startNoteNaturalParams.naturalPitchClass + startNoteOffsetPC) % c.OCTAVE_SIZE;

//   const targetNoteNaturalParams = getNaturalNoteParams(targetNote);
//   const targetNoteOffsetPC = calcOffsetPC(targetNote);
//   const targetNotePC = (targetNoteNaturalParams.naturalPitchClass + targetNoteOffsetPC) % c.OCTAVE_SIZE;

//   return targetNotePC - startNotePC;
// };
