import isEqual from 'lodash/isEqual';

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

// Take two objects (or arrays) and maintain reference equality between them as much as possible, also recursively to sub-parameters if needed.
export function ensureConsistency<T>(next: T, prev?: T): T {
  // Handle basic cases.
  if (prev === undefined)
    return next;
  if (isEqual(next, prev))
    return prev;

  // For arrays, maintain references in elements.
  if (Array.isArray(next) && Array.isArray(prev))
    return next.map((item, i) => ensureConsistency(item, prev[i])) as T;

  // For objects, maintain references in parameters.
  if (isPlainObject(next) && isPlainObject(prev))
    return applyMapping(next as Record<string, any>, (value, key) => ensureConsistency(value, (prev as Record<string, any>)[key])) as T;

  // For anything else (primitive, class instantiations, etcetera), return the new value.
  return next;
}
