import * as n from 'nanostores';
import * as t from '../types';
import * as c from '../constants';
import * as cu from '../commonUtils';
import * as mu from '../core';
import * as d from '../constants/defaults';
import { StorageService } from './StorageService';

const CHROMATIC_SCALES_BY_ACCIDENTAL: Record<t.flatSymbol | t.sharpSymbol, t.chromaticScale> = {
  [c.SHARP_SYMBOL]: mu.buildChromaticScale(c.SHARP_SYMBOL),
  [c.FLAT_SYMBOL]: mu.buildChromaticScale(c.FLAT_SYMBOL),
};

const getScaleAccidental = (scale: t.scale): t.flatSymbol | t.sharpSymbol => {
  const accidentalNoteParams = scale.find(({ note }) => note.length > 1);
  if (!accidentalNoteParams) {
    return c.SHARP_SYMBOL;
  }
  return accidentalNoteParams.note[1] === c.FLAT_SYMBOL ? c.FLAT_SYMBOL : c.SHARP_SYMBOL;
};

export const createStore = (saved: t.savedValues, storageService: StorageService, stateLocale: n.Atom<t.locale>): t.store => {
  const stateHiddenDegrees = n.atom<Set<t.degree>>(new Set(saved.hiddenDegrees));
  const stateFretboardStartNotes = n.atom<t.fretboardStartNoteParams[]>(saved.startNotes);
  const stateKeyboardAudioStartOctave = n.atom<number>(saved.keyboardAudioStartOctave);
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
    [stateScaleBuildParams, stateDegreeRotation, stateContextOffset],
    (scaleBuildParams, degreeRotation, contextOffset) => {
      const resolvedScaleParams = mu.resolveScale(scaleBuildParams);
      const resolvedContextScaleParams = mu.applyContextTransform(resolvedScaleParams, contextOffset);
      const resolvedDegreeRotatedScaleParams = mu.applyDegreeRotation(resolvedContextScaleParams, degreeRotation);
      return resolvedDegreeRotatedScaleParams;
    },
  );
  const stateChromaticScale = n.computed(
    stateResolvedScaleParams,
    (resolvedScaleParams) => {
      const accidental = getScaleAccidental(resolvedScaleParams.scale);
      return CHROMATIC_SCALES_BY_ACCIDENTAL[accidental];
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
  const stateFretboardAudioLayout = n.computed(
    [stateFretboardStartNotes, stateChromaticScale],
    (startNotes, chromaticScale): t.fretboardAudioLayout => {
      const chromaticScaleMap = new Map(chromaticScale.map((noteParams) => [
        noteParams.pitchClass,
        { ...noteParams, degree: 0 },
      ]));
      return mu.mapScaleToLayout({ scaleMap: chromaticScaleMap, startNotes })
        .map((layout) => layout.map(({ note, pitchClass, octave }) => ({
          note: <t.noteName>note,
          pitchClass,
          octave,
        })));
    },
  );
  const stateKeyboardAudioLayout = n.computed(
    [stateKeyboardAudioStartOctave, stateChromaticScale],
    (startOctave, chromaticScale): t.chromaticNoteParams[] => {
      return c.allKeyboardAudioSemitoneIndexes.map((index) => {
        const pitchClass = index % c.OCTAVE_SIZE;
        const octaveOffset = Math.floor(index / c.OCTAVE_SIZE);
        return {
          note: chromaticScale[pitchClass].note,
          pitchClass,
          octave: startOctave + octaveOffset,
        };
      });
    },
  );

  const resetActiveScalePresetId = (): void => {
    stateActiveScalePresetId.set(c.NO_ACTIVE_PRESET_ID);
  };
  const resetActiveFretboardPresetId = (): void => {
    stateActiveFretboardPresetId.set(c.NO_ACTIVE_PRESET_ID);
  };
  const offsetKeyboardAudioStartOctave = (offset: number) => {
    const currentOctave = stateKeyboardAudioStartOctave.get();
    const nextOctave = Math.min(c.MAX_KEYBOARD_AUDIO_START_OCTAVE, Math.max(c.MIN_KEYBOARD_AUDIO_START_OCTAVE, currentOctave + offset));
    stateKeyboardAudioStartOctave.set(nextOctave);
  };

  const offsetTonicShift: t.offsetScaleParam = (offset) => {
    const currentTonicIndex = stateCurrentNoteChromaticIndex.get();
    const newTonicIndex = (currentTonicIndex + c.allNotesNames.length + offset) % c.allNotesNames.length;
    const newTonic = c.allNotesNames[newTonicIndex];
    stateScaleBuildParams.setKey('tonic', newTonic);
    resetActiveScalePresetId();
  };

  const offsetModalShift: t.offsetScaleParam = (offset) => {
    const { intervalPattern, modalShift: currentShift } = stateScaleBuildParams.get();
    const degreeCount = intervalPattern.length;
    const newShift = (currentShift + offset + degreeCount) % degreeCount;
    stateScaleBuildParams.setKey('modalShift', newShift);
    resetActiveScalePresetId();
  };

  const offsetDegreeRotation: t.offsetScaleParam = (offset) => {
    const { intervalPattern } = stateScaleBuildParams.get();
    const currentRotation = stateDegreeRotation.get();
    const degreeCount = intervalPattern.length;
    const newRotation = (currentRotation + offset + degreeCount) % degreeCount;
    stateDegreeRotation.set(newRotation);
    resetActiveScalePresetId();
  };

  const offsetContext: t.offsetScaleParam = (offset) => {
    const currentShift = stateContextOffset.get();
    const newContextOffset = <t.contextOffset>((currentShift + c.OCTAVE_SIZE + offset) % c.OCTAVE_SIZE);
    stateContextOffset.set(newContextOffset);
    resetActiveScalePresetId();
  };

  const switchDegreeVisibility: t.switchDegreeVisibility = (degree) => {
    const hiddenDegrees = new Set(stateHiddenDegrees.get());
    if (hiddenDegrees.has(degree)) {
      hiddenDegrees.delete(degree);
    } else {
      hiddenDegrees.add(degree);
    }
    stateHiddenDegrees.set(hiddenDegrees);
    resetActiveScalePresetId();
  };

  const setFretboardStartNote: t.setFretboardStartNote = (startNoteParams) => {
    const { index: changeStringIndex, ...newStringParams } = startNoteParams;
    const currentStartNotes = stateFretboardStartNotes.get();
    const newStartNotes = currentStartNotes.map(
      (startNote: t.fretboardStartNoteParams, i: number) => i === changeStringIndex ? newStringParams : startNote,
    );
    stateFretboardStartNotes.set(newStartNotes);
    resetActiveFretboardPresetId();
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
    const newNote = stateChromaticScale.get()[newPitchClass].note;
    const newOctave = newPitchClass > lastPitchClass ? Math.max(0, lastStartNote.octave - 1) : lastStartNote.octave;
    stateFretboardStartNotes.set([...currentStartNotes, { note: newNote, octave: newOctave }]);
    resetActiveFretboardPresetId();
  };

  const removeFretboardString: t.removeFretboardString = (index) => {
    const currentStartNotes = stateFretboardStartNotes.get();
    if (currentStartNotes.length <= c.MIN_FRETBOARD_STRINGS) {
      return;
    }
    const newStartNotes = currentStartNotes.filter((_, i) => i !== index);
    stateFretboardStartNotes.set(newStartNotes);
    resetActiveFretboardPresetId();
  };

  const setIntervalStep: t.setIntervalStep = ({ degree, step }) => {
    const { intervalPattern } = stateScaleBuildParams.get();
    const degreeIndex = degree - 1;
    const newPattern = <t.intervalPattern>intervalPattern.map((currentStep, i) => i === degreeIndex ? step : currentStep);
    stateScaleBuildParams.setKey('intervalPattern', newPattern);
    resetActiveScalePresetId();
  };

  const applyScalePreset: t.applyScalePreset = (presetScaleId) => {
    const presetScale = cu.find(d.SCALE_PRESETS[stateLocale.get()], ({ id }) => id === presetScaleId);

    stateScaleBuildParams.set({
      tonic: presetScale.tonic,
      intervalPattern: presetScale.intervalPattern,
      modalShift: presetScale.modalShift,
    });
    stateContextOffset.set(<t.contextOffset>presetScale.contextOffset);
    stateDegreeRotation.set(presetScale.degreeRotation);
    stateHiddenDegrees.set(new Set(presetScale.hiddenDegrees));
    stateActiveScalePresetId.set(presetScale.id);
  };

  const offsetScalePreset: t.offsetScalePreset = (offset) => {
    const locale = stateLocale.get();
    const presetScales = d.SCALE_PRESETS[locale];
    const activeScalePresetId = stateActiveScalePresetId.get();
    if (activeScalePresetId === c.NO_ACTIVE_PRESET_ID) {
      applyScalePreset(d.DEFAULT_SCALE_PRESET_ID);
      return;
    }
    const currentPresetIndex = cu.findIndex(presetScales, ({ id }) => id === activeScalePresetId);
    const nextPresetIndex = (currentPresetIndex + presetScales.length + offset) % presetScales.length;
    const nextPreset = presetScales[nextPresetIndex];
    applyScalePreset(nextPreset.id);
  };

  const applyFretboardPreset: t.applyFretboardPreset = (presetInstrumentId) => {
    const presetInstrument = cu.find(d.FRETBOARD_PRESETS[stateLocale.get()], ({ id }) => id === presetInstrumentId);
    const startNotes = presetInstrument.startNotes.map((startNote) => ({ ...startNote }));
    stateFretboardStartNotes.set(startNotes);
    stateActiveFretboardPresetId.set(presetInstrument.id);
  };

  const offsetFretboardPreset: t.offsetFretboardPreset = (offset) => {
    const locale = stateLocale.get();
    const presetInstruments = d.FRETBOARD_PRESETS[locale];
    const activeFretboardPresetId = stateActiveFretboardPresetId.get();
    if (activeFretboardPresetId === c.NO_ACTIVE_PRESET_ID) {
      applyFretboardPreset(d.DEFAULT_FRETBOARD_PRESET_ID);
      return;
    }
    const currentPresetIndex = cu.findIndex(presetInstruments, ({ id }) => id === activeFretboardPresetId);
    const nextPresetIndex = (currentPresetIndex + presetInstruments.length + offset) % presetInstruments.length;
    const nextPreset = presetInstruments[nextPresetIndex];
    applyFretboardPreset(nextPreset.id);
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
  stateKeyboardAudioStartOctave.listen(v => storageService.insert('keyboardAudioStartOctave', v));
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
    stateChromaticScale,
    stateFretboardLayout,
    stateFretboardAudioLayout,
    stateKeyboardAudioStartOctave,
    offsetKeyboardAudioStartOctave,
    stateKeyboardAudioLayout,
    offsetTonicShift,
    offsetModalShift,
    offsetDegreeRotation,
    offsetContext,
    switchDegreeVisibility,
    setFretboardStartNote,
    addFretboardString,
    removeFretboardString,
    setIntervalStep,
    applyScalePreset,
    applyFretboardPreset,
    offsetScalePreset,
    offsetFretboardPreset,
    stateActiveScalePresetId,
    stateActiveFretboardPresetId,
  };
};
