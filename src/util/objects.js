// isObject checks if a variable is an object.
export function isObject(obj) {
	return typeof obj === 'object' && obj !== null
}

// isBasicObject checks if a variable is a simple object made through {...}. So not one through a constructor with various methods.
export function isBasicObject(obj) {
	return isObject(obj) && obj.constructor === Object
}

// isEmptyObject checks if the object equals {}.
export function isEmptyObject(obj) {
	return isBasicObject(obj) && Object.keys(obj).length === 0
}

// keysToObject takes a list of array keys and turns it into an object with those keys, where the provided function (key, index) => value provides the values.
export function keysToObject(keys, func) {
	const result = {}
	keys.forEach((key, index) => {
		result[key] = func(key, index)
	})
	return result
}
