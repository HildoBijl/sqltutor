// isNumber checks if a given parameter is a number. Strings of numbers are allowed. Number-like objects are not.
export function isNumber(value) {
	// Check boundary cases.
	if (typeof value === 'string' && value.trim() === '')
		return false
	if (typeof value === 'object')
		return false

	// Go for the default comparison.
	return !isNaN(value)
}

// ensureNumber ensures that the given value is a number and throws an error otherwise. If it's a string number, like "3.14" then it turns it into a number. If positive is set to true, it requires it to be positive (or zero) too. If nonzero is set to true, it may not be zero.
export function ensureNumber(x, positive = false, nonzero = false) {
	if (!isNumber(x))
		throw new Error(`Input error: the given value must be a number, but received a parameter of type "${typeof x}" and value "${x}".`)
	x = parseFloat(x)
	if (positive && x < 0)
		throw new Error(`Input error: the given value was negative, but it must be positive. "${x}" was received.`)
	if (nonzero && x === 0)
		throw new Error(`Input error: the given value was zero, but this is not allowed.`)
	return x
}

// If the difference between two values is smaller than this, they are considered equal.
export const epsilon = 1e-12

// compareNumbers checks for two numbers if they are close enough (within margin epsilon, absolutely or relatively) to be considered equal.
export function compareNumbers(a, b) {
	if (Math.abs(a - b) < epsilon)
		return true
	if (Math.abs(b) > epsilon && Math.abs((a - b) / b) < epsilon)
		return true
	return false
}

// isInt checks if a given parameter is an integer. Strings of integers are allowed.
export function isInt(value) {
	// Check boundary cases.
	if (Math.abs(value) === Infinity)
		return true

	// Do the general check.
	return isNumber(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10))
}

// ensureInt ensures that the given value is an integer and throws an error otherwise. If it's a string number, like "3" then it turns it into an integer. If positive is set to true, it requires it to be positive (or zero) too. If nonzero is set to true, it may not be zero.
export function ensureInt(x, positive = false, nonzero = false) {
	// Is it potentially an integer?
	if (!isInt(x))
		throw new Error(`Input error: the given value must be an integer, but received a parameter of type "${typeof x}" and value "${x}".`)

	// Approve of infinity before further processing. (Given the usual checks, which we relegate to ensureNumber.)
	if (Math.abs(x) === Infinity)
		return ensureNumber(x, positive, nonzero)

	// Ensure it's in integer form.
	x = parseInt(x)

	// Do potential extra checks.
	if (positive && x < 0)
		throw new Error(`Input error: the given value was negative, but it must be positive. "${x}" was received.`)
	if (nonzero && x === 0)
		throw new Error(`Input error: the given value was zero, but this is not allowed.`)

	// Return the processed result.
	return x
}

// mod is a modulus function which (unlike its built-in counterpart) is guaranteed to give a number between 0 (inclusive) and n (exclusive).
export function mod(a, n) {
	const res = a % n
	return res < 0 ? res + n : res
}

// boundTo bounds the given number between the minimum (default 0) and maximum (default 1).
export function boundTo(val, min = 0, max = 1) {
	return Math.max(Math.min(val, max), min)
}
