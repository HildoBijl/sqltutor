import { useState, useCallback, useEffect } from 'react';
import useResizeObserver from '@react-hook/resize-observer';

import { getWindowSize } from '../dom';

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

// Track the BoundingClientRect of a list of elements. Update them on changes to the elements, scrolls, etcetera.
export function useBoundingClientRects(elements: (Element | Text | null | undefined)[]): (DOMRect | undefined)[] {
	const [rects, setRects] = useState<(DOMRect | undefined)[]>();
	const stableElements = useConsistentValue(elements);

	// Compute rects for given elements.
	const getRects = useCallback(() => {
		return stableElements.map((element) => {
			if (!element)
				return undefined;
			if (element.nodeType === 3) { // Text node.
				const range = document.createRange();
				range.selectNode(element);
				return range.getBoundingClientRect();
			}
			if (element instanceof Element)
				return element.getBoundingClientRect(); // HTMLElement or SVGElement.
			return undefined;
		});
	}, [stableElements]);

	// Get a debounced updater.
	const updateElementPosition = useCallback(() => setRects(getRects()), [setRects, getRects]);

	// Update when elements change.
	useEffect(() => {
		updateElementPosition();
	}, [getRects, updateElementPosition]);

	// Observe resize on the first element (resize observer cannot handle arrays).
	const firstElement = stableElements.find((element): element is HTMLElement => !!element && element.nodeType === 1);
	useResizeListener(updateElementPosition, firstElement || null);

	// React to scrolling and swiping.
	useEventListener("scroll", updateElementPosition);
	useEventListener("swipe" as any, updateElementPosition);
	useEventListener("swipeEnd" as any, updateElementPosition);

	// Initialize on the first run.
	if (!rects) {
		const actualRect = getRects();
		setRects(actualRect);
		return actualRect;
	}
	return rects;
}

// Track the BoundingClientRect of an element.
export function useBoundingClientRect(element: Element | Text | null | undefined): DOMRect | undefined {
	return useBoundingClientRects([element])[0];
}
