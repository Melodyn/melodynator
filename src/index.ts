import * as t from './types';
import * as c from './constants';
import * as cu from './commonUtils';

const getNaturalNoteParams = (noteName: t.noteName): t.naturalNoteParams => cu.
  find(c.naturalNotesParams, ({ note }) => note === noteName[0]);

const applyModeShift: t.applyModeShift = (intervalPattern, modeShift) => intervalPattern
  .map((_, i) => intervalPattern[(modeShift + i) % intervalPattern.length]);

const checkCanModeShift = (intervalPattern: t.intervalPattern): boolean => cu.sum(intervalPattern) === c.OCTAVE_SIZE;

const calcOffsetPC = (note: t.noteName): -1 | 0 | 1 => {
  if (note.length === 1) {
    return 0;
  }
  return note[1] === c.SHARP_SYMBOL ? 1 : -1;
};

// строим по логике диатоники, даже если не диатоника
const buildDiatonicScale: t.buildDiatonicScale = ({ tonic, intervalPattern }) => {
  const tonicParams = getNaturalNoteParams(tonic);
  const tonicOffsetPC = calcOffsetPC(tonic);
  let currentPC: number = (tonicParams.naturalPitchClass + tonicOffsetPC) % c.OCTAVE_SIZE;
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
  const startNotePC = startNoteNaturalParams.naturalPitchClass + startNoteOffsetPC;
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

// // использование

// const { scale } = resolveScale({
//   tonic: 'C',
//   intervalPattern: [2, 2, 1, 2, 2, 2, 1],
//   modeShift: 1,
// });

// const scaleMap = scaleToMap(scale);
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
