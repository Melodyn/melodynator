import * as t from '../types';

// количество полутонов в октаве (pitch class modulo)
export const OCTAVE_SIZE: 12 = 12;
// максимальное смещение pitch class при нормализации (-6 … +6, как в кварто-квинтовом круге)
export const MAX_PITCH_CLASS_OFFSET: 6 = 6;
export const FLAT_SYMBOL: t.flatSymbol = '♭';
export const SHARP_SYMBOL: t.sharpSymbol = '♯';

export const naturalNotesParams: t.naturalNoteParams[] = [
  { note: 'C', degree: 1, naturalPitchClass: 0 },
  { note: 'D', degree: 2, naturalPitchClass: 2 },
  { note: 'E', degree: 3, naturalPitchClass: 4 },
  { note: 'F', degree: 4, naturalPitchClass: 5 },
  { note: 'G', degree: 5, naturalPitchClass: 7 },
  { note: 'A', degree: 6, naturalPitchClass: 9 },
  { note: 'B', degree: 7, naturalPitchClass: 11 },
];

const octavesParams: t.octaveParams[] = [
  { sinceNumber: 0, color: '#dd7e6b', nameHelmholtz: 'N2', }, // субконтр_
  { sinceNumber: 1, color: '#ea9999', nameHelmholtz: 'N1', }, // контр_
  { sinceNumber: 2, color: '#f9cb9c', nameHelmholtz: 'N', }, // большая
  { sinceNumber: 3, color: '#ffe599', nameHelmholtz: 'n', }, // малая
  { sinceNumber: 4, color: '#cfd89a', nameHelmholtz: 'n1', }, // первая
  { sinceNumber: 5, color: '#9ad6d4', nameHelmholtz: 'n2', }, // вторая
  { sinceNumber: 6, color: '#a4c2f4', nameHelmholtz: 'n3', }, // третья
  { sinceNumber: 7, color: '#a19fe8', nameHelmholtz: 'n4', }, // четвертая
  { sinceNumber: 8, color: '#b4a7d6', nameHelmholtz: 'n5', }, // пятая
];
