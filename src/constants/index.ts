import * as t from '../types';

// количество полутонов в октаве (pitch class modulo)
export const OCTAVE_SIZE = <const>12;
// максимальное смещение pitch class при нормализации (-6 … +6, как в кварто-квинтовом круге)
export const MAX_PITCH_CLASS_OFFSET = <const>6;
export const FLAT_SYMBOL: t.flatSymbol = '♭';
export const SHARP_SYMBOL: t.sharpSymbol = '♯';
export const EMPTY_VALUE = '\u00A0';

export const DEFAULT_SAVED_VALUES: t.savedValues = { theme: 'light', locale: 'ru' };
export const VALID_THEMES: t.uiTheme[] = ['light', 'dark'];
export const VALID_LOCALES: t.locale[] = ['ru', 'en'];

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
