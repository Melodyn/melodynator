import { AppError } from './constants/errors';
import type * as t from './types';

export const sum = (numbers: number[]): number => numbers.reduce((acc, num) => acc + num, 0);

type predicate<T> = (value: T, index: number, obj: T[]) => boolean;

export const find = <I>(arr: I[], callback: predicate<I>): I => {
  const result = arr.find(callback);
  if (result !== undefined) return result;
  throw new AppError('Отсутствует искомый элемент в массиве');
};

export const findIndex = <I>(arr: I[], callback: predicate<I>): number => {
  const result = arr.findIndex(callback);
  if (result !== -1) return result;
  throw new AppError('Отсутствует искомый элемент в массиве');
};

export const rotate = <I>(arr: I[], shift: number) => arr.map((_, i) => arr[(shift + i) % arr.length]);

export const qs = <E extends Element>(
  selector: t.querySelectorParam,
  on: Element | Document = document,
): E => {
  const element = on.querySelector<E>(selector);
  if (element !== null) return element;
  throw new Error(`Not found element by selector "${selector}"`);
};

export const qsa = <E extends Element>(
  selector: t.querySelectorParam,
  on: Element | Document = document,
): NodeListOf<E> => on.querySelectorAll<E>(selector);
