import { useEffect, useRef } from 'react';

import { useLatest, useConsistentValue, useStableCallback } from './consistency';

// The target element for useEventListener.
type PossibleTarget =
	| EventTarget
	| { current: EventTarget | null }
	| null
	| undefined;

// Set up an event listener for the given eventName and the given element. Multiple event names or elements are allowed. React object references are also allowed as element.
export function useEventListener<K extends keyof GlobalEventHandlersEventMap = keyof GlobalEventHandlersEventMap>(
	eventNames: K | K[],
	handler: ((event: GlobalEventHandlersEventMap[K]) => void) | (((event: GlobalEventHandlersEventMap[K]) => void)[]),
	elements: PossibleTarget | PossibleTarget[] = window,
	options: AddEventListenerOptions = {},
): void {
	// Keep stable references.
	const stableEventNames = useConsistentValue(eventNames);
	const handlerRef = useLatest(handler);
	const stableOptions = useConsistentValue(options);

	// Normalize element list.
	const resolvedElements = (Array.isArray(elements) ? elements : [elements])
		.map(element => {
			if (!element)
				return null;
			if ("addEventListener" in element)
				return element;
			if ("current" in element && element.current && "addEventListener" in element.current)
				return element.current;
			return null;
		})
		.filter((element): element is EventTarget => element !== null);
	const stableElements = useConsistentValue(resolvedElements);

	// Set up and clean up listeners.
	useEffect(() => {
		const eventNames = Array.isArray(stableEventNames) ? stableEventNames : [stableEventNames];
		const redirectingHandlers = eventNames.map((_, index) => {
			return (event: Event) => {
				const currentHandler = handlerRef.current;
				const chosenHandler = (Array.isArray(currentHandler) ? currentHandler[index] : currentHandler) as EventListener;
				chosenHandler(event);
			};
		});

		// Register events.
		eventNames.forEach((name, index) => {
			if (name === undefined || name === null)
				return;
			const redirectHandler = redirectingHandlers[index];
			stableElements.forEach(element => element.addEventListener(name, redirectHandler, stableOptions));
		});

		// Remove event handlers on clean-up.
		return () => {
			eventNames.forEach((name, index) => {
				if (name === undefined || name === null)
					return;
				const redirectHandler = redirectingHandlers[index];
				stableElements.forEach(element => element.removeEventListener(name, redirectHandler));
			});
		};
	}, [stableEventNames, handlerRef, stableElements, stableOptions]);
}

// Based on an object like { mouseenter: (event) => {...}, mouseleave: (event) => {...} } apply event listeners to an element or list of elements.
export function useEventListeners<K extends keyof GlobalEventHandlersEventMap>(
	handlers: Partial<Record<K, EventListener>>,
	elements?: PossibleTarget | PossibleTarget[],
	options?: AddEventListenerOptions,
): void {
	const eventNames = Object.keys(handlers) as K[];
	const eventHandlers = Object.values(handlers) as EventListener[];
	useEventListener(eventNames, eventHandlers, elements, options);
}

// Give an object like { mouseenter: (event) => {...}, mouseleave: (event) => {...} } and get a ref. When this ref is coupled to a DOM object, this DOM object listens to the relevant events.
export function useRefWithEventListeners<T extends HTMLElement = HTMLElement, H extends Partial<Record<keyof GlobalEventHandlersEventMap, EventListener>> = any>(handlers: H, options?: AddEventListenerOptions) {
	const ref = useRef<T | null>(null);
	useEventListeners(handlers, ref, options);
	return ref;
}

// Turn a function into a debounced function: even if the debounced function is called multiple times quickly, the original function is only called once per delay window.
export function useDebouncedFunction<T extends (...args: any[]) => void>(
	func: T,
	delay: number = 0,
): (...args: Parameters<T>) => void {
	const funcRef = useLatest(func);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	return useStableCallback((...args: Parameters<T>) => {
		if (timeoutRef.current !== undefined)
			clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => {
			funcRef.current(...args);
		}, delay);
	}, [funcRef, delay]);
}
