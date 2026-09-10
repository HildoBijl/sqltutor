import { type CSSProperties, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { isPlainObject, repeat } from '@step-wise/js-utils';
import { Vector, type VectorLike as VectorInput, ensureVector, Rectangle, type RectangleLike as RectangleInput, ensureRectangle } from '@step-wise/geometry';
import { type ModifierKeyState } from '@step-wise/browser-utils';
import { useEventListener, usePointerState, useResizeObserver } from '@step-wise/react-utils';
import { useRefWithElement } from '@sqlvalley/utils/dom';

import { type DrawingData } from './definitions';
import { useDrawingDataWithFallback } from './DrawingContext';

// A macro for making an object unselectable, preventing a blue border around it.
export const notSelectable: CSSProperties = {
	userSelect: 'none',
	WebkitUserSelect: 'none',
	MozUserSelect: 'none',
	msUserSelect: 'none',
	WebkitTapHighlightColor: 'transparent',
};

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
function useConsistentValue<T>(value: T): T {
	const ref = useRef<T | undefined>(undefined);
	ref.current = ref.current === undefined ? value : preserveConsistentRefs(value, ref.current);
	return ref.current;
}

// For a DOM object, set up a list of all textNodes in it.
function getTextNodes(element: Node | null | undefined): Text[] {
	if (!element)
		return [];
	if (element.nodeType === Node.TEXT_NODE)
		return [element as Text];
	const children = Array.from(element.childNodes);
	return children.flatMap(child => getTextNodes(child));
}

// From an element (a container), find the text node in it satisfying a given condition. Optionally, an offset can be given if multiple elements satisfy that condition. If the condition is a string, it finds the text node containing that string.
function useTextNode(
	container: Node | null | undefined,
	condition: ((node: Text) => boolean) | string,
	offset = 0,
): Text | undefined {
	// Normalize the given condition.
	let predicate: (node: Text) => boolean;
	if (typeof condition === 'string') {
		const text = condition;
		predicate = (node: Text) => node.textContent?.includes(text) ?? false;
	} else {
		predicate = condition;
	}

	// Find the respective text node.
	return getTextNodes(container).filter(predicate)[offset];
}

// For a given node (Element, Text) find the LayoutRoot: the first parent that is involved in positioning.
function findLayoutRoot(node: Element | Text | null | undefined, stopAt?: Element): Element | null {
	if (!node)
		return null;

	// Walk up the tree until we find an element establishing layout.
	let el: Element | null = node instanceof Element ? node : node.parentElement;
	while (el) {
		const style = getComputedStyle(el);

		// Skip non-layout participants.
		if (style.display === 'contents' || style.position === 'fixed') {
			if (el === stopAt)
				break;
			el = el.parentElement;
			continue;
		}

		// These typically establish layout flow
		if (style.display === 'block' || style.display === 'flex' || style.display === 'grid' || style.display === 'inline-block')
			return el;

		el = el.parentElement;
	}

	return null;
}

// For a given set of nodes, find all (possibly shared) layout roots.
function findLayoutRoots(nodes: (Element | Text | null | undefined)[], stopAt?: Element): Element[] {
	const roots = new Set<Element>();
	for (const node of nodes) {
		const root = findLayoutRoot(node, stopAt);
		if (root)
			roots.add(root);
	}
	return [...roots];
}

// When the window or given element resizes, the given function is called.
export function useResizeListener(
	callbackFunc: () => void,
	element: HTMLElement | null = document.querySelector<HTMLElement>('#root'),
): void {
	useResizeObserver(element, () => callbackFunc());
	useEventListener('resize', () => callbackFunc(), window);
}

// An extension of getBoundingClientRect to also work for Text nodes.
function getNodeClientRect(node?: Element | Text | null): DOMRect | undefined {
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
function useBoundingClientRects(elements: (Element | Text | null | undefined)[]): (DOMRect | undefined)[] {
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
		window.addEventListener('scroll', scheduleUpdate, { passive: true });
		window.addEventListener('resize', scheduleUpdate);
		return () => {
			window.removeEventListener('scroll', scheduleUpdate);
			window.removeEventListener('resize', scheduleUpdate);
		};
	}, [scheduleUpdate]);

	// Return the result.
	return rects || getRects();
}

// Track the BoundingClientRect of an element.
function useBoundingClientRect(element: Element | Text | null | undefined): DOMRect | undefined {
	return useBoundingClientRects([element])[0];
}

// Track the rectangle which the figure has in the page.
export function useFigureRect(drawingData?: DrawingData | null) {
	drawingData = useDrawingDataWithFallback(drawingData);
	const figureRect = useBoundingClientRect(drawingData?.figure?.inner);
	return figureRect;
}

