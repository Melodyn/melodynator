import type * as t from '../types';
import * as mu from '../core';
import * as c from '../constants';

const selectedScaleParamsClasses = ['fw-bold', 'bg-secondary', 'bg-opacity-2', 'rounded-circle'];
const hiddenDegreeLabelClasses = ['text-secondary', 'text-decoration-line-through'];

const removeOctaveClass = (elFretNote: HTMLTableCellElement) => {
  elFretNote.classList.forEach((className) => {
    if (className.startsWith('bg-octave-')) {
      elFretNote.classList.remove(className);
    }
  });
};

export const bindRenderers = (store: t.appStore, refs: t.domRefs) => {
  const getAltReduceMap = (scale: t.scale): t.altReduceMap => {
    const isEnharmonicSimplify = store.stateIsEnharmonicSimplify.get();
    if (!isEnharmonicSimplify) {
      return new Map();
    }
    const chromaticScale = store.stateChromaticScale.get();
    return new Map(scale.map(({ note, pitchClass }) => [note, chromaticScale[pitchClass].note]));
  };

  const reduceAlt = (note: t.noteName, altReduceMap: t.altReduceMap): t.noteName =>
    altReduceMap.get(note) || note;

  const renderScaleTones = (resolvedScaleParams: t.resolvedScaleParams) => {
    const altReduceMap = getAltReduceMap(resolvedScaleParams.scale);
    refs.elScaleToneContainers.forEach((el, i) => {
      const scaleTone = resolvedScaleParams.scale[i];
      if (!scaleTone) {
        el.textContent = c.EMPTY_VALUE;
        return;
      }
      const prevIntervalSize = resolvedScaleParams.intervalPattern[i - 1];
      const isZeroStep = i > 0 && prevIntervalSize === 0;
      el.textContent = isZeroStep ? c.EMPTY_VALUE : reduceAlt(scaleTone.note, altReduceMap);
    });
  };

  const renderKeyboard = (resolvedScaleParams: t.resolvedScaleParams) => {
    const hiddenDegrees = store.stateHiddenDegrees.get();

    if (!resolvedScaleParams.canApplyContext) {
      refs.elKeyboardNotes.forEach((elKey) => {
        elKey.textContent = c.EMPTY_VALUE;
      });
      return;
    }

    const altReduceMap = getAltReduceMap(resolvedScaleParams.scale);
    const scaleMap = mu.scaleToMap(resolvedScaleParams.scale);
    const tonic = resolvedScaleParams.scale[0];
    const currentNoteChromaticIndex = store.stateCurrentNoteChromaticIndex.get();
    const unwrapPitchClassForDisplay = tonic.pitchClass === 0 && currentNoteChromaticIndex > 1
      ? c.OCTAVE_SIZE
      : tonic.pitchClass;
    const [keyboardScaleLayout] = mu.mapScaleToLayout({ scaleMap, startNotes: [{ note: tonic.note, octave: 1 }] });

    const startKeyIndex = unwrapPitchClassForDisplay;
    const lastKeyIndex = startKeyIndex + c.OCTAVE_SIZE;

    refs.elKeyboardNotes.forEach((elKey, keyIndex) => {
      elKey.textContent = c.EMPTY_VALUE;
      if (keyIndex >= startKeyIndex && keyIndex < lastKeyIndex) {
        const noteIndex = keyIndex - startKeyIndex;
        const noteParams = keyboardScaleLayout[noteIndex];
        const { note, degree } = noteParams;
        if (note && !hiddenDegrees.has(degree)) {
          elKey.textContent = reduceAlt(note, altReduceMap);
        }
      }
    });
  };

  const renderFretboard = (scaleLayouts: ReadonlyArray<t.scaleLayout>) => {
    const hiddenDegrees = store.stateHiddenDegrees.get();
    const resolvedScaleParams = store.stateResolvedScaleParams.get();
    const altReduceMap = getAltReduceMap(resolvedScaleParams.scale);

    refs.elFretboardStringNoteContainers.forEach((elFretboardStringNoteContainer) => {
      elFretboardStringNoteContainer.textContent = c.EMPTY_VALUE;
    });
    refs.elFretboardStringFrets.forEach((elFretboardStringFrets) => {
      elFretboardStringFrets.forEach((elFretNote) => {
        elFretNote.textContent = c.EMPTY_VALUE;
        removeOctaveClass(elFretNote);
      });
    });

    scaleLayouts.forEach((layout, stringIndex) => {
      const elFretboardStringNoteContainer = refs.elFretboardStringNoteContainers[stringIndex];
      const startNote = layout[0];
      const { note, degree } = startNote;
      const isVisible = note && !hiddenDegrees.has(degree);
      elFretboardStringNoteContainer.textContent = isVisible
        ? reduceAlt(note, altReduceMap)
        : c.EMPTY_VALUE;

      const elFretboardStringFrets = refs.elFretboardStringFrets[stringIndex];
      for (let fret = 1; fret <= c.OCTAVE_SIZE; fret += 1) {
        const fretIndex = fret - 1;
        const elFretNote = elFretboardStringFrets[fretIndex];
        const noteParams = layout[fret];
        elFretNote.classList.add('text-black');

        if (noteParams) {
          const { note, degree, octave } = noteParams;
          if (note && !hiddenDegrees.has(degree)) {
            elFretNote.textContent = reduceAlt(note, altReduceMap);
            elFretNote.classList.add(`bg-octave-${octave}`);
          }
        }
      }
    });
  };

  const renderVisibleNotes = () => {
    const resolvedScaleParams = store.stateResolvedScaleParams.get();
    const scaleLayouts = store.stateFretboardLayout.get();
    renderKeyboard(resolvedScaleParams);
    renderFretboard(scaleLayouts);
  };

  const renderIntervalContainers = () => {
    const { intervalPattern, modalShift } = store.stateScaleBuildParams.get();
    const displayMode = store.stateIntervalDisplayMode.get();
    const intervals = store.textIntervals.get();

    const getDisplayValue = (size: t.intervalSize, absoluteSize?: t.intervalSize): string => {
      if (size === 0 || displayMode === 'digit') {
        return size.toString();
      }
      if (size === 1) {
        return intervals.halfStep[0].toUpperCase();
      }
      if (size === 2) {
        return intervals.wholeStep[0].toUpperCase();
      }
      const name = intervals[<keyof typeof intervals>`interval${absoluteSize ?? size}`];
      return name.split(' / ')[0].split(' ').slice(0, 2).map(w => w[0]).join('').toLowerCase();
    };

    refs.elIntervalContainers.forEach((el, index) => {
      const isActive = index <= intervalPattern.length;
      el.classList.remove(...selectedScaleParamsClasses);
      if (index === 0) {
        el.textContent = getDisplayValue(index);
      } else {
        const stepIndex = index - 1;
        const intervalStep = isActive ? intervalPattern[stepIndex] : 0;
        const cumulativeInterval = isActive
          ? <t.intervalSize>intervalPattern.slice(0, stepIndex + 1).reduce<number>((a, b) => a + b, 0)
          : 0;
        const elSetIntervalStep = refs.elSetIntervalSteps[stepIndex];
        elSetIntervalStep.textContent = getDisplayValue(intervalStep, cumulativeInterval);
      }
      if (isActive && index === modalShift) {
        el.classList.add(...selectedScaleParamsClasses);
      }
    });
  };

  const renderDirectionControllers = (resolvedScaleParams: t.resolvedScaleParams) => {
    refs.elDirectionControllers.forEach((el) => {
      const { control } = el.dataset;
      if (control === 'modal-shift' || control === 'context-shift' || control === 'degree-rotation') {
        el.disabled = !resolvedScaleParams.canModalShift;
      }
    });
  };

  const renderResolveError = () => {
    const resolvedScaleParams = store.stateResolvedScaleParams.get();
    const texts = store.textErrors.get();

    if (!resolvedScaleParams.canModalShift) {
      refs.elResolveErrorContainer.textContent = texts.openPatternError;
      return;
    }
    if (!resolvedScaleParams.canApplyContext) {
      const { tonic: centerNote } = store.stateScaleBuildParams.get();
      const targets = resolvedScaleParams.contextTargets.join('/');
      refs.elResolveErrorContainer.textContent = texts.resolveError({ note: centerNote, targets });
      return;
    }
    refs.elResolveErrorContainer.textContent = c.EMPTY_VALUE;
  };

  const renderHiddenDegreeLabels = () => {
    const hiddenDegrees = store.stateHiddenDegrees.get();

    refs.elDegreeSwitchLabels.forEach((elDegreeSwitchLabel, index) => {
      const degree = index + 1;
      const isHidden = hiddenDegrees.has(degree);
      elDegreeSwitchLabel.classList.toggle('border-dark-subtle', !isHidden);
      hiddenDegreeLabelClasses.forEach((className) => {
        elDegreeSwitchLabel.classList.toggle(className, isHidden);
      });
    });
  };

  store.stateScaleBuildParams.subscribe(({ tonic }) => {
    refs.elTonicContainer.textContent = tonic;
    renderIntervalContainers();
    renderResolveError();
  });

  store.stateIntervalDisplayMode.subscribe(renderIntervalContainers);
  store.textIntervals.subscribe(renderIntervalContainers);

  store.stateResolvedScaleParams.subscribe((resolvedScaleParams) => {
    refs.elContextContainer.textContent = resolvedScaleParams.contextTargets.join('/');
    renderDirectionControllers(resolvedScaleParams);
    renderResolveError();
    renderVisibleNotes();
  });

  store.theme.subscribe((theme) => {
    refs.elBody.dataset.bsTheme = theme;
  });

  store.stateUnshiftResolvedScaleParams.subscribe(renderScaleTones);

  store.stateDegreeRotation.subscribe((degreeRotation) => {
    refs.elScaleToneContainers.forEach((el, index) => {
      el.classList.remove(...selectedScaleParamsClasses);
      if (index === degreeRotation) {
        el.classList.add(...selectedScaleParamsClasses);
      }
    });
  });

  store.stateFretboardLayout.subscribe(() => {
    renderVisibleNotes();
  });

  store.stateIsEnharmonicSimplify.subscribe(() => {
    const unshiftResolvedScaleParams = store.stateUnshiftResolvedScaleParams.get();
    renderScaleTones(unshiftResolvedScaleParams);
    renderVisibleNotes();
  });

  store.stateHiddenDegrees.subscribe(() => {
    renderHiddenDegreeLabels();
    renderVisibleNotes();
  });

  // --- i18n ---

  store.stateLocale.subscribe((locale) => {
    refs.elLocaleSwitch.textContent = locale === 'ru' ? 'EN' : 'RU';
  });

  store.textErrors.subscribe(() => {
    renderResolveError();
  });

  // --- /i18n ---
};
