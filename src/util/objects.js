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
