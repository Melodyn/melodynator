import * as t from '../types';
import * as u from '../commonUtils';
import * as c from '.';

export const checkCanModeShift = (intervalPattern: t.intervalPattern): boolean => u.sum(intervalPattern) === c.OCTAVE_SIZE;
