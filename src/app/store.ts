import * as n from 'nanostores';
import * as t from '../types';
import * as c from '../constants';
import * as cu from '../commonUtils';
import * as mu from '../index';
import { StorageService } from './StorageService';

export const createStore = (saved: t.savedValues, storageService: StorageService): t.store => {
  const stateHiddenDegrees = n.atom<Set<t.degree>>(new Set(saved.hiddenDegrees));
  const stateFretboardStartNotes = n.atom<t.fretboardStartNoteParams[]>(saved.startNotes);
  const stateScaleBuildParams = n.map<t.scaleBuildParams>({ tonic: saved.tonic, intervalPattern: saved.intervalPattern, modalShift: saved.modalShift });
  const stateDegreeRotation = n.atom<t.degreeRotation>(saved.degreeRotation);
  const stateContextOffset = n.atom<t.contextOffset>(saved.contextOffset);
  const stateActiveScalePresetId = n.atom<number>(saved.activeScalePresetId);
  const stateActiveFretboardPresetId = n.atom<number>(saved.activeFretboardPresetId);
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
  const stateFretboardLayout = n.computed(
    [stateResolvedScaleParams, stateFretboardStartNotes],
    (resolvedScaleParams, startNotes) => {
      if (!resolvedScaleParams.canApplyContext) {
        return [];
      }
      const scaleMap = mu.scaleToMap(resolvedScaleParams.scale);
      return mu.mapScaleToLayout({ scaleMap, startNotes });
    },
  );

  const offsetTonicShift: t.offsetScaleParam = (offset) => {
    const currentTonicIndex = stateCurrentNoteChromaticIndex.get();
    const newTonicIndex = (currentTonicIndex + c.allNotesNames.length + offset) % c.allNotesNames.length;
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
    const currentRotation = stateDegreeRotation.get();
    const degreeCount = intervalPattern.length;
    const newRotation = (currentRotation + offset + degreeCount) % degreeCount;
    stateDegreeRotation.set(newRotation);
  };

  const offsetContext: t.offsetScaleParam = (offset) => {
    const currentShift = stateContextOffset.get();
    const newContextOffset = <t.contextOffset>((currentShift + c.OCTAVE_SIZE + offset) % c.OCTAVE_SIZE);
    stateContextOffset.set(newContextOffset);
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

  const setFretboardStartNote: t.setFretboardStartNote = (startNoteParams) => {
    const { index: changeStringIndex, ...newStringParams } = startNoteParams;
    const currentStartNotes = stateFretboardStartNotes.get();
    const newStartNotes = currentStartNotes.map(
      (startNote: t.fretboardStartNoteParams, i: number) => i === changeStringIndex ? newStringParams : startNote,
    );
    stateFretboardStartNotes.set(newStartNotes);
  };

  const addFretboardString: t.addFretboardString = () => {
    const currentStartNotes = stateFretboardStartNotes.get();
    if (currentStartNotes.length >= c.MAX_FRETBOARD_STRINGS) {
      return;
    }
    const lastStartNote = currentStartNotes[currentStartNotes.length - 1];
    const naturalNote = <t.naturalNoteName>lastStartNote.note[0];
    const accidental = lastStartNote.note.slice(1);
    const modifier = accidental === c.SHARP_SYMBOL ? 1 : accidental === c.FLAT_SYMBOL ? -1 : 0;
    const lastPitchClass = (c.NATURAL_PITCH_CLASSES[naturalNote] + modifier + c.OCTAVE_SIZE) % c.OCTAVE_SIZE;
    const newPitchClass = (lastPitchClass - c.FRETBOARD_STRING_INTERVAL + c.OCTAVE_SIZE) % c.OCTAVE_SIZE;
    const newNote = c.ENHARMONIC_SIMPLE_NAMES[newPitchClass];
    const newOctave = newPitchClass > lastPitchClass ? Math.max(0, lastStartNote.octave - 1) : lastStartNote.octave;
    stateFretboardStartNotes.set([...currentStartNotes, { note: newNote, octave: newOctave }]);
  };

  const removeFretboardString: t.removeFretboardString = (index) => {
    const currentStartNotes = stateFretboardStartNotes.get();
    if (currentStartNotes.length <= c.MIN_FRETBOARD_STRINGS) {
      return;
    }
    const newStartNotes = currentStartNotes.filter((_, i) => i !== index);
    stateFretboardStartNotes.set(newStartNotes);
  };

  const setIntervalStep: t.setIntervalStep = ({ degree, step }) => {
    const { intervalPattern } = stateScaleBuildParams.get();
    const degreeIndex = degree - 1;
    const newPattern = <t.intervalPattern>intervalPattern.map((currentStep, i) => i === degreeIndex ? step : currentStep);
    stateScaleBuildParams.setKey('intervalPattern', newPattern);
  };

  stateScaleBuildParams.listen(({ tonic, intervalPattern, modalShift }) => {
    storageService.insert('tonic', tonic);
    storageService.insert('intervalPattern', intervalPattern);
    storageService.insert('modalShift', modalShift);
  });
  stateDegreeRotation.listen(v => storageService.insert('degreeRotation', v));
  stateContextOffset.listen(v => storageService.insert('contextOffset', v));
  stateHiddenDegrees.listen(v => storageService.insert('hiddenDegrees', [...v]));
  stateFretboardStartNotes.listen(v => storageService.insert('startNotes', [...v]));
  stateActiveScalePresetId.listen(v => storageService.insert('activeScalePresetId', v));
  stateActiveFretboardPresetId.listen(v => storageService.insert('activeFretboardPresetId', v));

  return {
    stateScaleBuildParams,
    stateContextOffset,
    stateCurrentNoteChromaticIndex,
    stateResolvedScaleParams,
    stateUnshiftResolvedScaleParams,
    stateDegreeRotation,
    stateHiddenDegrees,
    stateFretboardStartNotes,
    stateFretboardLayout,
    offsetTonicShift,
    offsetModalShift,
    offsetDegreeRotation,
    offsetContext,
    switchDegreeVisibility,
    setFretboardStartNote,
    addFretboardString,
    removeFretboardString,
    setIntervalStep,
    stateActiveScalePresetId,
    stateActiveFretboardPresetId,
  };
};
