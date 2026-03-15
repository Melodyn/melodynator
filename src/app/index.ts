import { initI18n } from './i18n';
import { createStore } from './store';
import { createUiStore, initUI } from './ui';
import { bindRenderers } from './render';
import * as cu from '../commonUtils';
import { StorageService } from './StorageService';
import * as d from '../constants/defaults';
import * as t from '../types';

export const run = () => {
  const locale = StorageService.selectOrDefault('locale', d.DEFAULT_LOCALE);

  const activeScalePresetId = d.DEFAULT_SCALE_PRESET_ID;
  const activeFretboardPresetId = d.DEFAULT_FRETBOARD_PRESET_ID;
  const scale = cu.find(d.SCALE_PRESETS[locale], p => p.id === activeScalePresetId);
  const fretboard = cu.find(d.FRETBOARD_PRESETS[locale], p => p.id === activeFretboardPresetId);

  const storageService = new StorageService({
    locale,
    theme: d.DEFAULT_THEME,
    tonic: scale.tonic,
    intervalPattern: scale.intervalPattern,
    modalShift: scale.modalShift,
    contextOffset: <t.contextOffset>scale.contextOffset,
    degreeRotation: scale.degreeRotation,
    hiddenDegrees: scale.hiddenDegrees,
    startNotes: fretboard.startNotes,
    activeScalePresetId,
    activeFretboardPresetId,
    isEnharmonicSimplify: d.DEFAULT_IS_ENHARMONIC_SIMPLIFY,
    intervalDisplayMode: d.DEFAULT_INTERVAL_DISPLAY_MODE,
  });
  const saved = storageService.selectAll();

  const i18nStore = initI18n(saved.locale, storageService);
  const uiStore = createUiStore(saved.theme, saved.isEnharmonicSimplify, saved.intervalDisplayMode, storageService);
  const store = createStore(saved, storageService);
  const appStore = { ...store, ...uiStore, ...i18nStore };
  const refs = initUI(appStore);

  bindRenderers(appStore, refs);
};
