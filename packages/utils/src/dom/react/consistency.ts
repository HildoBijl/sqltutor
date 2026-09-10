import { type Ref, type RefObject, type RefCallback, useRef, useCallback } from 'react';

import { isPlainObject } from '@step-wise/js-utils';

// Preserve equal container references without attempting to inspect opaque
// values such as DOM elements. The shared preserveRefs intentionally rejects
// unsupported class instances, while this React helper must accept them as
// stable leaves in dependency arrays and option objects.
function preserveConsistentRefs<T>(value: T, previous: T): T {
	if (Object.is(value, previous))
		return previous;

	if (Array.isArray(value) && Array.isArray(previous)) {
		const next = value.map((item, index) => preserveConsistentRefs(item, previous[index]));
		return (next.length === previous.length && next.every((item, index) => Object.is(item, previous[index]))
			? previous
			: next) as T;
	}

	if (isPlainObject(value) && isPlainObject(previous)) {
		const keys = Object.keys(value);
		const previousKeys = Object.keys(previous);
		const next = Object.fromEntries(keys.map(key => [key, preserveConsistentRefs(value[key], previous[key])]));
		return (keys.length === previousKeys.length
			&& keys.every(key => Object.prototype.hasOwnProperty.call(previous, key) && Object.is(next[key], previous[key]))
			? previous
			: next) as T;
	}

	return value;
}

// Get a ref object whose "current" parameter always equals the given value.
export function useLatest<T>(value: T, initialValue: T = value) {
	const ref = useRef<T>(initialValue);
	ref.current = value;
	return ref;
}

// Take a possibly non-existing external ref object and deal with it accordingly. This function gives a tuple [mergedRef, internalRef], where mergedRef should be placed inside the component, and internalRef.current can be used to then access it.
export function useEnsureRef<T>(externalRef?: Ref<T>): [RefCallback<T>, RefObject<T | null>] {
	const internalRef = useRef<T>(null);
	const mergedRef = useCallback((node: T | null) => {
		internalRef.current = node;
		if (typeof externalRef === 'function')
			externalRef(node);
		else if (externalRef && 'current' in externalRef)
			externalRef.current = node;
	}, [externalRef]);
	return [mergedRef, internalRef];
}

// Keep references in the given value maintained as much as possible. This is also extended to sub-parameters.
export function useConsistentValue<T>(value: T): T {
	const ref = useRef<T | undefined>(undefined);
	ref.current = ref.current === undefined ? value : preserveConsistentRefs(value, ref.current);
	return ref.current;
}

// Check (through a custom equality function) if a value is the same as before. If so, keep the old value.
export function useEqualRefOnEquality<T>(
	value: T,
	equalityCheck: (a: T, b: T) => boolean = (a, b) => !!a && typeof (a as any).equals === 'function' && (a as any).equals(b),
): T {
	const ref = useRef<T>(undefined);
	if (value !== ref.current && (ref.current === undefined || !equalityCheck(value, ref.current)))
		ref.current = value;
	return ref.current as T;
}

// Get a callback function with constant reference. (Optionally, add dependencies, upon which a change will cause a new function reference.)
export function useStableCallback<T extends (...args: any[]) => any>(
	func: T,
	dependencies?: unknown[],
): T {
	const stableDependencies = useConsistentValue(dependencies ?? []);
	const funcRef = useLatest(func);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	return useCallback(((...args: Parameters<T>): ReturnType<T> => funcRef.current(...args)) as T, [funcRef, stableDependencies]);
}
