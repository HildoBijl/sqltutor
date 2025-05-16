import { createContext, useContext } from 'react'

// Set up a context so elements inside the drawing can ask for the drawing.
export const DrawingContext = createContext({})

// Get the data out of the context. Optionally, you can provide a ref, and this ref is used instead.
export function useDrawingData(drawingRef) {
	const drawingData = useContext(DrawingContext)
	return drawingRef?.current || drawingData
}

// Get the ID of the surrounding drawing.
export function useDrawingId() {
	return useDrawingData()?.id
}

// Get the bounds of the Drawing.
export function useDrawingBounds() {
	return useDrawingData()?.bounds
}
