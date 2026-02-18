import * as t from '../types';

// количество полутонов в октаве (pitch class modulo)
export const OCTAVE_SIZE = <const>12;
// максимальное смещение pitch class при нормализации (-6 … +6, как в кварто-квинтовом круге)
export const MAX_PITCH_CLASS_OFFSET = <const>6;
export const FLAT_SYMBOL: t.flatSymbol = '♭';
export const SHARP_SYMBOL: t.sharpSymbol = '♯';
export const EMPTY_VALUE = '\u00A0';

export const naturalNotesParams: t.naturalNoteParams[] = [
  { note: 'C', degree: 1, naturalPitchClass: 0 },
  { note: 'D', degree: 2, naturalPitchClass: 2 },
  { note: 'E', degree: 3, naturalPitchClass: 4 },
  { note: 'F', degree: 4, naturalPitchClass: 5 },
  { note: 'G', degree: 5, naturalPitchClass: 7 },
  { note: 'A', degree: 6, naturalPitchClass: 9 },
  { note: 'B', degree: 7, naturalPitchClass: 11 },
];

export const allNotesNames: t.noteName[] = naturalNotesParams.flatMap<t.noteName>(({ note }) => [`${note}${FLAT_SYMBOL}`, note, `${note}${SHARP_SYMBOL}`]);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const octavesParams: t.octaveParams[] = [
  { sinceNumber: 0, nameHelmholtz: 'N2' }, // субконтр_
  { sinceNumber: 1, nameHelmholtz: 'N1' }, // контр_
  { sinceNumber: 2, nameHelmholtz: 'N' }, // большая
  { sinceNumber: 3, nameHelmholtz: 'n' }, // малая
  { sinceNumber: 4, nameHelmholtz: 'n1' }, // первая
  { sinceNumber: 5, nameHelmholtz: 'n2' }, // вторая
  { sinceNumber: 6, nameHelmholtz: 'n3' }, // третья
  { sinceNumber: 7, nameHelmholtz: 'n4' }, // четвертая
  { sinceNumber: 8, nameHelmholtz: 'n5' }, // пятая
];

