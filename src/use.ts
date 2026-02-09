// // отображение

// const scaleToMap: t.scaleToMap = (scale) => scale
//   .reduce((m, n) => {
//     const { pitchClass } = n;
//     if (!m.has(pitchClass)) {
//       m.set(pitchClass, n);
//     }
//     return m;
//   }, new Map());


// export const mapScaleToLayout: t.mapScaleToLayout = ({ startNotes, scaleMap }) => startNotes.map(({ note, octave }) => {
//   const scaleLayout: t.scaleLayout = [];
//   const startNoteNaturalParams = getNaturalNoteParams(note);
//   const startNoteOffsetPC = calcOffsetPC(note);
//   const startNotePC = startNoteNaturalParams.naturalPitchClass + startNoteOffsetPC + c.OCTAVE_SIZE;
//   let currentOctave = octave;

//   for (let semitoneIndex = 0; semitoneIndex <= c.OCTAVE_SIZE; semitoneIndex += 1) {
//     const currentPC = (startNotePC + semitoneIndex) % c.OCTAVE_SIZE;
//     const scaleNoteParams = scaleMap.get(currentPC);
//     const currentNote = scaleNoteParams === undefined ? '' : scaleNoteParams.note;
//     currentOctave = currentOctave + Number(semitoneIndex > 0 && currentPC === 0);

//     scaleLayout.push({ note: currentNote, octave: currentOctave });
//   }

//   return scaleLayout;
// });

// // использование

// const tonic: t.noteName = 'B♭';
// const scaleBuildParams: t.scaleBuildParams = {
//   tonic,
//   intervalPattern: [2, 2, 1, 2, 2, 2, 1],
//   modalShift: 1,
// };

// const resolvedScaleParams = resolveScale(scaleBuildParams);
// const resolvedDegreeRotatedScaleParams = applyDegreeRotation(resolvedScaleParams, 0);
// const harmonicTransformedScaleParams = applyHarmonicTransform(resolvedFunctionalShiftedScaleParams, 0);

// console.log([
//   `resultTonic: '${harmonicTransformedScaleParams.scale[0].note}', // итоговая тоника`,
//   `result: [ // итоговые ноты`,
//   removeDegrees(harmonicTransformedScaleParams.scale, [4, 7, 8]).map(n => JSON.stringify(n)).join(',\n') + ',',
//   '],'
// ].join('\n'));

// const result = {
//   tonic: 'A',
//   intervalPattern: [2, 1, 2, 2, 1, 2, 2], // интервальная схема по полутонам
//   modalShift: 2, // смещение по ступеням от 0 до 7
//   degreeRotation: 3, // смещение по ступеням от 0 до 7
//   harmonicIntervalSize: 5, // смещение по полутонам от 0 до 11
//   hiddenDegrees: [4, 7, 8], // номера ступеней, скрытых в UI
//   resultTonic: 'F', // итоговая тоника
//   result: [ // итоговые ноты
//     { "note": "F", "degree": 1, "pitchClass": 5 },
//     { "note": "G♭", "degree": 2, "pitchClass": 6 },
//     { "note": "A♭", "degree": 3, "pitchClass": 8 },
//     { "note": "C", "degree": 5, "pitchClass": 0 },
//     { "note": "D♭", "degree": 6, "pitchClass": 1 },
//   ],
// }

// const scaleMap = scaleToMap(harmonicTransformedScaleParams.scale);
// console.log(
//   mapScaleToLayout({ scaleMap, startNotes: [{ note: tonic, octave: 4 }], name: '' })
//     .map((scaleLayout) => scaleLayout.map(({ note }) => note.length > 0 ? `${note.length === 1 ? ` ${note} ` : ` ${note}`}` : '   ').join(' | '))
//     .join('\n')
// );
// console.log(
//   mapScaleToLayout({ scaleMap, startNotes: [{ note: tonic, octave: 4 }], name: '' })
//     .map((scaleLayout) => scaleLayout.map(({ note }) => note).filter(n => n.length > 0).join(' '))
//     .join('\n')
// );

// console.log(
//   mapScaleToLayout({
//     scaleMap,
//     startNotes: [
//       { note: 'E', octave: 4 },
//       { note: 'B', octave: 3 },
//       { note: 'G', octave: 3 },
//       { note: 'D', octave: 3 },
//       { note: 'A', octave: 2 },
//       { note: 'E', octave: 2 },
//     ],
//     name: 'Гитара',
//   })
//     .map((scaleLayout) => scaleLayout.map(({ note }) => note.length > 0 ? `${note.length === 1 ? ` ${note} ` : ` ${note}`}` : '   ').join(' | '))
//     .join('\n')
// );
// console.log('-'.repeat(61));
// console.log(
//   mapScaleToLayout({
//     scaleMap,
//     startNotes: [
//       { note: 'A', octave: 4 },
//       { note: 'E', octave: 4 },
//       { note: 'C', octave: 4 },
//       { note: 'G', octave: 4 },
//     ],
//     name: 'Укулеле',
//   })
//     .map((scaleLayout) => scaleLayout.map(({ note }) => note.length > 0 ? `${note.length === 1 ? ` ${note} ` : ` ${note}`}` : '   ').join(' | '))
//     .join('\n')
// );
