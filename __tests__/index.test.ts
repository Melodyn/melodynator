import { expect, test, describe } from 'vitest';
import * as t from '../src/types'
import { resolveScale } from '../src';

describe('minor', () => {
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
  ].map((scale) => ({ tonic: <t.noteName>scale[0], expected: scale.join(' ') }));

  test.each(minor)('resolveScale $tonic', ({ tonic, expected }) => {
    const result = resolveScale({
      tonic,
      intervalPattern: [2, 1, 2, 2, 1, 2, 2],
      degreesForRemove: [],
      modeShift: 0,
    });
    expect(result.scale.filter(({ note }) => note.length !== 0).map(({ note }) => note).join(' ')).toEqual(expected);
  });

  test.each(minor)('modeShift $tonic', ({ tonic, expected }) => {
    const result = resolveScale({
      tonic,
      intervalPattern: [2, 1, 2, 2, 1, 2, 2],
      degreesForRemove: [],
      modeShift: 1,
    });
    expect(result.scale.filter(({ note }) => note.length !== 0).map(({ note }) => note).join(' ')).not.toEqual(expected);
  });

  test.each(minor)('degreesForRemove $tonic', ({ tonic, expected }) => {
    const result = resolveScale({
      tonic,
      intervalPattern: [2, 1, 2, 2, 1, 2, 2],
      degreesForRemove: [4],
      modeShift: 0,
    });
    expect(result.scale.filter(({ note }) => note.length !== 0).map(({ note }) => note).join(' ')).not.toEqual(expected);
  });
});

describe('major', () => {
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
  ].map((scale) => ({ tonic: <t.noteName>scale[0], expected: scale.join(' ') }));

  test.each(major)('resolveScale $tonic', ({ tonic, expected }) => {
    const result = resolveScale({
      tonic,
      intervalPattern: [2, 2, 1, 2, 2, 2, 1],
      degreesForRemove: [],
      modeShift: 0,
    });
    expect(result.scale.filter(({ note }) => note.length !== 0).map(({ note }) => note).join(' ')).toEqual(expected);
  });

  test.each(major)('modeShift $tonic', ({ tonic, expected }) => {
    const result = resolveScale({
      tonic,
      intervalPattern: [2, 2, 1, 2, 2, 2, 1],
      degreesForRemove: [],
      modeShift: 1,
    });
    expect(result.scale.filter(({ note }) => note.length !== 0).map(({ note }) => note).join(' ')).not.toEqual(expected);
  });

  test.each(major)('degreesForRemove $tonic', ({ tonic, expected }) => {
    const result = resolveScale({
      tonic,
      intervalPattern: [2, 2, 1, 2, 2, 2, 1],
      degreesForRemove: [4],
      modeShift: 0,
    });
    expect(result.scale.filter(({ note }) => note.length !== 0).map(({ note }) => note).join(' ')).not.toEqual(expected);
  });
});
