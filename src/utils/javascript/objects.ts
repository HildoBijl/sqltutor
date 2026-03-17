// Check if a variable is a plain object { ... }.
export function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;
}

// Take an array of keys like ['a', 'b'] and apply a function func(key, index, resultObject) for each of these keys. The result is stored in an object like { a: func('a', 0), b: func('b', 1) }.
export function keysToObject<K extends PropertyKey, V>(
  keys: readonly K[],
  func: (key: K, index: number, result: Record<K, V>) => V
): Record<K, V> {
  const result = {} as Record<K, V>;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    result[key] = func(key, i, result);
  }
  return result;
}

// Take an object with multiple parameters, like { a: 2, b: 3 }, and apply a function like (x, key) => (...) to each parameter. It returns a new object (the old one is unchanged) with the result.
export function applyMapping<T extends Record<string, any>, U>(
  obj: T,
  func: (value: T[keyof T], key: keyof T, result: Record<keyof T, U>) => U
): Record<keyof T, U> {
  const keys = Object.keys(obj) as (keyof T)[];
  return keysToObject(keys, (key, _, result) => func(obj[key], key, result));
}

// Deep equality check between two values.
export function deepEquals<T>(a: T, b: T): boolean
export function deepEquals(a: unknown, b: unknown): boolean {
	// Quick check for simple non-object cases. Returns boolean when conclusive, otherwise undefined.
	const quickCheck = (x: any, y: any): boolean | undefined => {
		// Fast path: same reference (also covers primitives).
		if (x === y) return true

		// Handle NaN (NaN !== NaN, but considered equal here).
		if (typeof x === 'number' && typeof y === 'number' && Number.isNaN(x) && Number.isNaN(y)) return true

		// Compare types quickly.
		const typeX = typeof x
		const typeY = typeof y
		if (typeX !== typeY) return false

		// Handle primitives (string, number (non-NaN), boolean, symbol, undefined).
		if (x === null || y === null) return false
		if (typeX !== 'object') return x === y

		// Not conclusive for objects.
		return undefined
	}

	// Run the basic check. If it's conclusive, return this. This may save us from having to set up a weak set and running recursion.
	const quickCheckResult = quickCheck(a, b)
	if (quickCheckResult !== undefined) return quickCheckResult

	// Do a recursive traversal with cycle detection. Use a WeakMap<object, WeakSet<object>> to remember visited (a -> set of b's we've compared with).
	const visited = new WeakMap<object, WeakSet<object>>()
	const innerEquals = (x: any, y: any): boolean => {
		// Run the basic check. If it's conclusive, return this.
		const quickCheckResult = quickCheck(x, y)
		if (quickCheckResult !== undefined) return quickCheckResult

		// Now we know both are objects (non-null). Check special-case Dates and RegExps.
		if (x instanceof Date && y instanceof Date) return x.getTime() === y.getTime()
		if (x instanceof RegExp && y instanceof RegExp) return x.source === y.source && x.flags === y.flags

		// Cycle detection: have we already compared this pair?
		let mapped = visited.get(x)
		if (mapped && mapped.has(y)) return true
		if (!mapped) {
			mapped = new WeakSet()
			visited.set(x, mapped)
		}
		mapped.add(y)

		// Arrays: compare length, then compare each element.
		if (Array.isArray(x) && Array.isArray(y)) {
			if (x.length !== y.length) return false
			for (let i = 0; i < x.length; i++) {
				if (!innerEquals(x[i], y[i])) return false
			}
			return true
		}

		// If one is an array and the other is not -> not equal.
		if (Array.isArray(x) !== Array.isArray(y)) return false

		// Make sure prototypes match. This avoids considering objects of different classes equal.
		if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) return false

		// Plain enumerable own-property keys check.
		const xKeys = Object.keys(x)
		const yKeys = Object.keys(y)
		if (xKeys.length !== yKeys.length) return false

		// Use a Set for y keys for O(1) lookups.
		const yKeySet = new Set(yKeys)
		for (const k of xKeys) if (!yKeySet.has(k)) return false

		// Deep-compare each property.
		for (const k of xKeys) if (!innerEquals(x[k], y[k])) return false

		// No reason found for inequality.
		return true
	}

	// Recursively call the checking function.
	return innerEquals(a, b)
}

// Try to preserve references from oldValue where possible. If newValue deepEquals oldValue, return oldValue (keep reference). If both are arrays or plain objects, recursively attempt to preserve child references. Otherwise return newValue.
export function preserveRefs<T = unknown>(newValue: T, oldValue?: T): T {
	if (oldValue === undefined) return newValue;

	// If deeply equal, reuse old reference.
	if (deepEquals(newValue, oldValue)) return oldValue

	// If both are arrays or both are plain objects, recurse into children.
	if (Array.isArray(newValue) && Array.isArray(oldValue)) return (applyMapping(newValue as any[], (v, i) => preserveRefs(v, (oldValue as any[])[i])) as unknown) as T
	if (isPlainObject(newValue) && isPlainObject(oldValue)) return (applyMapping(newValue as Record<string, any>, (v, k) => preserveRefs(v, (oldValue as any)[k])) as unknown) as T

	// Fallback: cannot reconcile deeper; return new value.
	return newValue
}

// Process the options given to a function or component, filling in default values. Return a copied object.
export function processOptions<T extends Record<string, any>>(givenOptions: Partial<T> = {}, defaultOptions: T): T {
  // Check the input.
  if (!isPlainObject(givenOptions))
    throw new Error(`Invalid options: expected object but received type "${typeof givenOptions}".`);
  if (!isPlainObject(defaultOptions))
    throw new Error("Invalid defaultOptions: no or invalid object given.");

  // Start with defaults and add given options.
  const result: T = { ...defaultOptions };
  for (const key in givenOptions) {
    if (!Object.prototype.hasOwnProperty.call(defaultOptions, key))
      throw new Error(`Invalid option: "${key}" is not a recognized option.`);
    const value = givenOptions[key];
    if (value !== undefined)
      result[key] = value;
  }
  return result;
}

// Filter out properties from a given set of options to only be left with the ones in the second set of options.
export function filterOptions<T extends Record<string, any>, U extends Record<string, any>>(givenOptions: T, defaultOptions: U): Partial<U> {
  const keys = Object.keys(defaultOptions) as (keyof U)[];
  const result = {} as Partial<U>;
  for (const key of keys) {
    if (key in givenOptions)
      result[key] = givenOptions[key as keyof T] as any;
  }
  return result;
}
