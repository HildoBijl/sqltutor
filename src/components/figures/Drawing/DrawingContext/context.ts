import { createContext, useContext, Ref } from 'react'

import { Rectangle } from '@/utils/geometry';

import { type DrawingData } from '../definitions';

// Set up a context so elements inside the drawing can ask for the drawing.
export const DrawingContext = createContext<DrawingData | null>(null);

// Get the data out of the context. Optionally, you can provide a ref, and this ref is used instead.
export function useDrawingData(drawingRef?: Ref<DrawingData | null>): DrawingData {
	const drawingData = useContext(DrawingContext);
	if (drawingRef && typeof drawingRef !== 'function' && drawingRef.current)
		return drawingRef.current!;
	return drawingData!;
}

// Get the ID of the surrounding drawing.
export function useDrawingId(): string | undefined {
	return useDrawingData()?.id;
}

// Get the bounds of the Drawing.
export function useDrawingBounds(): Rectangle | undefined {
	return useDrawingData()?.bounds;
}
