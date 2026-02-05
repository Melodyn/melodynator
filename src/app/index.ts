import { createStore } from './store';
import { bindRenderers } from './render';
import {
  bindDirectionControls,
  getDomRefs,
  initPopovers,
  initTooltips,
} from './ui';

export const run = (): void => {
  const store = createStore();
  const refs = getDomRefs();

  bindRenderers(store, refs);
  initPopovers(refs);
  initTooltips(refs);

  bindDirectionControls(refs, (control, direction) => {
    switch (control) {
      case 'tonic':
        store.changeTonic(direction);
        break;
      case 'modal':
        break;
      case 'functional':
        break;
      case 'harmonic':
        store.changeHarmonicShift(direction);
        break;
      default:
        console.log({ control, direction });
    }
  });
};
