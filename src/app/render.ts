import type * as t from '../types';
import * as mu from '../index';
import * as c from '../constants';

export const bindRenderers = (store: t.appStore, refs: t.domRefs) => {
  store.stateScaleBuildParams.subscribe(({ tonic, intervalPattern, modalShift }) => {
    refs.elTonicContainer.textContent = tonic;

    refs.elIntervalContainers.forEach((el, index) => {
      const intervalStep = index === 0 ? 0 : intervalPattern[index - 1];
      el.textContent = intervalStep.toString();

      el.classList.remove('fw-bold');
      el.classList.remove('bg-secondary');
      el.classList.remove('bg-opacity-2');
      if (index === modalShift) {
        el.classList.add('fw-bold');
        el.classList.add('bg-secondary');
        el.classList.add('bg-opacity-2');
      }
    });
  });

  store.stateHarmonicIntervalSize.subscribe((stateHarmonicIntervalSize) => {
    const resolvedScale = store.stateResolvedScaleParams.get()
    refs.elHarmonicContainer.textContent = resolvedScale.harmonicTargets.join('/');
  });

  store.theme.subscribe((theme) => {
    document.body.dataset.bsTheme = theme;
  });

  store.stateResolvedScaleParams.subscribe((resolvedScaleParams) => {
    refs.elResolveErrorContainer.textContent = resolvedScaleParams.canHarmonicTransform ? '' : `Центр не входит в гамму ${resolvedScaleParams.harmonicTargets.join('/')}`;
    if (!resolvedScaleParams.canHarmonicTransform) {
      refs.elKeyboardNotes.forEach((key) => {
        key.textContent = '\u00A0';
      });
      return;
    }

    const scaleMap = mu.scaleToMap(resolvedScaleParams.scale);
    const tonic = resolvedScaleParams.scale[0];
    const currentNoteChromaticIndex = store.stateCurrentNoteChromaticIndex.get();
    const unwrapPitchClassForDisplay = tonic.pitchClass === 0 && currentNoteChromaticIndex > 1 ? c.OCTAVE_SIZE : tonic.pitchClass;

    const scaleLayouts = mu.mapScaleToLayout({ scaleMap, startNotes: [{ note: tonic.note, octave: 1 }], name: 'keyboard' });
    const keyboardScaleLayout = scaleLayouts[0];

    const startKeyIndex = unwrapPitchClassForDisplay;
    const lastKeyIndex = startKeyIndex + c.OCTAVE_SIZE;

    refs.elKeyboardNotes.forEach((elKey, keyIndex) => {
      elKey.textContent = '';
      if (keyIndex >= startKeyIndex && keyIndex < lastKeyIndex) {
        const noteIndex = keyIndex - startKeyIndex;
        elKey.textContent = keyboardScaleLayout[noteIndex].note;
      }
    });
  });

  store.stateUnshiftResolvedScaleParams.subscribe((resolvedScaleParams) => {
    const scaleMap = mu.scaleToMap(resolvedScaleParams.scale);
    const tonic = resolvedScaleParams.scale[0];
    const scaleLayouts = mu.mapScaleToLayout({ scaleMap, startNotes: [{ note: tonic.note, octave: 1 }], name: 'keyboard' });
    const keyboardScaleLayout = scaleLayouts[0];
    const keyboardScaleLayoutWithoutEmpty = keyboardScaleLayout.filter((n) => n.note !== '');
    refs.elScaleToneContainers.forEach((el, i) => {
      el.textContent = keyboardScaleLayoutWithoutEmpty[i].note;
    });
    refs.elHarmonicContainer.textContent = tonic.note;
  });

  store.stateDegreeRotation.subscribe((degreeRotation) => {
    refs.elScaleToneContainers.forEach((el, index) => {
      el.classList.remove('fw-bold');
      el.classList.remove('bg-secondary');
      el.classList.remove('bg-opacity-2');
      if (index === degreeRotation) {
        el.classList.add('fw-bold');
        el.classList.add('bg-secondary');
        el.classList.add('bg-opacity-2');
      }
    });
  });
};
