import { ensureInt } from './numbers';

// Return the first element of a given array.
export function firstOf<T>(array: readonly T[], offset = 0): T | undefined {
	return array[offset];
}

// Return the last element of a given array.
export function lastOf<T>(array: readonly T[], offset = 0): T | undefined {
	return array[array.length - 1 - offset];
}

// Return a random element out of a given array.
export function selectRandomly<T>(array: readonly T[]): T | undefined {
	return array.length ? array[Math.floor(Math.random() * array.length)] : undefined;
}

// Create an array with numbers from start (inclusive) to end (inclusive). Both must be integers. So with 3 and 5 it's [3, 4, 5] and with 5 and 3 it's [5, 4, 3]. If only one parameter is given, then this is considered the end and the start is set to zero.
export function numberArray(start: number, end?: number): number[] {
	// Process the input.
	ensureInt(start);
	if (end === undefined) {
		end = start;
		start = 0;
	} else {
		ensureInt(end);
	}

	// Generate the array.
	const length = Math.abs(end - start) + 1;
	return Array.from({ length }, (_, i) => start <= end ? start + i : start - i);
}

// Find an element in an array satisfying a given condition (function) and return all info about this element in an object { index, element, value }. The value is the first truthy value that was returned. If no matching element is found, undefined is returned.
export function arrayFind<T, U>(
	array: readonly T[],
	func: (element: T, index: number, array: readonly T[]) => U
): { index: number; element: T; value: U } | undefined {
	for (let index = 0; index < array.length; index++) {
		const element = array[index];
		const value = func(element, index, array);
		if (value)
			return { index, element, value };
	}
	return undefined;
}

// findOptimumIndex takes an array of objects, like [{x: 3}, {x: 2}, {x: 5}]. It also takes a comparison function (a, b) => [bool], indicating whether a is better than b. For example, to find the object with the highest x, use "(a, b) => x.a > x.b". It then returns the index of the object with the optimal value. Returns -1 on an empty array.
export function findOptimumIndex<T>(
	array: readonly T[],
	isBetter: (a: T, b: T) => boolean
): number {
	// On an empty array, return -1.
	if (array.length === 0)
		return -1;

	// Find the best item.
	let bestIndex = 0;
	for (let i = 1; i < array.length; i++) {
		if (isBetter(array[i], array[bestIndex]))
			bestIndex = i;
	}
	return bestIndex;
}

// findOptimum works identically to findOptimumIndex but returns the optimal object itself. Returns undefined on an empty array.
export function findOptimum<T>(
	array: readonly T[],
	isBetter: (a: T, b: T) => boolean
): T | undefined {
	const index = findOptimumIndex(array, isBetter);
	return index === -1 ? undefined : array[index];
}

// Shuffle an array randomly (Fisher-Yates algorithm). Returns a new array.
export function shuffleArray<T>(array: readonly T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}
