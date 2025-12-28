import { AppError } from "./constants/errors";

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
