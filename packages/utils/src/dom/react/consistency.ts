import { useRef } from 'react';

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

// Keep references in the given value maintained as much as possible. This is also extended to sub-parameters.
export function useConsistentValue<T>(value: T): T {
	const ref = useRef<T | undefined>(undefined);
	ref.current = ref.current === undefined ? value : preserveConsistentRefs(value, ref.current);
	return ref.current;
}
