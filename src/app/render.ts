import type * as t from '../types';
import * as mu from '../index';

export const bindRenderers = (store: t.appStore, refs: t.domRefs): void => {
  store.stateScaleBuildParams.subscribe((scaleBuildParams) => {
    refs.elTonicContainer.textContent = scaleBuildParams.tonic;
  });

  store.stateHarmonicIntervalSize.subscribe(() => {
    refs.elHarmonicContainer.textContent = store.stateHarmonicIntervalSize.get().toString();
  });

  store.theme.subscribe((theme) => {
    document.body.dataset.bsTheme = theme;
  });

  store.stateResolvedScaleParams.subscribe((resolvedScaleParams) => {
    refs.elResolveErrorContainer.textContent = resolvedScaleParams.error;
    const hasError = resolvedScaleParams.error.length > 1;
    if (hasError) {
      refs.elKeyboardNotes.forEach((key) => {
        key.textContent = '\u00A0';
      });
      return;
    }

    const scaleMap = mu.scaleToMap(resolvedScaleParams.scale);
    const scaleLayouts = mu.mapScaleToLayout({ scaleMap, startNotes: [{ note: 'C', octave: 1 }], name: 'keyboard' });
    const keyboardScaleLayout = scaleLayouts[0];
    const keyboardScaleLayoutSize = keyboardScaleLayout.length - 1;
    const startKeyIndex = resolvedScaleParams.scale[0].pitchClass;
    const lastKeyIndex = startKeyIndex + keyboardScaleLayoutSize;

    refs.elKeyboardNotes.forEach((key, keyIndex) => {
      const noteIndex = keyIndex % keyboardScaleLayoutSize;
      key.textContent = '';
      if (keyIndex >= startKeyIndex && keyIndex < lastKeyIndex) {
        key.textContent = keyboardScaleLayout[noteIndex].note;
      }
    });
  });

  store.stateScaleBuildParams.subscribe(({ modalShift }) => {
    refs.elIntervalContainers.forEach((el, index) => {
      el.classList.remove('fw-bold');
      if (index === modalShift) {
        el.classList.add('fw-bold');
      }
    });
  });
};
