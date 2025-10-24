import { ensureInt } from './numbers';

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
  if (start > end)
    throw new Error(`Invalid range: min (${start}) cannot be greater than max (${end}).`);

	// Set up the array.
  const times = end - start + 1;
  return Array.from({ length: times }, (_, i) => func(start + i));
}
