import { ensureInt } from './numbers';
import { isPlainObject, applyMapping, ensureConsistency } from './objects';

// noop is literally a function that does nothing (no-operation).
export function noop(): void { }

// Call the given function the given number of times. The function is passed the index (0, 1, ..., (times-1)) as parameter. An array with all outcomes is returned.
export function repeat<T>(times: number, func: (index: number) => T): T[] {
  const n = ensureInt(times, true);
  return repeatWithMinMax(0, n - 1, func);
}

// Repeat the given function with indices ranging from min to max (both inclusive). So repeatWithMinMax(3, 5, print) will print 3, 4 and 5. max has to be at least as large as min. An array with all outcomes is returned.
export function repeatWithMinMax<T>(min: number, max: number, func: (index: number) => T): T[] {
  // Process the input.
  const start = ensureInt(min);
  const end = ensureInt(max);
  const times = end - start + 1;
  if (times < 0)
    throw new Error(`Invalid range: min (${start}) cannot be greater than max (${end}) plus one.`);

  // Set up the array.
  return Array.from({ length: times }, (_, i) => func(start + i));
}

// Take an array/object and recursively call all functions with the given arguments, replacing them within the array/object by the returned valued.
export function resolveFunctions<T, Args extends any[] = any[]>(param: T, ...args: Args): { [K in keyof T]: T[K] extends (...args: any) => infer R ? R : T[K] } {
  const resolve = (value: any): any => {
    if (typeof value === 'function')
      return value(...args);
    if (Array.isArray(value))
      return value.map(resolve);
    if (isPlainObject(value))
      return applyMapping(value, resolve);
    return value;
  };
  return ensureConsistency(resolve(param), param);
}
