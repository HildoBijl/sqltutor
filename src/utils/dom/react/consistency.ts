import { useRef, useCallback } from 'react';

import { ensureConsistency } from '../../javascript';

// Get a ref object whose "current" parameter always equals the given value.
export function useLatest<T>(value: T, initialValue: T = value) {
  const ref = useRef<T>(initialValue);
  ref.current = value;
  return ref;
}

// Take a possibly non-existing ref object useEnsureRef takes a ref object that comes in and ensure there is always a valid MutableRefObject. This is useful when forwarding a ref and wanting to make sure you get an existing ref right at the start.
export function useEnsureRef<T>(ref?: React.Ref<T>): React.Ref<T | undefined> {
  const backupRef = useRef<T | undefined>(undefined);
	return ref ?? backupRef;
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
	equalityCheck: (a: T | undefined, b: T | undefined) => boolean = (a, b) =>
		!!a && typeof (a as any).equals === 'function' && (a as any).equals(b),
): T | undefined {
	const ref = useRef<T | undefined>(undefined);
	if (value !== ref.current && !equalityCheck(value, ref.current))
		ref.current = value;
	return ref.current;
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
