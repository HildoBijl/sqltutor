import { isBasicObject, applyMapping, ensureConsistency } from './objects'

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
