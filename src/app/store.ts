import * as n from 'nanostores';
import * as t from '../types';
import * as c from '../constants';
import * as cu from '../commonUtils';
import * as mu from '../index';

export const createStore = (): t.store => {
  const countChromaticNotes = c.allNotesNames.length;
  const defaultScaleBuildParams: t.scaleBuildParams = {
    tonic: 'C',
    intervalPattern: [2, 2, 1, 2, 2, 2, 1],
    modalShift: 0,
  };
  const stateScaleBuildParams = n.map(defaultScaleBuildParams);
  const stateHarmonicIntervalSize = n.atom<t.harmonicIntervalSize>(0);
  const stateCurrentNoteChromaticIndex = n.computed(
    stateScaleBuildParams,
    ({ tonic }) => cu.findIndex(c.allNotesNames, (noteName) => noteName === tonic),
  );
  const stateResolvedScaleParams = n.computed(
    [stateScaleBuildParams, stateHarmonicIntervalSize],
    (scaleBuildParams, harmonicIntervalSize) => {
      const resolvedScaleParams = mu.resolveScale(scaleBuildParams);
      // const resolvedFunctionalShiftedScaleParams = applyFunctionalShift(resolvedScaleParams, 0);
      const harmonicTransformedScaleParams = mu.applyHarmonicTransform(resolvedScaleParams, harmonicIntervalSize);
      return harmonicTransformedScaleParams;
    },
  );

  const changeTonic: t.changer = (direction) => {
    const currentTonicIndex = stateCurrentNoteChromaticIndex.get();
    const offset = direction === 'up' ? 1 : -1;
    const newTonicIndex = (currentTonicIndex + countChromaticNotes + offset) % countChromaticNotes;
    const newTonic = c.allNotesNames[newTonicIndex];
    stateScaleBuildParams.setKey('tonic', newTonic);
  };

  const changeModalShift: t.changer = (direction) => {
    const offset = direction === 'up' ? 1 : -1;
    const { intervalPattern, modalShift: currentShift } = stateScaleBuildParams.get();
    const degreeCount = intervalPattern.length + 1;
    const newShift = (currentShift + offset + degreeCount) % degreeCount;
    stateScaleBuildParams.setKey('modalShift', newShift);
  };

  const changeHarmonicIntervalSize: t.changer = (direction) => {
    const offset = direction === 'up' ? 1 : -1;
    const currentShift = stateHarmonicIntervalSize.get();
    stateHarmonicIntervalSize.set(<t.harmonicIntervalSize>((currentShift + c.OCTAVE_SIZE + offset) % c.OCTAVE_SIZE));
  };

  return {
    stateScaleBuildParams,
    stateHarmonicIntervalSize,
    stateCurrentNoteChromaticIndex,
    stateResolvedScaleParams,
    changeTonic,
    changeHarmonicIntervalSize,
    changeModalShift,
  };
};
