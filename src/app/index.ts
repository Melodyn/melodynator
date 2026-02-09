import { createStore } from './store';
import { bindRenderers } from './render';
import { createUiStore, initUI } from './ui';

export const run = () => {
  const store = createStore();
  const uiStore = createUiStore();
  const appStore = { ...store, ...uiStore };
  const refs = initUI(appStore);

  bindRenderers(appStore, refs);
};
