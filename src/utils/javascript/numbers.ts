// Ensure that the given number is positive. Zero is usually allowed, unless preventZero is set to true.
export function ensurePositive(value: number, preventZero = false): number {
	if (value < 0)
		throw new Error(`Input error: value must be positive, got ${value}.`);
	if (preventZero && value === 0)
		throw new Error(`Input error: value must not be zero.`);
	return value;
}

// If the difference between two values is smaller than this, they are considered equal.
export const epsilon = 1e-12;

// Check whether two numbers are close enough (within margin epsilon, absolutely or relatively) to be considered equal.
export function compareNumbers(a: number, b: number): boolean {
	return Math.abs(a - b) < epsilon || (Math.abs(b) > epsilon && Math.abs((a - b) / b) < epsilon);
}

// Check if a given number is an integer.
export function isInt(value: number): boolean {
	return !Number.isFinite(value) || Number.isInteger(value);
}

// Ensure that the given number is an integer. Optionally, it can also be required to be positive (set requirePositive to true) which does allow zeroes, unless preventZero is set to true too.
export function ensureInt(value: number, requirePositive = false, preventZero = false): number {
	if (!isInt(value))
		throw new Error(`Input error: expected integer, got ${value}.`);
	return requirePositive ? ensurePositive(value, preventZero) : value;
}

// Extend the Javascript modulus function to guarantee a result between 0 (inclusive) and n (exclusive).
export function mod(a: number, n: number): number {
	return ((a % n) + n) % n;
}

// Bound/clamp the given number between the minimum (default 0) and maximum (default 1).
export function clamp(value: number, min = 0, max = 1): number {
	return Math.max(Math.min(value, max), min);
}

// Generate a random integer between min and max (inclusive).
export function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
