import type * as t from '../types';
import * as mu from '../index';
import * as c from '../constants';

const selectedScaleParamsClasses = ['fw-bold', 'bg-secondary', 'bg-opacity-2'];

export const bindRenderers = (store: t.appStore, refs: t.domRefs) => {
  store.stateScaleBuildParams.subscribe(({ tonic, intervalPattern, modalShift }) => {
    refs.elTonicContainer.textContent = tonic;

    refs.elIntervalContainers.forEach((el, index) => {
      const intervalStep = index === 0 ? 0 : intervalPattern[index - 1];
      el.textContent = intervalStep.toString();

      el.classList.remove(...selectedScaleParamsClasses);
      if (index === modalShift) {
        el.classList.add(...selectedScaleParamsClasses);
      }
    });
  });

  store.stateResolvedScaleParams.subscribe((resolvedScaleParams) => {
    refs.elContextContainer.textContent = resolvedScaleParams.contextTargets.join('/');
  });

  store.theme.subscribe((theme) => {
    document.body.dataset.bsTheme = theme;
  });

  store.stateResolvedScaleParams.subscribe((resolvedScaleParams) => {
    const hiddenDegrees = store.stateHiddenDegrees.get();

    const centerNote = store.stateScaleBuildParams.get().tonic;

    refs.elResolveErrorContainer.textContent = resolvedScaleParams.canApplyContext
      ? c.EMPTY_VALUE
      : `Центр ${centerNote} не входит в гамму ${resolvedScaleParams.contextTargets.join('/')}`;

    if (!resolvedScaleParams.canApplyContext) {
      refs.elKeyboardNotes.forEach((key) => {
        key.textContent = c.EMPTY_VALUE;
      });
      return;
    }

    const scaleMap = mu.scaleToMap(resolvedScaleParams.scale);
    const tonic = resolvedScaleParams.scale[0];
    const currentNoteChromaticIndex = store.stateCurrentNoteChromaticIndex.get();
    const unwrapPitchClassForDisplay = tonic.pitchClass === 0 && currentNoteChromaticIndex > 1 ? c.OCTAVE_SIZE : tonic.pitchClass;

    const scaleLayouts = mu.mapScaleToLayout({ scaleMap, startNotes: [{ note: tonic.note, octave: 1 }] });
    const keyboardScaleLayout = scaleLayouts[0];

    const startKeyIndex = unwrapPitchClassForDisplay;
    const lastKeyIndex = startKeyIndex + c.OCTAVE_SIZE;

    refs.elKeyboardNotes.forEach((elKey, keyIndex) => {
      elKey.textContent = c.EMPTY_VALUE;
      if (keyIndex >= startKeyIndex && keyIndex < lastKeyIndex) {
        const noteIndex = keyIndex - startKeyIndex;
        const { note, degree } = keyboardScaleLayout[noteIndex];
        if (!hiddenDegrees.has(degree)) {
          elKey.textContent = note;
        }
      }
    });
  });

  store.stateUnshiftResolvedScaleParams.subscribe((resolvedScaleParams) => {
    const scaleMap = mu.scaleToMap(resolvedScaleParams.scale);
    const tonic = resolvedScaleParams.scale[0];
    const scaleLayouts = mu.mapScaleToLayout({ scaleMap, startNotes: [{ note: tonic.note, octave: 1 }] });
    const keyboardScaleLayout = scaleLayouts[0];
    const keyboardScaleLayoutWithoutEmpty = keyboardScaleLayout.filter((n) => n.note !== '');
    refs.elScaleToneContainers.forEach((el, i) => {
      el.textContent = keyboardScaleLayoutWithoutEmpty[i].note;
    });
  });

  store.stateDegreeRotation.subscribe((degreeRotation) => {
    refs.elScaleToneContainers.forEach((el, index) => {
      el.classList.remove(...selectedScaleParamsClasses);
      if (index === degreeRotation) {
        el.classList.add(...selectedScaleParamsClasses);
      }
    });
  });

  store.stateHiddenDegrees.subscribe((cur, prev = new Set()) => {
    const visibleDegrees: t.degree[] = [];
    prev.forEach(degree => {
      if (!cur.has(degree)) {
        visibleDegrees.push(degree);
      }
    });
    visibleDegrees.forEach((degree) => {
      const elSwitchDegreeContainer = refs.elSwitchDegreeContainers[degree - 1];
      const [elLabel] = elSwitchDegreeContainer.labels || [];
      if (elLabel) {
        elLabel.classList.remove('text-secondary', 'text-decoration-line-through');
        elLabel.classList.add('border-dark-subtle');
      }
    });
    cur.forEach((degree) => {
      const elSwitchDegreeContainer = refs.elSwitchDegreeContainers[degree - 1];
      const [elLabel] = elSwitchDegreeContainer.labels || [];
      if (elLabel) {
        elLabel.classList.add('text-secondary', 'text-decoration-line-through');
        elLabel.classList.remove('border-dark-subtle');
      }
    });
  });
};
