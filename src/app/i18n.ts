import { createI18n, localeFrom, browser, params } from '@nanostores/i18n';
import { persistentAtom } from '@nanostores/persistent';

export const localeStore = persistentAtom<string | undefined>('locale', undefined);
export const locale = localeFrom(
  localeStore,
  browser({ available: ['ru', 'en'], fallback: 'ru' }),
);

const i18n = createI18n(locale, {
  baseLocale: 'ru',
  async get(code) {
    return (await import(`../translations/${code}.json`)).default;
  },
});

export const textScaleParams = i18n('scaleParams', {
  offset: 'смещение',
  center: 'центр',
  context: 'контекст',
  tonal: 'тональное',
  modal: 'модальное',
  degrees: 'ступеней',
  hide: 'скрыть',
});

export const textTooltips = i18n('tooltips', {
  hide: 'По клику ступень удаляется из гаммы. Так можно оставить только ступени аккорда: 1, 3, 5',
  tonal: 'Меняет тонику гаммы. От неё считаются ступени и строятся аккорды',
  modal: 'Смещение по интервальной схеме меняет лад. Сдвиг на 5 шагов вправо даёт эолийский лад (натуральный минор)',
  degrees: 'Смещение центра внутри гаммы. Лад меняется без изменения нот, в отличие от модального смещения',
  center: 'Центр — основная нота гаммы. Он всегда первая ступень и точка отсчёта для аккордов, независимо от контекста',
  context: 'Контекст формирует гамму из родственной тональности вокруг центра. Например, F даёт B♭ для C7',
});

export const textFretboard = i18n('fretboard', {
  openNoteLabel: 'Открытая нота',
  octaveLabel: 'Номер октавы',
  confirmButton: '✓',
  octaveName0: 'субконтроктава',
  octaveName1: 'контроктава',
  octaveName2: 'большая',
  octaveName3: 'малая',
  octaveName4: 'первая',
  octaveName5: 'вторая',
  octaveName6: 'третья',
  octaveName7: 'четвёртая',
  octaveName8: 'пятая',
});

export const textContent = i18n('content', {
  pageTitle: 'Гаммы и аккорды онлайн',
  pageDescription: 'Обучающий музыкальный калькулятор для понимания гамм, аккордов и интервальных схем.',
  sectionTheoryTitle: 'Музыкальная теория — наглядно',
  sectionTheoryText: 'Сервис помогает изучать музыкальную теорию через визуализацию. Выберите тонику, соберите интервальную схему и посмотрите, как выглядят гаммы и аккорды на разных инструментах.',
  sectionFeaturesTitle: 'Что можно построить',
  featureScales: 'Гаммы и лады',
  featureChords: 'Аккорды и интервалы',
  featureIntervals: 'Интервальные схемы (тон / полутон)',
  featureDegrees: 'Ступени и структуры гамм',
  sectionAudienceTitle: 'Для кого этот сервис',
  sectionAudienceText: 'Инструмент создан для начинающих музыкантов и всех, кто изучает основы музыкальной теории независимо от инструмента.',
  sectionInstrumentsTitle: 'Поддержка инструментов',
  sectionInstrumentsText: 'Визуализация доступна для клавишных и струнных инструментов с возможностью настройки строя и количества струн.',
  footerText: 'Интерактивная музыкальная теория • Гаммы • Аккорды • Интервалы',
});

export const textErrors = i18n('errors', {
  resolveError: params('Центр {note} не входит в гамму {targets}'),
});
