import { ensureInt } from './numbers'
import { isBasicObject, applyMapping, ensureConsistency } from './objects'

// noop is literally a function that does nothing (no-operation).
export function noop() { }

// repeat will repeat the given function the given number of times. The function is passed the index (0, 1, ..., (times-1)) as parameter. Using a negative times will throw an error. Returned is an array of all outcomes.
export function repeat(times, func) {
	times = ensureInt(times, true)
	return repeatWithMinMax(0, times - 1, func)
}

// repeatWithMinMax will repeat the given function with indices ranging from min to max (both inclusive). So repeatWithMinMax(3, 5, print) will print 3, 4 and 5. If min is larger than max, an error will be thrown. Returned is an array of all outcomes.
export function repeatWithMinMax(min, max, func) {
	// Process input.
	min = ensureInt(min)
	max = ensureInt(max)
	const times = max - min + 1
	if (times < 0)
		throw new Error(`Repeat error: needed to repeat a function a number of ${times} times, but this is impossible.`)
	if (times === 0)
		return

	// Iterate using an impromptu array.
	const arr = (new Array(times)).fill(0)
	return arr.map((_, index) => func(index + min))
}

// resolveFunctions takes an array/object (or even a function or basic parameter) and recursively checks if there are functions in it. If so, those functions are executed with the given parameters. Additionally, undefined values are filtered out.
export function resolveFunctions(param, ...args) {
	const resolve = (value) => {
		if (typeof value === 'function')
			return value(...args)
		if (Array.isArray(value) || isBasicObject(value))
			return applyMapping(value, resolve)
		return value
	}
	return ensureConsistency(resolve(param), param)
}

// resolveFunctionsShallow is like resolveFunctions but then does not iterate inside of an array/object.
export function resolveFunctionsShallow(param, ...args) {
	return (typeof param === 'function' ? param(...args) : param)
}
