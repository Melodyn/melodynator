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
  const stateScaleBuildParams = n.map(defaultScaleBuildParams);
  const stateDegreeRotation = n.atom<t.degreeRotation>(0);
  const stateHarmonicIntervalSize = n.atom<t.harmonicIntervalSize>(0);
  const stateCurrentNoteChromaticIndex = n.computed(
    stateScaleBuildParams,
    ({ tonic }) => cu.findIndex(c.allNotesNames, (noteName) => noteName === tonic),
  );
  const stateUnshiftResolvedScaleParams = n.computed(
    stateScaleBuildParams,
    (scaleBuildParams) => {
      const resolvedScaleParams = mu.resolveScale({ ...scaleBuildParams, modalShift: 0 });
      return resolvedScaleParams;
    },
  );
  const stateResolvedScaleParams = n.computed(
    [stateScaleBuildParams, stateDegreeRotation, stateHarmonicIntervalSize],
    (scaleBuildParams, stateDegreeRotation, harmonicIntervalSize) => {
      const resolvedScaleParams = mu.resolveScale(scaleBuildParams);
      const resolvedDegreeRotatedScaleParams = mu.applyDegreeRotation(resolvedScaleParams, stateDegreeRotation);
      const resolvedHarmonicTransformedScaleParams = mu.applyHarmonicTransform(resolvedDegreeRotatedScaleParams, harmonicIntervalSize);
      return resolvedHarmonicTransformedScaleParams;
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
    const degreeCount = intervalPattern.length + 1;
    const newShift = (currentShift + offset + degreeCount) % degreeCount;
    stateScaleBuildParams.setKey('modalShift', newShift);
  };

  const offsetDegreeRotation: t.offsetScaleParam = (offset) => {
    const { intervalPattern } = stateScaleBuildParams.get();
    const currentShift = stateDegreeRotation.get();
    const degreeCount = intervalPattern.length + 1;
    const newShift = (currentShift + offset + degreeCount) % degreeCount;
    stateDegreeRotation.set(newShift);
  };

  const offsetHarmonicTransform: t.offsetScaleParam = (offset) => {
    const currentShift = stateHarmonicIntervalSize.get();
    stateHarmonicIntervalSize.set(<t.harmonicIntervalSize>((currentShift + c.OCTAVE_SIZE + offset) % c.OCTAVE_SIZE));
  };

  return {
    stateScaleBuildParams,
    stateHarmonicIntervalSize,
    stateCurrentNoteChromaticIndex,
    stateResolvedScaleParams,
    stateUnshiftResolvedScaleParams,
    stateDegreeRotation,
    offsetTonicShift,
    offsetModalShift,
    offsetDegreeRotation,
    offsetHarmonicTransform,
  };
};
