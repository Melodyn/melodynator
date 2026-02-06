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

export const run = (): void => {
  const store = createStore();
  const uiStore = createUiStore();
  const appStore = { ...store, ...uiStore };
  const refs = getDomRefs();

  bindRenderers(appStore, refs);
  initPopovers(refs);
  initTooltips(refs);
  bindThemeToggle(refs, uiStore);

  bindDirectionControls(refs, (control, direction) => {
    switch (control) {
      case 'tonic-shift':
        store.changeTonic(direction);
        break;
      case 'modal-shift':
        store.changeModalShift(direction);
        break;
      case 'functional-shift':
        break;
      case 'harmonic-transform':
        store.changeHarmonicIntervalSize(direction);
        break;
      default:
        console.log({ control, direction });
    }
  });
};
