import type * as t from '../types';

export const DEFAULT_SCALE_PRESET_ID: number = 1;       // Ионийский лад (C major)
export const DEFAULT_FRETBOARD_PRESET_ID: number = 6;   // Гитара 6 струн стандарт
export const DEFAULT_LOCALE: t.locale = 'ru';
export const DEFAULT_THEME: t.uiTheme = 'light';
export const DEFAULT_IS_ENHARMONIC_SIMPLIFY: boolean = false;
export const DEFAULT_INTERVAL_DISPLAY_MODE: t.intervalDisplayMode = 'digit';

export const SCALE_PRESETS: t.i18nData<t.presetScales> = {
  ru: [
    { id: 1, name: 'Ионийский лад', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'мажор', family: 'натуральный', comment: 'Стандартный До мажор.', isCustomPreset: false },
    { id: 2, name: 'Дорийский лад', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 1, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'минор', family: 'модальный', comment: '', isCustomPreset: false },
    { id: 3, name: 'Фригийский лад', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 2, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'минор', family: 'модальный', comment: '', isCustomPreset: false },
    { id: 4, name: 'Лидийский лад', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 3, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'мажор', family: 'модальный', comment: '', isCustomPreset: false },
    { id: 5, name: 'Миксолидийский лад', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 4, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'мажор', family: 'модальный', comment: '', isCustomPreset: false },
    { id: 6, name: 'Эолийский лад', scaleType: 'Диатоника', tonic: 'A', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 5, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'минор', family: 'натуральный', comment: 'Стандартный Ля минор.', isCustomPreset: false },
    { id: 7, name: 'Локрийский лад', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 6, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: '', family: 'модальный', comment: '', isCustomPreset: false },
    { id: 8, name: 'Гармонический минор', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 1, 2, 2, 1, 3, 1], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'минор', family: 'гармонический', comment: '', isCustomPreset: false },
    { id: 9, name: 'Гармонический мажор', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 2, 1, 2, 1, 3, 1], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'мажор', family: 'гармонический', comment: '', isCustomPreset: false },
    { id: 10, name: 'Мелодический минор (восходящий)', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 1, 2, 2, 2, 2, 1], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'минор', family: 'мелодический', comment: '', isCustomPreset: false },
    { id: 11, name: 'Мелодический минор (нисходящий)', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 1, 2, 2, 1, 2, 2], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'минор', family: 'мелодический', comment: '', isCustomPreset: false },
    { id: 12, name: 'Мелодический мажор (восходящий)', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 2, 1, 2, 1, 2, 2], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'мажор', family: 'мелодический', comment: '', isCustomPreset: false },
    { id: 13, name: 'Мелодический мажор (нисходящий)', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'мажор', family: 'мелодический', comment: '', isCustomPreset: false },
    { id: 14, name: 'Блюзовая гамма', scaleType: 'Гексатоника', tonic: 'C', intervalPattern: [3, 2, 1, 1, 3, 2, 0], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'минор', family: 'блюзовая пентатоника+♭5', comment: '', isCustomPreset: false },
    { id: 15, name: 'Целотоновая гамма', scaleType: 'Гексатоника', tonic: 'C', intervalPattern: [2, 2, 2, 2, 2, 2, 0], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'симметричная', family: 'целотоновая', comment: '', isCustomPreset: false },
    { id: 16, name: 'Увеличенная гамма', scaleType: 'Гексатоника', tonic: 'C', intervalPattern: [3, 1, 3, 1, 3, 1, 0], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'симметричная', family: 'увеличенная', comment: '', isCustomPreset: false },
    { id: 17, name: 'Мажорная пентатоника', scaleType: 'Пентатоника', tonic: 'C', intervalPattern: [2, 2, 3, 2, 3, 0, 0], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'мажор', family: 'пентатоника', comment: '', isCustomPreset: false },
    { id: 18, name: 'Минорная пентатоника', scaleType: 'Пентатоника', tonic: 'A', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 5, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [2, 6], mood: 'минор', family: 'пентатоника', comment: '', isCustomPreset: false },
  ],
  en: [
    { id: 1, name: 'Ionian mode', scaleType: 'Diatonic', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'major', family: 'natural', comment: 'Standard C major.', isCustomPreset: false },
    { id: 2, name: 'Dorian mode', scaleType: 'Diatonic', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 1, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'minor', family: 'modal', comment: '', isCustomPreset: false },
    { id: 3, name: 'Phrygian mode', scaleType: 'Diatonic', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 2, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'minor', family: 'modal', comment: '', isCustomPreset: false },
    { id: 4, name: 'Lydian mode', scaleType: 'Diatonic', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 3, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'major', family: 'modal', comment: '', isCustomPreset: false },
    { id: 5, name: 'Mixolydian mode', scaleType: 'Diatonic', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 4, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'major', family: 'modal', comment: '', isCustomPreset: false },
    { id: 6, name: 'Aeolian mode', scaleType: 'Diatonic', tonic: 'A', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 5, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'minor', family: 'natural', comment: 'Standard A minor.', isCustomPreset: false },
    { id: 7, name: 'Locrian mode', scaleType: 'Diatonic', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 6, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: '', family: 'modal', comment: '', isCustomPreset: false },
    { id: 8, name: 'Harmonic minor', scaleType: 'Diatonic', tonic: 'C', intervalPattern: [2, 1, 2, 2, 1, 3, 1], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'minor', family: 'harmonic', comment: '', isCustomPreset: false },
    { id: 9, name: 'Harmonic major', scaleType: 'Diatonic', tonic: 'C', intervalPattern: [2, 2, 1, 2, 1, 3, 1], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'major', family: 'harmonic', comment: '', isCustomPreset: false },
    { id: 10, name: 'Melodic minor (ascending)', scaleType: 'Diatonic', tonic: 'C', intervalPattern: [2, 1, 2, 2, 2, 2, 1], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'minor', family: 'melodic', comment: '', isCustomPreset: false },
    { id: 11, name: 'Melodic minor (descending)', scaleType: 'Diatonic', tonic: 'C', intervalPattern: [2, 1, 2, 2, 1, 2, 2], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'minor', family: 'melodic', comment: '', isCustomPreset: false },
    { id: 12, name: 'Melodic major (ascending)', scaleType: 'Diatonic', tonic: 'C', intervalPattern: [2, 2, 1, 2, 1, 2, 2], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'major', family: 'melodic', comment: '', isCustomPreset: false },
    { id: 13, name: 'Melodic major (descending)', scaleType: 'Diatonic', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'major', family: 'melodic', comment: '', isCustomPreset: false },
    { id: 14, name: 'Blues scale', scaleType: 'Hexatonic', tonic: 'C', intervalPattern: [3, 2, 1, 1, 3, 2, 0], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'minor', family: 'blues pentatonic+flat 5', comment: '', isCustomPreset: false },
    { id: 15, name: 'Whole tone scale', scaleType: 'Hexatonic', tonic: 'C', intervalPattern: [2, 2, 2, 2, 2, 2, 0], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'symmetric', family: 'whole-tone', comment: '', isCustomPreset: false },
    { id: 16, name: 'Augmented scale', scaleType: 'Hexatonic', tonic: 'C', intervalPattern: [3, 1, 3, 1, 3, 1, 0], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'symmetric', family: 'augmented', comment: '', isCustomPreset: false },
    { id: 17, name: 'Major pentatonic', scaleType: 'Pentatonic', tonic: 'C', intervalPattern: [2, 2, 3, 2, 3, 0, 0], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'major', family: 'pentatonic', comment: '', isCustomPreset: false },
    { id: 18, name: 'Minor pentatonic', scaleType: 'Pentatonic', tonic: 'A', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 5, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [2, 6], mood: 'minor', family: 'pentatonic', comment: '', isCustomPreset: false },
  ],
};

