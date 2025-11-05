import type { Vector, Rectangle } from '@/utils';

import { type FigureProps, type FigureData, getDefaultFigure } from '../Figure';

export interface DrawingData {
	id: string;
	bounds: Rectangle;
	figure: FigureData | null;
	svg: SVGSVGElement | null;
	svgDefs: SVGDefsElement | null;
	htmlContents: HTMLDivElement | null;
	canvas: HTMLCanvasElement | null;
	getCoordinates: (cPoint: Vector, figureRect?: DOMRect) => Vector | undefined;
	getPointFromEvent: (event: MouseEvent | TouchEvent) => Vector | undefined;
	contains: (point: Vector) => boolean;
	applyBounds: (point: Vector) => Vector;
}

export interface DrawingProps<TRef = DrawingData> extends Omit<FigureProps<TRef>, 'aspectRatio' | 'maxWidth'> {
	maxWidth?: ((bounds: Rectangle) => number | undefined) | 'fill' | number;
	width: number;
	height: number;
	useSvg?: boolean;
	useCanvas?: boolean;
}

export const getDefaultDrawing = (): DrawingProps => {
	const { aspectRatio, maxWidth, ref, ...defaultFigure } = getDefaultFigure(); // Remove unnecessary attributes.
	return {
		...defaultFigure,
		maxWidth: (bounds) => bounds.width,
		width: 400,
		height: 300,
		useSvg: true,
		useCanvas: false,
	}
};
