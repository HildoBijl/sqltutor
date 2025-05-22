import { Vector, ensureVector, Rectangle, useMouseData as useClientMouseData, useBoundingClientRect, useBoundingClientRects, useRefWithElement, useTextNode } from 'util'

import { useDrawingData } from './DrawingContext'

// getCoordinates takes client coordinates and transforms them to graphical coordinates within the figure. It may be provided with a figureRect, but if it's not present, then it's recalculated based on the references in the drawing.
export function getCoordinates(clientCoordinates, bounds, figure, figureRect) {
	// If no clientCoordinates have been given, we cannot do anything.
	if (!clientCoordinates)
		return null

	// If no figure rectangle has been provided, find it. (It can be already provided for efficiency.)
	if (!figureRect) {
		const figureInner = figure?.inner
		if (!figureInner)
			return null
		figureRect = figureInner.getBoundingClientRect()
	}

	// Calculate the position. Add an extra check to deal with NaN values and similar.
	clientCoordinates = ensureVector(clientCoordinates, 2)
	return new Vector([
		(clientCoordinates.x - figureRect.x) * bounds.width / figureRect.width,
		(clientCoordinates.y - figureRect.y) * bounds.height / figureRect.height,
	])
}

// useDrawingMouseData tracks the position of the mouse in various coordinate systems. It returns its data in the form { clientPosition: ..., position: ..., keys: {...} }. It may be provided with the reference to a Drawing. If not, it will try to get the data from the context it is in.
export function useDrawingMouseData(drawingRef) {
	const { position: clientPosition, keys } = useClientMouseData()

	// Acquire data on the drawing, either from the given parameter if it exists, or from the context if not.
	const { figure, bounds } = useDrawingData(drawingRef)
	const figureRect = useBoundingClientRect(figure?.inner)

	// Return an empty object on missing data.
	if (!clientPosition || !figureRect || figureRect.width === 0 || figureRect.height === 0)
		return {}

	// Transform to graphical coordinates.
	const position = getCoordinates(clientPosition, bounds, figure, figureRect)
	return { clientPosition, position, keys }
}

// useDrawingMousePosition returns the position of the mouse within the drawing. It only returns the position (a Vector) and not other data, like the useDrawingMouseData function.
export function useDrawingMousePosition() {
	return useDrawingMouseData().position
}

// useElementBounds takes an element in a drawing and returns its bounds (as a Span) in drawing coordinates.
export function useElementBounds(element, drawingRef) {
	const clientRect = useBoundingClientRect(element)
	const drawingData = useDrawingData(drawingRef)
	return clientRect && transformRectangle(clientRect, drawingData)
}

// useTextNodeBounds takes a container, finds all text nodes and filters them based on a string (which they must contain) or otherwise a filtering function.
export function useTextNodeBounds(container, condition, drawingRef, index = 0) {
	const textNode = useTextNode(container, condition, index)
	return useElementBounds(textNode, drawingRef)
}

// useBoundingDrawingRect is like useBoundingClientRect in that it returns a rectangle for the given element. However, it does so in drawing coordinates.
export function useBoundingDrawingRect(element, drawingRef) {
	const bounds = useElementBounds(element, drawingRef)
	return bounds && {
		x: bounds.start.x,
		y: bounds.start.y,
		left: bounds.start.x,
		top: bounds.start.y,
		right: bounds.end.x,
		bottom: bounds.end.y,
		width: bounds.vector.x,
		height: bounds.vector.y,
	}
}

// useRefWithBounds gives an array with [ref, bounds, element] where ref is a react Ref that should be attached to a DOM object, and bounds are the respective bounds for said object. Optionally, the function may be given a ref to a drawing for the coordinate transformations. If not, the context is attempted.
export function useRefWithBounds(drawingRef) {
	const [ref, element] = useRefWithElement()
	const bounds = useElementBounds(element, drawingRef)
	return [ref, bounds, element]
}

// useIndividualChildrenBounds takes an element, finds its children and returns the bounds for those children. The result is an array of Rectangle objects.
export function useIndividualChildrenBounds(element, drawingRef) {
	const clientRects = useBoundingClientRects([...(element?.childNodes || [])])
	const drawingData = useDrawingData(drawingRef)
	return clientRects.map(clientRect => clientRect && transformRectangle(clientRect, drawingData))
}

// transformRectangle takes a Rectangle object (like bounds) in Client coordinates and turns it into Drawing coordinates.
export function transformRectangle(rectangle, drawingData) {
	const { figure, bounds } = drawingData

	// On no rectangle, return nothing either.
	if (!rectangle)
		return rectangle

	// Transform the rectangle.
	const start = getCoordinates({ x: rectangle.left, y: rectangle.top }, bounds, figure)
	const end = getCoordinates({ x: rectangle.right, y: rectangle.bottom }, bounds, figure)
	return start && end && new Rectangle({ start, end })
}
