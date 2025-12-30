import { expect, test, describe } from 'vitest';
import * as t from '../src/types'
import { resolveScale } from '../src';

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
      modeShift: 0,
    });
    expect(result.scale.map(({ note }) => note).join(' ')).toEqual(expected);
  });

  const shiftedMinor = minor.map((scale, index) => ({ tonic: <t.noteName>scale[0], expected: major[index].join(' ') }));
  test.each(shiftedMinor)('modeShift $tonic', ({ tonic, expected }) => {
    const result = resolveScale({
      tonic,
      intervalPattern: [2, 1, 2, 2, 1, 2, 2],
      modeShift: 2,
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
      modeShift: 0,
    });
    expect(result.scale.map(({ note }) => note).join(' ')).toEqual(expected);
  });

  const shiftedMajor = major.map((scale, index) => ({ tonic: <t.noteName>scale[0], expected: minor[index].join(' ') }));
  test.each(shiftedMajor)('modeShift $tonic', ({ tonic, expected }) => {
    const result = resolveScale({
      tonic,
      intervalPattern: [2, 2, 1, 2, 2, 2, 1],
      modeShift: 5,
    });
    expect(result.scale.map(({ note }) => note).join(' ')).not.toEqual(expected);
  });
});
