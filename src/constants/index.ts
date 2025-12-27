import * as t from '../types';

// количество полутонов в октаве (pitch class modulo)
export const OCTAVE_SIZE: 12 = 12;
// максимальное смещение pitch class при нормализации (-6 … +6, как в кварто-квинтовом круге)
export const MAX_PITCH_CLASS_OFFSET: 6 = 6;
export const FLAT_SYMBOL: '♭' = '♭';
export const SHARP_SYMBOL: '♯' = '♯';

export const naturalNotesParams: t.naturalNoteParams[] = [
  { tone: 'C', octaveOrder: 1, hasFlat: false, hasSharp: true, naturalPitchClass: 0 },
  { tone: 'D', octaveOrder: 2, hasFlat: true, hasSharp: true, naturalPitchClass: 2 },
  { tone: 'E', octaveOrder: 3, hasFlat: true, hasSharp: false, naturalPitchClass: 4 },
  { tone: 'F', octaveOrder: 4, hasFlat: false, hasSharp: true, naturalPitchClass: 5 },
  { tone: 'G', octaveOrder: 5, hasFlat: true, hasSharp: true, naturalPitchClass: 7 },
  { tone: 'A', octaveOrder: 6, hasFlat: true, hasSharp: true, naturalPitchClass: 9 },
  { tone: 'B', octaveOrder: 7, hasFlat: true, hasSharp: false, naturalPitchClass: 11 },
];
