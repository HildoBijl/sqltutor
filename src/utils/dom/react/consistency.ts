import { type Ref, type RefObject, type RefCallback, useRef, useCallback } from 'react';

import { ensureConsistency } from '../../javascript';

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
	ref.current = ensureConsistency(value, ref.current ?? undefined);
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
