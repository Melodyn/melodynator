import { AppError } from './constants/errors';
import { DEFAULT_SAVED_VALUES, VALID_THEMES, VALID_LOCALES } from './constants';
import type * as t from './types';

export const sum = (numbers: number[]): number => numbers.reduce((acc, num) => acc + num, 0);

type predicate<T> = (value: T, index: number, obj: T[]) => boolean;
type querySelectorParam = Parameters<typeof document.querySelector>[0];

export const find = <I>(arr: I[], callback: predicate<I>): I => {
  const result = arr.find(callback);
  if (result !== undefined) {
    return result;
  }
  throw new AppError('Отсутствует искомый элемент в массиве');
};

export const findIndex = <I>(arr: I[], callback: predicate<I>): number => {
  const result = arr.findIndex(callback);
  if (result !== -1) {
    return result;
  }
  throw new AppError('Отсутствует искомый элемент в массиве');
};

export const rotate = <I>(arr: I[], shift: number) => arr.map((_, i) => arr[(shift + i) % arr.length]);

export const qs = <E extends Element>(
  selector: querySelectorParam,
  on: Element | Document = document,
): E => {
  const element = on.querySelector<E>(selector);
  if (element !== null) {
    return element;
  }
  throw new Error(`Not found element by selector "${selector}"`);
};

export const qsa = <E extends Element>(
  selector: querySelectorParam,
  on: Element | Document = document,
): NodeListOf<E> => on.querySelectorAll<E>(selector);

const findValid = <T>(valid: T[], value: unknown): T | null => {
  const found = valid.find(v => v === value);
  return found !== undefined ? found : null;
};

export const getSavedValues = (): t.savedValues => {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_SAVED_VALUES;
  }

  const storedTheme = localStorage.getItem('theme');
  const storedLocale = localStorage.getItem('locale');
  const nav = navigator.language;
  const browserLocale = nav ? nav.slice(0, 2) : '';

  const theme = findValid(VALID_THEMES, storedTheme) || DEFAULT_SAVED_VALUES.theme;
  const locale = findValid(VALID_LOCALES, storedLocale) || findValid(VALID_LOCALES, browserLocale) || DEFAULT_SAVED_VALUES.locale;

  return { theme, locale };
};
