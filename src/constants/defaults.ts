import type * as t from '../types';

export const DEFAULT_SCALE_PRESET_ID: number = 1;       // Ионийский лад (C major)
export const DEFAULT_FRETBOARD_PRESET_ID: number = 6;   // Гитара 6 струн стандарт
export const DEFAULT_LOCALE: t.locale = 'ru';
export const DEFAULT_THEME: t.uiTheme = 'light';

export const SCALE_PRESETS: t.presetScale[] = [
  { id: 1, name: 'Ионийский лад', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'мажор', family: 'натуральный' },
  { id: 2, name: 'Дорийский лад', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 1, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'минор', family: 'модальный' },
  { id: 3, name: 'Фригийский лад', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 2, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'минор', family: 'модальный' },
  { id: 4, name: 'Лидийский лад', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 3, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'мажор', family: 'модальный' },
  { id: 5, name: 'Миксолидийский лад', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 4, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'мажор', family: 'модальный' },
  { id: 6, name: 'Эолийский лад', scaleType: 'Диатоника', tonic: 'A', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 5, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'минор', family: 'натуральный' },
  { id: 7, name: 'Локрийский лад', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 6, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: '', family: 'модальный' },
  { id: 8, name: 'Гармонический минор', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 1, 2, 2, 1, 3, 1], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'минор', family: 'гармонический' },
  { id: 9, name: 'Гармонический мажор', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 2, 1, 2, 1, 3, 1], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'мажор', family: 'гармонический' },
  { id: 10, name: 'Мелодический минор (восходящий)', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 1, 2, 2, 2, 2, 1], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'минор', family: 'мелодический' },
  { id: 11, name: 'Мелодический минор (нисходящий)', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 1, 2, 2, 1, 2, 2], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'минор', family: 'мелодический' },
  { id: 12, name: 'Мелодический мажор (восходящий)', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 2, 1, 2, 1, 2, 2], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'мажор', family: 'мелодический' },
  { id: 13, name: 'Мелодический мажор (нисходящий)', scaleType: 'Диатоника', tonic: 'C', intervalPattern: [2, 2, 1, 2, 2, 2, 1], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'мажор', family: 'мелодический' },
  { id: 14, name: 'Блюзовая гамма', scaleType: 'Гексатоника', tonic: 'C', intervalPattern: [3, 2, 1, 1, 3, 2], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'минор', family: 'блюзовая пентатоника+♭5' },
  { id: 15, name: 'Целотоновая гамма', scaleType: 'Гексатоника', tonic: 'C', intervalPattern: [2, 2, 2, 2, 2, 2], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'симметричная', family: 'целотоновая' },
  { id: 16, name: 'Увеличенная гамма', scaleType: 'Гексатоника', tonic: 'C', intervalPattern: [3, 1, 3, 1, 3, 1], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'симметричная', family: 'увеличенная' },
  { id: 17, name: 'Мажорная пентатоника', scaleType: 'Пентатоника', tonic: 'C', intervalPattern: [2, 2, 3, 2, 3], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'мажор', family: 'пентатоника' },
  { id: 18, name: 'Минорная пентатоника', scaleType: 'Пентатоника', tonic: 'C', intervalPattern: [3, 2, 2, 3, 2], modalShift: 0, contextOffset: 0, degreeRotation: 0, hiddenDegrees: [], mood: 'минор', family: 'пентатоника' },
];

// startNotes: высокие струны первые (обратный порядок относительно таблиц low→high)
export const FRETBOARD_PRESETS: t.presetInstrument[] = [
  { id: 1, name: 'Балалайка прима', tuning: 'стандарт', startNotes: [{ note: 'A', octave: 4 }, { note: 'E', octave: 4 }, { note: 'E', octave: 4 }] },
  { id: 2, name: 'Укулеле', tuning: 'стандарт', startNotes: [{ note: 'A', octave: 4 }, { note: 'E', octave: 4 }, { note: 'C', octave: 4 }, { note: 'G', octave: 4 }] },
  { id: 3, name: 'Скрипка', tuning: 'стандарт', startNotes: [{ note: 'E', octave: 5 }, { note: 'A', octave: 4 }, { note: 'D', octave: 4 }, { note: 'G', octave: 3 }] },
  { id: 4, name: 'Бас', tuning: 'стандарт', startNotes: [{ note: 'G', octave: 2 }, { note: 'D', octave: 2 }, { note: 'A', octave: 1 }, { note: 'E', octave: 1 }] },
  { id: 5, name: 'Бас', tuning: 'стандарт', startNotes: [{ note: 'G', octave: 2 }, { note: 'D', octave: 2 }, { note: 'A', octave: 1 }, { note: 'E', octave: 1 }, { note: 'B', octave: 0 }] },
  { id: 6, name: 'Гитара', tuning: 'стандарт', startNotes: [{ note: 'E', octave: 4 }, { note: 'B', octave: 3 }, { note: 'G', octave: 3 }, { note: 'D', octave: 3 }, { note: 'A', octave: 2 }, { note: 'E', octave: 2 }] },
  { id: 7, name: 'Гитара', tuning: 'стандарт', startNotes: [{ note: 'E', octave: 4 }, { note: 'B', octave: 3 }, { note: 'G', octave: 3 }, { note: 'D', octave: 3 }, { note: 'A', octave: 2 }, { note: 'E', octave: 2 }, { note: 'B', octave: 1 }] },
  { id: 8, name: 'Гитара', tuning: 'стандарт', startNotes: [{ note: 'E', octave: 4 }, { note: 'E', octave: 4 }, { note: 'B', octave: 3 }, { note: 'B', octave: 3 }, { note: 'G', octave: 3 }, { note: 'G', octave: 3 }, { note: 'D', octave: 4 }, { note: 'D', octave: 3 }, { note: 'A', octave: 3 }, { note: 'A', octave: 2 }, { note: 'E', octave: 3 }, { note: 'E', octave: 2 }] },
];
