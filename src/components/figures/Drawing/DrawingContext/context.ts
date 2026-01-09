import { createContext, useContext } from 'react'

import { Rectangle } from '@/utils/geometry';

import { type DrawingData } from '../definitions';

// Set up a context so elements inside the drawing can ask for the drawing.
export const DrawingContext = createContext<DrawingData | null>(null);

// Get the data out of the context.
export function useDrawingData(): DrawingData {
	const drawingData = useContext(DrawingContext);
	if (!drawingData)
		throw new Error(`Invalid useDrawingData call: not in a Drawing context.`)
	return drawingData;
}

// Use the given drawingData object, or get it out of the context as fallback.
export function useDrawingDataWithFallback(drawingData?: DrawingData | null): DrawingData | undefined {
	const drawingDataBackup = useContext(DrawingContext);
	drawingData = drawingData || drawingDataBackup;
	return drawingData || undefined;
}

// Get the ID of the surrounding drawing.
export function useDrawingId(): string | undefined {
	return useDrawingData()?.id;
}

// Get the bounds of the Drawing.
export function useDrawingBounds(): Rectangle | undefined {
	return useDrawingData()?.bounds;
}