// startNotes: высокие струны первые (обратный порядок относительно таблиц low→high)
export const FRETBOARD_PRESETS: t.i18nData<t.presetInstruments> = {
  ru: [
    { id: 1, name: 'Балалайка прима', tuning: 'стандарт', comment: '', startNotes: [{ note: 'A', octave: 4 }, { note: 'E', octave: 4 }, { note: 'E', octave: 4 }], isCustomPreset: false },
    { id: 2, name: 'Укулеле', tuning: 'стандарт', comment: '', startNotes: [{ note: 'A', octave: 4 }, { note: 'E', octave: 4 }, { note: 'C', octave: 4 }, { note: 'G', octave: 4 }], isCustomPreset: false },
    { id: 3, name: 'Скрипка', tuning: 'стандарт', comment: '', startNotes: [{ note: 'E', octave: 5 }, { note: 'A', octave: 4 }, { note: 'D', octave: 4 }, { note: 'G', octave: 3 }], isCustomPreset: false },
    { id: 4, name: 'Бас', tuning: 'стандарт', comment: '', startNotes: [{ note: 'G', octave: 2 }, { note: 'D', octave: 2 }, { note: 'A', octave: 1 }, { note: 'E', octave: 1 }], isCustomPreset: false },
    { id: 5, name: 'Бас', tuning: 'стандарт', comment: '', startNotes: [{ note: 'G', octave: 2 }, { note: 'D', octave: 2 }, { note: 'A', octave: 1 }, { note: 'E', octave: 1 }, { note: 'B', octave: 0 }], isCustomPreset: false },
    { id: 6, name: 'Гитара', tuning: 'стандарт', comment: '', startNotes: [{ note: 'E', octave: 4 }, { note: 'B', octave: 3 }, { note: 'G', octave: 3 }, { note: 'D', octave: 3 }, { note: 'A', octave: 2 }, { note: 'E', octave: 2 }], isCustomPreset: false },
    { id: 7, name: 'Гитара', tuning: 'стандарт', comment: '', startNotes: [{ note: 'E', octave: 4 }, { note: 'B', octave: 3 }, { note: 'G', octave: 3 }, { note: 'D', octave: 3 }, { note: 'A', octave: 2 }, { note: 'E', octave: 2 }, { note: 'B', octave: 1 }], isCustomPreset: false },
    { id: 8, name: 'Гитара', tuning: 'стандарт', comment: '', startNotes: [{ note: 'E', octave: 4 }, { note: 'E', octave: 4 }, { note: 'B', octave: 3 }, { note: 'B', octave: 3 }, { note: 'G', octave: 3 }, { note: 'G', octave: 3 }, { note: 'D', octave: 4 }, { note: 'D', octave: 3 }, { note: 'A', octave: 3 }, { note: 'A', octave: 2 }, { note: 'E', octave: 3 }, { note: 'E', octave: 2 }], isCustomPreset: false },
  ],
  en: [
    { id: 1, name: 'Balalaika Prima', tuning: 'standard', comment: 'Russian traditional tuning', startNotes: [{ note: 'A', octave: 4 }, { note: 'E', octave: 4 }, { note: 'E', octave: 4 }], isCustomPreset: false },
    { id: 2, name: 'Ukulele', tuning: 'standard', comment: '', startNotes: [{ note: 'A', octave: 4 }, { note: 'E', octave: 4 }, { note: 'C', octave: 4 }, { note: 'G', octave: 4 }], isCustomPreset: false },
    { id: 3, name: 'Violin', tuning: 'standard', comment: '', startNotes: [{ note: 'E', octave: 5 }, { note: 'A', octave: 4 }, { note: 'D', octave: 4 }, { note: 'G', octave: 3 }], isCustomPreset: false },
    { id: 4, name: 'Bass', tuning: 'standard', comment: '', startNotes: [{ note: 'G', octave: 2 }, { note: 'D', octave: 2 }, { note: 'A', octave: 1 }, { note: 'E', octave: 1 }], isCustomPreset: false },
    { id: 5, name: 'Bass', tuning: 'standard', comment: '', startNotes: [{ note: 'G', octave: 2 }, { note: 'D', octave: 2 }, { note: 'A', octave: 1 }, { note: 'E', octave: 1 }, { note: 'B', octave: 0 }], isCustomPreset: false },
    { id: 6, name: 'Guitar', tuning: 'standard', comment: '', startNotes: [{ note: 'E', octave: 4 }, { note: 'B', octave: 3 }, { note: 'G', octave: 3 }, { note: 'D', octave: 3 }, { note: 'A', octave: 2 }, { note: 'E', octave: 2 }], isCustomPreset: false },
    { id: 7, name: 'Guitar', tuning: 'standard', comment: '', startNotes: [{ note: 'E', octave: 4 }, { note: 'B', octave: 3 }, { note: 'G', octave: 3 }, { note: 'D', octave: 3 }, { note: 'A', octave: 2 }, { note: 'E', octave: 2 }, { note: 'B', octave: 1 }], isCustomPreset: false },
    { id: 8, name: 'Guitar', tuning: 'standard', comment: '', startNotes: [{ note: 'E', octave: 4 }, { note: 'E', octave: 4 }, { note: 'B', octave: 3 }, { note: 'B', octave: 3 }, { note: 'G', octave: 3 }, { note: 'G', octave: 3 }, { note: 'D', octave: 4 }, { note: 'D', octave: 3 }, { note: 'A', octave: 3 }, { note: 'A', octave: 2 }, { note: 'E', octave: 3 }, { note: 'E', octave: 2 }], isCustomPreset: false },
  ],
};
