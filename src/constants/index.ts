import * as t from '../types';

// количество полутонов в октаве (pitch class modulo)
export const OCTAVE_SIZE: 12 = 12;
// максимальное смещение pitch class при нормализации (-6 … +6, как в кварто-квинтовом круге)
export const MAX_PITCH_CLASS_OFFSET: 6 = 6;
export const FLAT_SYMBOL: '♭' = '♭';
export const SHARP_SYMBOL: '♯' = '♯';

export const naturalNotesParams: t.naturalNoteParams[] = [
  { tone: 'C', degree: 1, naturalPitchClass: 0 },
  { tone: 'D', degree: 2, naturalPitchClass: 2 },
  { tone: 'E', degree: 3, naturalPitchClass: 4 },
  { tone: 'F', degree: 4, naturalPitchClass: 5 },
  { tone: 'G', degree: 5, naturalPitchClass: 7 },
  { tone: 'A', degree: 6, naturalPitchClass: 9 },
  { tone: 'B', degree: 7, naturalPitchClass: 11 },
];
