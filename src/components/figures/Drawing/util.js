import { Vector, ensureVector, useMouseData as useClientMouseData, useBoundingClientRect } from 'util'

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

	// Calculate the position.
	clientCoordinates = ensureVector(clientCoordinates, 2)
	return new Vector([
		(clientCoordinates.x - figureRect.x) * bounds.width / figureRect.width,
		(clientCoordinates.y - figureRect.y) * bounds.height / figureRect.height,
	])
}

// useMouseData tracks the position of the mouse in various coordinate systems. It returns its data in the form { clientPosition: ..., position: ..., keys: {...} }.
export function useMouseData() {
	// Acquire data.
	let { figure, transformationSettings } = useDrawingData()
	const { position: clientPosition, keys } = useClientMouseData()
	const figureRect = useBoundingClientRect(figure?.inner)

	// Return an empty object on missing data.
	if (!clientPosition || !figureRect || figureRect.width === 0 || figureRect.height === 0)
		return {}

	// Transform to graphical coordinates.
	const position = getCoordinates(clientPosition, transformationSettings, figure, figureRect)
	return { clientPosition, position, keys }
}

export function useMousePosition() {
	return useMouseData().position
}
