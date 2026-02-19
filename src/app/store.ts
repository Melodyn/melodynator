import * as n from 'nanostores';
import * as t from '../types';
import * as c from '../constants';
import * as cu from '../commonUtils';
import * as mu from '../index';

export const createStore = (): t.store => {
  const chromaticNotesCount = c.allNotesNames.length;
  const defaultScaleBuildParams: t.scaleBuildParams = {
    tonic: 'C',
    intervalPattern: [2, 2, 1, 2, 2, 2, 1],
    modalShift: 0,
  };
  const stateHiddenDegrees = n.atom<Set<t.noteParams['degree']>>(new Set());
  const stateScaleBuildParams = n.map(defaultScaleBuildParams);
  const stateDegreeRotation = n.atom<t.degreeRotation>(0);
  const stateContextOffset = n.atom<t.contextOffset>(0);
  const stateCurrentNoteChromaticIndex = n.computed(
    stateScaleBuildParams,
    ({ tonic }) => cu.findIndex(c.allNotesNames, (noteName) => noteName === tonic),
  );
  const stateUnshiftResolvedScaleParams = n.computed(
    [stateScaleBuildParams, stateContextOffset],
    (scaleBuildParams, contextOffset) => {
      const resolvedScaleParams = mu.resolveScale(scaleBuildParams);
      return mu.applyContextTransform(resolvedScaleParams, contextOffset);
    },
  );
  const stateResolvedScaleParams = n.computed(
    [stateScaleBuildParams, stateDegreeRotation, stateContextOffset, stateHiddenDegrees],
    (scaleBuildParams, degreeRotation, contextOffset) => {
      const resolvedScaleParams = mu.resolveScale(scaleBuildParams);
      const resolvedContextScaleParams = mu.applyContextTransform(resolvedScaleParams, contextOffset);
      const resolvedDegreeRotatedScaleParams = mu.applyDegreeRotation(resolvedContextScaleParams, degreeRotation);
      return resolvedDegreeRotatedScaleParams;
    },
  );

  const offsetTonicShift: t.offsetScaleParam = (offset) => {
    const currentTonicIndex = stateCurrentNoteChromaticIndex.get();
    const newTonicIndex = (currentTonicIndex + chromaticNotesCount + offset) % chromaticNotesCount;
    const newTonic = c.allNotesNames[newTonicIndex];
    stateScaleBuildParams.setKey('tonic', newTonic);
  };

  const offsetModalShift: t.offsetScaleParam = (offset) => {
    const { intervalPattern, modalShift: currentShift } = stateScaleBuildParams.get();
    const degreeCount = intervalPattern.length;
    const newShift = (currentShift + offset + degreeCount) % degreeCount;
    stateScaleBuildParams.setKey('modalShift', newShift);
  };

  const offsetDegreeRotation: t.offsetScaleParam = (offset) => {
    const { intervalPattern } = stateScaleBuildParams.get();
    const currentShift = stateDegreeRotation.get();
    const degreeCount = intervalPattern.length;
    const newShift = (currentShift + offset + degreeCount) % degreeCount;
    stateDegreeRotation.set(newShift);
  };

  const offsetContext: t.offsetScaleParam = (offset) => {
    const currentShift = stateContextOffset.get();
    stateContextOffset.set(<t.contextOffset>((currentShift + c.OCTAVE_SIZE + offset) % c.OCTAVE_SIZE));
  };

  const switchDegreeVisibility: t.switchDegreeVisibility = (degree) => {
    const hiddenDegrees = new Set(stateHiddenDegrees.get());
    if (hiddenDegrees.has(degree)) {
      hiddenDegrees.delete(degree);
    } else {
      hiddenDegrees.add(degree);
    }
    stateHiddenDegrees.set(hiddenDegrees);
  };

  return {
    stateScaleBuildParams,
    stateContextOffset,
    stateCurrentNoteChromaticIndex,
    stateResolvedScaleParams,
    stateUnshiftResolvedScaleParams,
    stateDegreeRotation,
    stateHiddenDegrees,
    offsetTonicShift,
    offsetModalShift,
    offsetDegreeRotation,
    offsetContext,
    switchDegreeVisibility,
  };
};
