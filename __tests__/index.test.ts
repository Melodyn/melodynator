import { expect, test, describe } from 'vitest';
import * as t from '../src/types';
import { resolveScale, scaleToMap, mapScaleToLayout } from '../src';

const major = [
  ['G♭', 'A♭', 'B♭', 'C♭', 'D♭', 'E♭', 'F', 'G♭'],
  ['D♭', 'E♭', 'F', 'G♭', 'A♭', 'B♭', 'C', 'D♭'],
  ['A♭', 'B♭', 'C', 'D♭', 'E♭', 'F', 'G', 'A♭'],
  ['E♭', 'F', 'G', 'A♭', 'B♭', 'C', 'D', 'E♭'],
  ['B♭', 'C', 'D', 'E♭', 'F', 'G', 'A', 'B♭'],
  ['F', 'G', 'A', 'B♭', 'C', 'D', 'E', 'F'],
  ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'],
  ['G', 'A', 'B', 'C', 'D', 'E', 'F♯', 'G'],
  ['D', 'E', 'F♯', 'G', 'A', 'B', 'C♯', 'D'],
  ['A', 'B', 'C♯', 'D', 'E', 'F♯', 'G♯', 'A'],
  ['E', 'F♯', 'G♯', 'A', 'B', 'C♯', 'D♯', 'E'],
  ['B', 'C♯', 'D♯', 'E', 'F♯', 'G♯', 'A♯', 'B'],
  ['F♯', 'G♯', 'A♯', 'B', 'C♯', 'D♯', 'E♯', 'F♯'],
];

const minor = [
  ['E♭', 'F', 'G♭', 'A♭', 'B♭', 'C♭', 'D♭', 'E♭'],
  ['B♭', 'C', 'D♭', 'E♭', 'F', 'G♭', 'A♭', 'B♭'],
  ['F', 'G', 'A♭', 'B♭', 'C', 'D♭', 'E♭', 'F'],
  ['C', 'D', 'E♭', 'F', 'G', 'A♭', 'B♭', 'C'],
  ['G', 'A', 'B♭', 'C', 'D', 'E♭', 'F', 'G'],
  ['D', 'E', 'F', 'G', 'A', 'B♭', 'C', 'D'],
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'A'],
  ['E', 'F♯', 'G', 'A', 'B', 'C', 'D', 'E'],
  ['B', 'C♯', 'D', 'E', 'F♯', 'G', 'A', 'B'],
  ['F♯', 'G♯', 'A', 'B', 'C♯', 'D', 'E', 'F♯'],
  ['C♯', 'D♯', 'E', 'F♯', 'G♯', 'A', 'B', 'C♯'],
  ['G♯', 'A♯', 'B', 'C♯', 'D♯', 'E', 'F♯', 'G♯'],
  ['D♯', 'E♯', 'F♯', 'G♯', 'A♯', 'B', 'C♯', 'D♯'],
];

describe('minor', () => {
  const expectedMinor = minor.map((scale) => ({ tonic: <t.noteName>scale[0], expected: scale.join(' ') }));
  test.each(expectedMinor)('resolveScale $tonic', ({ tonic, expected }) => {
    const result = resolveScale({
      tonic,
      intervalPattern: [2, 1, 2, 2, 1, 2, 2],
      modalShift: 0,
    });
    expect(result.scale.map(({ note }) => note).join(' ')).toEqual(expected);
  });

  const shiftedMinor = minor.map((scale, index) => ({ tonic: <t.noteName>scale[0], expected: major[index].join(' ') }));
  test.each(shiftedMinor)('modalShift $tonic', ({ tonic, expected }) => {
    const result = resolveScale({
      tonic,
      intervalPattern: [2, 1, 2, 2, 1, 2, 2],
      modalShift: 2,
    });
    expect(result.scale.map(({ note }) => note).join(' ')).not.toEqual(expected);
  });
});

describe('major', () => {
  const expectedMajor = major.map((scale) => ({ tonic: <t.noteName>scale[0], expected: scale.join(' ') }));
  test.each(expectedMajor)('resolveScale $tonic', ({ tonic, expected }) => {
    const result = resolveScale({
      tonic,
      intervalPattern: [2, 2, 1, 2, 2, 2, 1],
      modalShift: 0,
    });
    expect(result.scale.map(({ note }) => note).join(' ')).toEqual(expected);
  });

  const shiftedMajor = major.map((scale, index) => ({ tonic: <t.noteName>scale[0], expected: minor[index].join(' ') }));
  test.each(shiftedMajor)('modalShift $tonic', ({ tonic, expected }) => {
    const result = resolveScale({
      tonic,
      intervalPattern: [2, 2, 1, 2, 2, 2, 1],
      modalShift: 5,
    });
    expect(result.scale.map(({ note }) => note).join(' ')).not.toEqual(expected);
  });
});

describe('scaleToMap', () => {
  test('converts scale to map with unique pitch classes', () => {
    const scale: t.noteParams[] = [
      { note: 'C', degree: 1, pitchClass: 0 },
      { note: 'D', degree: 2, pitchClass: 2 },
      { note: 'E', degree: 3, pitchClass: 4 },
    ];
    const result = scaleToMap(scale);

    expect(result.size).toBe(3);
    expect(result.get(0)).toEqual({ note: 'C', degree: 1, pitchClass: 0 });
    expect(result.get(2)).toEqual({ note: 'D', degree: 2, pitchClass: 2 });
    expect(result.get(4)).toEqual({ note: 'E', degree: 3, pitchClass: 4 });
  });

  test('uses first note when pitch classes duplicate', () => {
    const scale: t.noteParams[] = [
      { note: 'C', degree: 1, pitchClass: 0 },
      { note: 'B♯', degree: 2, pitchClass: 0 },
    ];
    const result = scaleToMap(scale);

    expect(result.size).toBe(1);
    expect(result.get(0)).toEqual({ note: 'C', degree: 1, pitchClass: 0 });
  });
});

describe('mapScaleToLayout', () => {
  test('creates layout with empty strings for notes not in scale', () => {
    const { scale } = resolveScale({
      tonic: 'C',
      intervalPattern: [2, 2, 1, 2, 2, 2, 1],
      modalShift: 0,
    });
    const scaleMap = scaleToMap(scale);
    const result = mapScaleToLayout({
      name: 'test',
      startNotes: [{ note: <t.noteName>'C', octave: 4 }],
      scaleMap,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(13);
    // C мажор: C D E F G A B C, между E(4) и F(5) нет ноты
    expect(result[0][0]).toEqual({ note: 'C', octave: 4 });
    expect(result[0][1]).toEqual({ note: '', octave: 4 }); // C# не входит в гамму
    expect(result[0][2]).toEqual({ note: 'D', octave: 4 });
    expect(result[0][4]).toEqual({ note: 'E', octave: 4 });
    expect(result[0][5]).toEqual({ note: 'F', octave: 4 });
    expect(result[0][6]).toEqual({ note: '', octave: 4 }); // F# не входит в гамму
  });

  test('returns layout with filtered notes string', () => {
    const { scale } = resolveScale({
      tonic: 'C',
      intervalPattern: [2, 2, 1, 2, 2, 2, 1],
      modalShift: 0,
    });
    const scaleMap = scaleToMap(scale);
    const result = mapScaleToLayout({
      name: 'test',
      startNotes: [{ note: <t.noteName>'C', octave: 4 }],
      scaleMap,
    });

    const notesString = result[0].map(({ note }) => note).filter(n => n.length > 0).join(' ');
    expect(notesString).toBe('C D E F G A B C');
  });
});
