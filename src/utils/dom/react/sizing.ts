import { useState, useCallback, useRef, useLayoutEffect } from 'react';
import useResizeObserver from '@react-hook/resize-observer';

import { getWindowSize, findLayoutRoots } from '../dom';

import { useConsistentValue } from './consistency';
import { useEventListener } from './events';

// When the window or given element resizes, the given function is called.
export function useResizeListener(
	callbackFunc: () => void,
	element: HTMLElement | null = document.querySelector<HTMLElement>("#root"),
): void {
	useResizeObserver(element, () => callbackFunc());
	useEventListener("resize", () => callbackFunc(), window);
}

// Get the window size and update it when changes.
export function useWindowSize(): { width: number; height: number } {
	const [windowSize, setWindowSize] = useState(getWindowSize());
	const updateWindowSize = useCallback(() => setWindowSize(getWindowSize()), []);
	useEventListener("resize", updateWindowSize, window);
	return windowSize;
}

// An extension of getBoundingClientRect to also work for Text nodes.
export function getNodeClientRect(node?: Element | Text | null): DOMRect | undefined {
	// On no input, return nothing.
	if (!node)
		return undefined;

	// Is it a Text node?
	if (node instanceof Text) {
		const range = document.createRange();
		range.selectNode(node);
		return range.getBoundingClientRect();
	}

	// It's a regular element.
	return node.getBoundingClientRect();
}

// Track the BoundingClientRect of a list of elements. Update them on changes to the elements, scrolls, etcetera.
export function useBoundingClientRects(elements: (Element | Text | null | undefined)[]): (DOMRect | undefined)[] {
	const [rects, setRects] = useState<(DOMRect | undefined)[]>();
	const stableElements = useConsistentValue(elements);
	const rafId = useRef<number | null>(null);

	// Compute rects for given elements.
	const getRects = useCallback(() => stableElements.map((element) => getNodeClientRect(element)), [stableElements]);

	// Batch updates (to prevent scroll spam).
	const scheduleUpdate = useCallback(() => {
		if (rafId.current != null)
			return;

		rafId.current = requestAnimationFrame(() => {
			rafId.current = null;
			setRects(getRects());
		});
	}, [getRects]);

	// Initialize on the first run.
	useLayoutEffect(() => {
		setRects(getRects());
	}, [getRects]);

	// Use a ResizeObserver to listen for changes.
	useLayoutEffect(() => {
		const observer = new ResizeObserver(scheduleUpdate);

		// Observe the given elements.
		stableElements.forEach(el => {
			if (el instanceof Element)
				observer.observe(el);
		});

		// Observe the layout roots too.
		const layoutRoots = findLayoutRoots(stableElements);
		layoutRoots.forEach(root => observer.observe(root));

		return () => observer.disconnect();
	}, [stableElements, scheduleUpdate]);

	// Handle scroll & viewport movement.
	useLayoutEffect(() => {
		window.addEventListener("scroll", scheduleUpdate, { passive: true });
		window.addEventListener("resize", scheduleUpdate);
		return () => {
			window.removeEventListener("scroll", scheduleUpdate);
			window.removeEventListener("resize", scheduleUpdate);
		};
	}, [scheduleUpdate]);

	// Return the result.
	return rects || getRects();
}

// Track the BoundingClientRect of an element.
export function useBoundingClientRect(element: Element | Text | null | undefined): DOMRect | undefined {
	return useBoundingClientRects([element])[0];
}
