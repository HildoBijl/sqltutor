import { RefObject } from 'react';
import { Vector, type VectorInput, ensureVector, Rectangle, type RectangleInput, ensureRectangle } from '@/utils/geometry';
import { type UtilKeys, useMouseData as useClientMouseData, useBoundingClientRect, useBoundingClientRects, useRefWithElement, useTextNode } from '@/utils/dom';

import { type FigureData } from '../Figure';

import { type DrawingData } from './definitions';
import { useDrawingData } from './DrawingContext';

// Transform client coordinates to drawing coordinates. This function may be provided with a figureRectangle, but if not provided, it is recalculated from the given figure.
export function getCoordinates(
	clientCoordinates?: VectorInput,
	bounds?: RectangleInput,
	figure?: FigureData | null,
	figureRect?: DOMRect,
): Vector | undefined {
	if (!clientCoordinates || !bounds)
		return undefined;

	// Find the figureRect if not provided.
	if (!figureRect) {
		const figureInner = figure?.inner;
		if (!figureInner)
			return undefined;
		figureRect = figureInner.getBoundingClientRect();
	}

	const clientCoordinatesVector = ensureVector(clientCoordinates, 2);
	const boundsRect = ensureRectangle(bounds, 2);

	return new Vector([
		((clientCoordinatesVector.x - figureRect.x) * boundsRect.width) / figureRect.width,
		((clientCoordinatesVector.y - figureRect.y) * boundsRect.height) / figureRect.height,
	]);
}

// Track the mouse position in both client and drawing coordinates.
export function useDrawingMouseData(drawingRef?: React.RefObject<DrawingData>): {
	clientPosition?: Vector;
	position?: Vector;
	keys?: UtilKeys;
} {
	// Acquire the mouse status.
	const { position: clientPosition, keys } = useClientMouseData();

	// Acquire data on the drawing.
	const drawingData = useDrawingData(drawingRef);
	if (!drawingData)
		return {};

	// If things are still initializing, don't return anything.
	const { figure, bounds } = drawingData;
	const figureRect = useBoundingClientRect(figure?.inner);
	if (!clientPosition || !figureRect || figureRect.width === 0 || figureRect.height === 0)
		return {};

	// Find the position in drawing coordinates and return everything.
	const position = getCoordinates(clientPosition, bounds, figure, figureRect);
	return { clientPosition, position, keys };
}

// Track the mouse position in drawing coordinates.
export function useDrawingMousePosition(): Vector | undefined {
	return useDrawingMouseData().position
}

// Find the bounds of a given element in drawing coordinates.
export function useElementBounds(
	element?: Element | Text,
	drawingRef?: React.RefObject<DrawingData>
): Rectangle | undefined {
	const clientRect = useBoundingClientRect(element);
	const drawingData = useDrawingData(drawingRef);
	return transformRectangle(clientRect, drawingData);
}

// Finds a text node and returns its bounds in drawing coordinates.
export function useTextNodeBounds(
	container: Element | null | undefined,
	condition: string | ((node: Text) => boolean),
	drawingRef?: React.RefObject<DrawingData>,
	index = 0,
): Rectangle | undefined {
	const textNode = useTextNode(container, condition, index);
	return useElementBounds(textNode, drawingRef);
}

// Get the bounding rectangle of an element in drawing coordinates.
export function useBoundingDrawingRect(
	element?: Element,
	drawingRef?: React.RefObject<DrawingData>
): DOMRect | undefined {
	// Find the bounds.
	const bounds = useElementBounds(element, drawingRef);
	if (!bounds)
		return undefined;

	// Set up a DOMRect.
	return {
		x: bounds.start.x,
		y: bounds.start.y,
		left: bounds.start.x,
		top: bounds.start.y,
		right: bounds.end.x,
		bottom: bounds.end.y,
		width: bounds.vector.x,
		height: bounds.vector.y,
		toJSON: () => ({}), // DOMRect compatibility
	} as DOMRect;
}

// Return [ref, bounds, element] for an element within a drawing. Attach the ref to a DOM object to get its bounds and the element.
export function useRefWithBounds(drawingRef?: RefObject<DrawingData>): [(node: Element | undefined) => void, Rectangle | undefined, Element | undefined] {
	const [ref, element] = useRefWithElement<Element>();
	const bounds = useElementBounds(element, drawingRef);
	return [ref, bounds, element];
}

// Get bounds for each child of a given element. It only considers Elements and TextNodes, but not other ChildNodes like annotations/comments.
export function useIndividualChildrenBounds(
	element?: Element,
	drawingRef?: React.RefObject<DrawingData>
): (Rectangle | undefined)[] {
	const nodes = [...(element?.childNodes || [])].filter(node => node instanceof Element || node instanceof Text);
	const clientRects = useBoundingClientRects(nodes);
	const drawingData = useDrawingData(drawingRef);
	return clientRects.map(clientRect => clientRect && transformRectangle(clientRect, drawingData));
}

// Transform a DOMRect (client coordinates) into a Rectangle (drawing coordinates).
export function transformRectangle(
	rectangle?: DOMRect,
	drawingData?: DrawingData,
): Rectangle | undefined {
	// Check the input.
	if (!rectangle || !drawingData)
		return undefined;

	// Calculate the rectangle.
	const { figure, bounds } = drawingData;
	const start = getCoordinates({ x: rectangle.left, y: rectangle.top }, bounds, figure);
	const end = getCoordinates({ x: rectangle.right, y: rectangle.bottom }, bounds, figure);
	return start && end && new Rectangle(start, end);
}
