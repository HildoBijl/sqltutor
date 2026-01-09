import { useMemo } from 'react';
import { repeat } from '@/utils/javascript';
import { Vector, type VectorInput, ensureVector, Rectangle, type RectangleInput, ensureRectangle } from '@/utils/geometry';
import { type UtilKeys, useMouseData as useClientMouseData, useBoundingClientRect, useRefWithElement, useTextNode } from '@/utils/dom';

import { type DrawingData } from './definitions';
import { useDrawingDataWithFallback } from './DrawingContext';

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
	const clientCoordinatesVector = ensureVector(clientCoordinates, 2);
	const boundsRect = ensureRectangle(figureBounds, 2);

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
	keys?: UtilKeys;
} {
	// Acquire the mouse status.
	const { position: clientPosition, keys } = useClientMouseData();

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
	return useMemo(() => transformRectangle(rectangle, innerFigure?.getBoundingClientRect(), bounds), [rectangle, innerFigure]);
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
