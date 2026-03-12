import type * as t from '../types';
import * as mu from '../index';
import * as c from '../constants';

const selectedScaleParamsClasses = ['fw-bold', 'bg-secondary', 'bg-opacity-2', 'rounded-circle'];

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
    return new Map(scale.map(({ note, pitchClass }) => [note, c.ENHARMONIC_SIMPLE_NAMES[pitchClass]]));
  };

  const reduceAlt = (note: t.noteName, altReduceMap: t.altReduceMap): t.noteName =>
    altReduceMap.get(note) || note;

  const renderScaleTones = (resolvedScaleParams: t.resolvedScaleParams) => {
    const altReduceMap = getAltReduceMap(resolvedScaleParams.scale);
    refs.elScaleToneContainers.forEach((el, i) => {
      const scaleTone = resolvedScaleParams.scale[i];
      const prevIntervalSize = resolvedScaleParams.intervalPattern[i - 1];
      const isZeroStep = i > 0 && prevIntervalSize === 0;
      el.textContent = isZeroStep ? c.EMPTY_VALUE : reduceAlt(scaleTone.note, altReduceMap);
    });
  };

  const renderKeyboard = (resolvedScaleParams: t.resolvedScaleParams) => {
    const hiddenDegrees = store.stateHiddenDegrees.get();

    if (!resolvedScaleParams.canApplyContext) {
      refs.elKeyboardNotes.forEach((key) => {
        key.textContent = c.EMPTY_VALUE;
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

    const scaleLayouts = mu.mapScaleToLayout({ scaleMap, startNotes: [{ note: tonic.note, octave: 1 }] });
    const keyboardScaleLayout = scaleLayouts[0];

    const startKeyIndex = unwrapPitchClassForDisplay;
    const lastKeyIndex = startKeyIndex + c.OCTAVE_SIZE;

    refs.elKeyboardNotes.forEach((elKey, keyIndex) => {
      elKey.textContent = c.EMPTY_VALUE;
      if (keyIndex >= startKeyIndex && keyIndex < lastKeyIndex) {
        const noteIndex = keyIndex - startKeyIndex;
        const { note, degree } = keyboardScaleLayout[noteIndex];
        if (note && !hiddenDegrees.has(degree)) {
          elKey.textContent = reduceAlt(note, altReduceMap);
        }
      }
    });
  };

  const renderFretboard = (scaleLayouts: ReadonlyArray<t.scaleLayout>) => {
    const hiddenDegrees = store.stateHiddenDegrees.get();

    refs.elFretboardStartNoteContainers.forEach((elFretboardStartNoteContainer) => {
      elFretboardStartNoteContainer.textContent = c.EMPTY_VALUE;
    });
    refs.elFretboardStringFrets.forEach((elFretboardStringFret) => {
      elFretboardStringFret.forEach((elFretNote) => {
        elFretNote.textContent = c.EMPTY_VALUE;
        removeOctaveClass(elFretNote);
      });
    });

    const resolvedScaleParams = store.stateResolvedScaleParams.get();
    const altReduceMap = getAltReduceMap(resolvedScaleParams.scale);

    scaleLayouts.forEach((layout, stringIndex) => {
      const elFretboardStartNoteContainer = refs.elFretboardStartNoteContainers[stringIndex];
      const startNoteParams = layout[0];
      const { note, degree } = startNoteParams;
      const isVisible = note && !hiddenDegrees.has(degree);
      elFretboardStartNoteContainer.textContent = isVisible
        ? reduceAlt(note, altReduceMap)
        : c.EMPTY_VALUE;

      for (let fret = 1; fret <= c.OCTAVE_SIZE; fret++) {
        const fretIndex = fret - 1;
        const elFretNotes = refs.elFretboardStringFrets[stringIndex];
        const elFretNote = elFretNotes[fretIndex];
        const noteParams = layout[fret];
        removeOctaveClass(elFretNote);
        elFretNote.classList.add('text-black');

        elFretNote.textContent = c.EMPTY_VALUE;
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

  const renderIntervalContainers = () => {
    const { intervalPattern, modalShift } = store.stateScaleBuildParams.get();
    const displayMode = store.stateIntervalDisplayMode.get();
    const intervals = store.textIntervals.get();

    const getDisplayValue = (size: t.intervalSize): string => {
      if (size === 0 || displayMode === 'digit') {
        return size.toString();
      }
      if (size === 1) {
        return intervals.halfStep[0].toUpperCase();
      }
      if (size === 2) {
        return intervals.wholeStep[0].toUpperCase();
      }
      const name = intervals[<keyof typeof intervals>`interval${size}`];
      return name[0].toLowerCase();
    };

    refs.elIntervalContainers.forEach((el, index) => {
      if (index === 0) {
        el.textContent = getDisplayValue(index);
      } else {
        const stepIndex = index - 1;
        const intervalStep = intervalPattern[stepIndex];
        const elSetIntervalStep = refs.elSetIntervalSteps[stepIndex];
        elSetIntervalStep.textContent = getDisplayValue(intervalStep);
      }
      el.classList.remove(...selectedScaleParamsClasses);
      if (index === modalShift) {
        el.classList.add(...selectedScaleParamsClasses);
      }
    });
  };

  const renderIntervalDisplaySwitch = () => {
    const mode = store.stateIntervalDisplayMode.get();
    const intervals = store.textIntervals.get();
    if (mode === 'letter') {
      refs.elIntervalDisplaySwitch.textContent = intervals.digitModeLabel;
    } else {
      const halfStepLetter = intervals.halfStep[0].toUpperCase();
      const wholeStepLetter = intervals.wholeStep[0].toUpperCase();
      refs.elIntervalDisplaySwitch.textContent = `${halfStepLetter}/${wholeStepLetter}`;
    }
  };

  store.stateScaleBuildParams.subscribe(({ tonic }) => {
    refs.elTonicContainer.textContent = tonic;
    renderIntervalContainers();
  });

  store.stateIntervalDisplayMode.subscribe(renderIntervalContainers);
  store.textIntervals.subscribe(renderIntervalContainers);

  store.stateIntervalDisplayMode.subscribe(renderIntervalDisplaySwitch);
  store.textIntervals.subscribe(renderIntervalDisplaySwitch);

  store.stateResolvedScaleParams.subscribe((resolvedScaleParams) => {
    refs.elContextContainer.textContent = resolvedScaleParams.contextTargets.join('/');
  });

  store.theme.subscribe((theme) => {
    document.body.dataset.bsTheme = theme;
  });

  store.stateResolvedScaleParams.subscribe((resolvedScaleParams) => {
    refs.elDirectionControllers.forEach((el) => {
      const { control } = el.dataset;
      if (control === 'modal-shift' || control === 'context-shift' || control === 'degree-rotation') {
        el.disabled = !resolvedScaleParams.canModalShift;
      }
    });

    const texts = store.textErrors.get();
    if (!resolvedScaleParams.canModalShift) {
      refs.elResolveErrorContainer.textContent = texts.openPatternError;
    } else if (!resolvedScaleParams.canApplyContext) {
      const { tonic: centerNote } = store.stateScaleBuildParams.get();
      const targets = resolvedScaleParams.contextTargets.join('/');
      refs.elResolveErrorContainer.textContent = texts.resolveError({ note: centerNote, targets });
    } else {
      refs.elResolveErrorContainer.textContent = c.EMPTY_VALUE;
    }

    renderKeyboard(resolvedScaleParams);
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

  store.stateFretboardLayout.subscribe((scaleLayouts) => {
    renderFretboard(scaleLayouts);
  });

  store.stateIsEnharmonicSimplify.subscribe(() => {
    const isEnharmonicSimplify = store.stateIsEnharmonicSimplify.get();
    const unshiftResolvedScaleParams = store.stateUnshiftResolvedScaleParams.get();
    const resolvedScaleParams = store.stateResolvedScaleParams.get();
    const fretboardLayout = store.stateFretboardLayout.get();
    refs.elEnharmonicSimplifyToggle.checked = isEnharmonicSimplify;
    renderScaleTones(unshiftResolvedScaleParams);
    renderKeyboard(resolvedScaleParams);
    renderFretboard(fretboardLayout);
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

  // --- i18n ---

  store.stateLocale.subscribe((locale) => {
    refs.elLocaleSwitch.textContent = locale === 'ru' ? 'EN' : 'RU';
  });

  store.textErrors.subscribe((texts) => {
    const resolvedScaleParams = store.stateResolvedScaleParams.get();
    if (!resolvedScaleParams.canModalShift) {
      refs.elResolveErrorContainer.textContent = texts.openPatternError;
    } else if (!resolvedScaleParams.canApplyContext) {
      const { tonic: centerNote } = store.stateScaleBuildParams.get();
      const targets = resolvedScaleParams.contextTargets.join('/');
      refs.elResolveErrorContainer.textContent = texts.resolveError({
        note: centerNote,
        targets,
      });
    }
  });

  // --- /i18n ---
};
