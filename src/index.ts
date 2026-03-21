import HawkCatcher from '@hawk.so/javascript';
import { initI18n } from './app/i18n';
import { bindRenderers } from './app/render';
import { StorageService } from './app/StorageService';
import { createStore } from './app/store';
import { createUiStore, initUI } from './app/ui';
import * as cu from './commonUtils';
import * as d from './constants/defaults';
import * as t from './types';

new HawkCatcher({
  token: 'eyJpbnRlZ3JhdGlvbklkIjoiOTYxYTk2NWMtNDI0Mi00YjE0LWIzZDctYzc3MGRkNzQ2MDYxIiwic2VjcmV0IjoiNDg0ZWY0MTktMjgzNi00NjlhLWEwMDUtNjFjOTAzODUzODI2In0=',
  context: {
    env: window.location.hostname === 'localhost' ? 'development' : 'production',
  },
});

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