// Transform client coordinates to drawing coordinates. This function may be provided with a figureRectangle, but if not provided, it is recalculated from the given figure.
export function getCoordinates(
	clientCoordinates?: VectorInput | null,
	figureRect?: DOMRect | null,
	figureBounds?: RectangleInput | null,
): Vector | undefined {
	// On missing data, do nothing.
	if (!clientCoordinates || !figureRect || !figureBounds)
		return undefined;

	// Check that the input is in the right dimension and format.
	const clientCoordinatesVector = ensureVector(clientCoordinates, { dimension: 2 });
	const boundsRect = ensureRectangle(figureBounds, { dimension: 2 });

	// Check edge cases.
	if ((figureRect.width === 0 && boundsRect.width !== 0) || (figureRect.height === 0 && boundsRect.height !== 0))
		return undefined;

	// Set up the transformed vector.
	return new Vector([
		boundsRect.width === 0 ? 0 : ((clientCoordinatesVector.x - figureRect.x) * boundsRect.width) / figureRect.width,
		boundsRect.height === 0 ? 0 : ((clientCoordinatesVector.y - figureRect.y) * boundsRect.height) / figureRect.height,
	]);
}

// Track the mouse position in both client and drawing coordinates.
export function useDrawingMouseData(drawingData?: DrawingData | null): {
	clientPosition?: Vector;
	position?: Vector;
	keys?: ModifierKeyState;
} {
	// Acquire the mouse status.
	const { position: clientPosition, modifierKeys: keys } = usePointerState();

	// Acquire data on the drawing.
	drawingData = useDrawingDataWithFallback(drawingData);
	const figureRect = useFigureRect(drawingData);

	// Find the position in drawing coordinates and return everything.
	const position = getCoordinates(clientPosition, figureRect, drawingData?.bounds);
	return { clientPosition, position, keys };
}

// Track the mouse position in drawing coordinates.
export function useDrawingMousePosition(): Vector | undefined {
	return useDrawingMouseData().position;
}

// Transform a DOMRect (client coordinates) into a Rectangle (drawing coordinates).
export function transformRectangle(
	rectangle?: DOMRect | null,
	figureRect?: DOMRect,
	figureBounds?: RectangleInput,
): Rectangle | undefined {
	// On missing input do nothing.
	if (!rectangle || !figureRect || !figureBounds)
		return undefined;

	// Calculate the rectangle.
	const start = getCoordinates({ x: rectangle.left, y: rectangle.top }, figureRect, figureBounds);
	const end = getCoordinates({ x: rectangle.right, y: rectangle.bottom }, figureRect, figureBounds);
	return start && end && new Rectangle(start, end);
}

// Transform a rectangle through a hook, monitoring updates on drawing resizing/repositioning.
export function useTransformedRectangle(rectangle?: DOMRect | null, drawingData?: DrawingData | null) {
	drawingData = useDrawingDataWithFallback(drawingData);
	const { figure, bounds } = drawingData || {};
	const innerFigure = figure?.inner;
	return useMemo(() => transformRectangle(rectangle, innerFigure?.getBoundingClientRect(), bounds), [rectangle, innerFigure, bounds]);
}

// Find the bounds of a given element in drawing coordinates.
export function useElementBounds(
	element?: Element | Text | null,
	drawingData?: DrawingData | null,
	numUp = 0,
): Rectangle | undefined {
	drawingData = useDrawingDataWithFallback(drawingData);

	// If specified, find the (parents of parents of) parents.
	repeat(numUp, () => {
		if (element?.parentElement)
			element = element?.parentElement;
	})

	// Find the bounding rectangles and transform accordingly.
	const rectangle = useBoundingClientRect(element);
	return useTransformedRectangle(rectangle, drawingData);
}

// Finds a text node and returns its bounds in drawing coordinates.
export function useTextNodeBounds(
	container: Element | null | undefined,
	condition: string | ((node: Text) => boolean),
	drawingData?: DrawingData | null,
	index = 0,
	numUp = 0,
): Rectangle | undefined {
	const textNode = useTextNode(container, condition, index);
	return useElementBounds(textNode, drawingData, numUp);
}

// Return [ref, bounds, element] for an element within a drawing. As usage: attach the ref to a DOM object to get its bounds (in drawing coordinates) and optionally the respective element. (If you only want the element, use the React hook useRefWithElement.)
export function useRefWithBounds<T extends Element | null = Element>(drawingData?: DrawingData | null): [(node: T | null) => void, Rectangle | undefined, Element | null] {
	const [ref, element] = useRefWithElement<T>();
	const bounds = useElementBounds(element, drawingData);
	return [ref, bounds, element];
}
