import { isNumber } from './numbers'

// firstOf returns the first element of a given array.
export function firstOf(array) {
	return array[0]
}

// lastOf returns the last element of a given array.
export function lastOf(array) {
	return array[array.length - 1]
}

// selectRandomly returns a random element out of a given array.
export function selectRandomly(array) {
	return array[Math.floor(Math.random() * array.length)]
}

// isNumberArray checks whether a variable is an array filled with numbers.
export function isNumberArray(array) {
	return Array.isArray(array) && array.every(value => isNumber(value))
}
