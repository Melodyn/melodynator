import * as t from '../types';

// количество полутонов в октаве (pitch class modulo)
export const OCTAVE_SIZE = <const>12;
// максимальное смещение pitch class при нормализации (-6 … +6, как в кварто-квинтовом круге)
export const MAX_PITCH_CLASS_OFFSET = <const>6;
export const FLAT_SYMBOL: t.flatSymbol = '♭';
export const SHARP_SYMBOL: t.sharpSymbol = '♯';
export const EMPTY_VALUE = '\u00A0';

export const MIN_FRETBOARD_STRINGS = 4;
export const MAX_FRETBOARD_STRINGS = 12;
export const FRETBOARD_STRING_INTERVAL = 5; // кварта вниз = 5 полутонов
export const NO_ACTIVE_PRESET_ID = 0;

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

export const NATURAL_PITCH_CLASSES = <Record<t.naturalNoteName, number>>Object.fromEntries(
  naturalNotesParams.map(({ note, naturalPitchClass }) => [note, naturalPitchClass]),
);

export const allIntervalSizes: t.intervalSize[] = <t.intervalSize[]>Array.from({ length: OCTAVE_SIZE + 1 }, (_, i) => i);

// Простейшее имя ноты по pitchClass (смешанная классическая конвенция: C♯ D E♭ F♯ A♭ B♭)
export const ENHARMONIC_SIMPLE_NAMES: t.noteName[] = [
  'C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B',
];

export const PRESET_SCALE_CARD_CONTAINERS: Record<keyof t.presetScaleCardTexts, string> = {
  presetScaleName: 'preset-scale-name',
  presetScaleFamilyMood: 'preset-scale-family-mood',
  presetScaleType: 'preset-scale-type',
  presetScaleIntervalTonic: 'preset-scale-interval-tonic',
  presetScaleIntervalPattern: 'preset-scale-interval-pattern',
  presetScaleContextOffset: 'preset-scale-context-offset',
  presetScaleModalShift: 'preset-scale-modal-shift',
  presetScaleDegreeRotation: 'preset-scale-degree-rotation',
  presetScaleHiddenDegrees: 'preset-scale-hidden-degrees',
  presetScaleComment: 'preset-scale-comment',
};

export const PRESET_SCALE_CARD_STATIC_CONTENTS: Record<keyof t.presetScaleCardLabels, string> = {
  labelPresetScaleType: 'label-preset-scale-type',
  labelPresetScaleIntervalParams: 'label-preset-scale-interval-params',
  labelPresetScaleContextOffset: 'label-preset-scale-context-offset',
  labelPresetScaleModalShift: 'label-preset-scale-modal-shift',
  labelPresetScaleDegreeRotation: 'label-preset-scale-degree-rotation',
  labelPresetScaleHiddenDegrees: 'label-preset-scale-hidden-degrees',
  labelPresetScaleComment: 'label-preset-scale-comment',
};

export const PRESET_FRETBOARD_CARD_CONTAINERS: Record<keyof t.presetFretboardCardTexts, string> = {
  presetFretboardName: 'preset-fretboard-name',
  presetFretboardStringsCount: 'preset-fretboard-strings-count',
  presetFretboardTuning: 'preset-fretboard-tuning',
  presetFretboardNotes: 'preset-fretboard-notes',
  presetFretboardComment: 'preset-fretboard-comment',
};

export const PRESET_FRETBOARD_CARD_STATIC_CONTENTS: Record<keyof t.presetFretboardCardLabels, string> = {
  labelPresetFretboardTuning: 'label-preset-fretboard-tuning',
  labelPresetFretboardNotes: 'label-preset-fretboard-notes',
  labelPresetFretboardComment: 'label-preset-fretboard-comment',
};
