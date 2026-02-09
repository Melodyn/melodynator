import type * as t from '../types';
import { createStore } from './store';
import { bindRenderers } from './render';
import {
  bindThemeToggle,
  bindDirectionControls,
  createUiStore,
  getDomRefs,
  initPopovers,
  initTooltips,
} from './ui';

export const run = () => {
  const store = createStore();
  const uiStore = createUiStore();
  const appStore = { ...store, ...uiStore };
  const refs = getDomRefs();

  bindRenderers(appStore, refs);
  initPopovers(refs);
  initTooltips(refs);
  bindThemeToggle(refs, uiStore);

  bindDirectionControls(refs, (control, direction) => {
    const offset: t.directionOffset = direction === 'up' ? 1 : -1;
    switch (control) {
      case 'tonic-shift':
        store.changeTonic(offset);
        break;
      case 'modal-shift':
        store.changeModalShift(offset);
        break;
      case 'degree-rotation':
        store.changeDegreeRotation(offset);
        break;
      case 'harmonic-transform':
        store.changeHarmonicIntervalSize(offset);
        break;
      default:
        break;
    }
  });
};
