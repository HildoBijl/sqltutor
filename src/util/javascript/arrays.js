import { isNumber, ensureInt } from './numbers'

// firstOf returns the first element of a given array.
export function firstOf(array, offset = 0) {
	return array[0 + offset]
}

// lastOf returns the last element of a given array.
export function lastOf(array, offset = 0) {
	return array[array.length - 1 - offset]
}

// selectRandomly returns a random element out of a given array.
export function selectRandomly(array) {
	return array[Math.floor(Math.random() * array.length)]
}

// numberArray creates an array with numbers from start (inclusive) to end (inclusive). Both must be integers. So with 3 and 5 it's [3,4,5] and with 5 and 3 it's [5,4,3]. If only one parameter is given, then this is considered the end and the start is set to zero.
export function numberArray(p1, p2) {
	p1 = ensureInt(p1)
	p2 = ensureInt(p2)
	let start, end
	if (p2 === undefined) {
		start = 0
		end = p1
	} else {
		start = p1
		end = p2
	}
	if (start <= end)
		return [...Array(end - start + 1).keys()].map(x => x + start)
	return [...Array(start - end + 1).keys()].map(x => start - x)
}

// isNumberArray checks whether a variable is an array filled with numbers.
export function isNumberArray(array) {
	return Array.isArray(array) && array.every(value => isNumber(value))
}

// arrayFind is like Array.find or Array.findIndex but then instead of giving the element that returns true, it returns an object { index, element, value } where value is the first truthy value that was returned. If none are found, it returns undefined.
export function arrayFind(array, func) {
	for (let index = 0; index < array.length; index++) {
		const element = array[index]
		const value = func(element, index, array)
		if (value)
			return { index, element, value }
	}
	return undefined
}

// findOptimumIndex takes an array of objects, like [{x: 3}, {x: 2}, {x: 5}]. It also takes a comparison function (a, b) => [bool], indicating whether a is better than b. For example, to find the object with the highest x, use "(a, b) => x.a > x.b". It then returns the index of the object with the optimal value. Returns -1 on an empty array.
export function findOptimumIndex(array, isBetter) {
	return array.reduce((bestIndex, element, index) => bestIndex === -1 || isBetter(element, array[bestIndex]) ? index : bestIndex, -1)
}

// findOptimum works identically to findOptimumIndex but returns the optimal object itself. Returns undefined on an empty array.
export function findOptimum(array, isBetter) {
	return array[findOptimumIndex(array, isBetter)]
}
