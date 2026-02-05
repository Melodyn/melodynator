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
    modeShift: 0,
  };
  const stateScaleBuildParams = n.map(defaultScaleBuildParams);
  const stateHarmonicShift = n.atom(0);
  const stateCurrentNoteChromaticIndex = n.computed(
    stateScaleBuildParams,
    ({ tonic }) => cu.findIndex(c.allNotesNames, (noteName) => noteName === tonic),
  );
  const stateResolvedScaleParams = n.computed(
    stateScaleBuildParams,
    (scaleBuildParams) => mu.resolveScale(scaleBuildParams),
  );

  const changeTonic: t.changer = (direction) => {
    const currentTonicIndex = stateCurrentNoteChromaticIndex.get();
    const offset = direction === 'up' ? 1 : -1;
    const newTonicIndex = (currentTonicIndex + countChromaticNotes + offset) % countChromaticNotes;
    const newTonic = c.allNotesNames[newTonicIndex];
    stateScaleBuildParams.setKey('tonic', newTonic);
  };

  const changeHarmonicShift: t.changer = (direction) => {
    const offset = direction === 'up' ? 1 : -1;
    const currentShift = stateHarmonicShift.get();
    stateHarmonicShift.set((currentShift + c.OCTAVE_SIZE + offset) % c.OCTAVE_SIZE);
  };

  return {
    stateScaleBuildParams,
    stateHarmonicShift,
    stateCurrentNoteChromaticIndex,
    stateResolvedScaleParams,
    changeTonic,
    changeHarmonicShift,
  };
};
