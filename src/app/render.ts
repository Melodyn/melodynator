import type * as t from '../types';

export const bindRenderers = (store: t.store, refs: t.domRefs): void => {
  store.stateScaleBuildParams.subscribe((scaleBuildParams) => {
    refs.elTonicContainer.textContent = scaleBuildParams.tonic;
  });

  store.stateHarmonicShift.subscribe(() => {
    refs.elHarmonicContainer.textContent = store.stateHarmonicShift.get().toString();
  });
};
