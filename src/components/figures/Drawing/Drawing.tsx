import { useState, useEffect, useCallback, useMemo, useImperativeHandle, useId, type CSSProperties } from 'react';

import { type Vector, Rectangle } from '@/utils/geometry';
import { getEventPosition, useEnsureRef, notSelectable, useRefWithElement, useRefWithValue } from '@/utils/dom';

import { type FigureData, Figure } from '../Figure';

import { type DrawingData, type DrawingProps, getDefaultDrawing } from './definitions';
import { DrawingContext, SvgDefsPortal } from './DrawingContext';
import { getCoordinates } from './utils';

const svgStyle: CSSProperties = {
	display: 'block',
	...notSelectable,
	outline: 'none',
	overflow: 'visible',
	width: '100%',
	zIndex: 2,
};
const htmlStyle: CSSProperties = {
	fontSize: '16px', // Fix font size to prevent jumps on window resize.
};
const canvasStyle: CSSProperties = {
	height: '100%',
	...notSelectable,
	width: '100%',
	zIndex: 1,
};

export function Drawing(props: DrawingProps) {
	const { maxWidth, width, height, autoScale, useSvg, svgProps, disableSVGPointerEvents, htmlProps, useCanvas, canvasProps, ref, style, children, ...figureProps } = { ...getDefaultDrawing(), ...props };
	if (!useSvg && !useCanvas)
		throw new Error('Drawing error: cannot generate a drawing without either an SVG or a canvas present.');

	// Set up references.
	const id = useId();
	const [mergedRef] = useEnsureRef<DrawingData>(ref);
	const [figureRef, figure] = useRefWithValue<FigureData>();
	const [htmlContentsRef, htmlContents] = useRefWithElement<HTMLDivElement>();
	const [svgRef, svg] = useRefWithElement<SVGSVGElement>();
	const [svgDefsRef, svgDefs] = useRefWithElement<SVGDefsElement>();
	const [canvasRef, canvas] = useRefWithElement<HTMLCanvasElement>();

	// Determine figure size parameters to use for rendering.
	if (width <= 0)
		throw new Error(`Invalid Drawing width: ${width}`);
	if (height <= 0)
		throw new Error(`Invalid Drawing height: ${height}`);
	const roundedWidth = Math.round(width), roundedHeight = Math.round(height); // Round width and height to prevent a potential infinite change loop.
	const bounds = useMemo(() => new Rectangle([0, 0], [roundedWidth, roundedHeight]), [roundedWidth, roundedHeight]);
	const aspectRatio = roundedHeight / roundedWidth; // This must be passed on to the Figure object.
	const figureMaxWidth = maxWidth === 'fill' ? undefined : (typeof maxWidth === 'function' ? maxWidth(bounds) : maxWidth);

	// Determine the initial figure scale, in case autoScale is applied.
	const [initialFigureScale, setInitialFigureScale] = useState<number | undefined>();
	const innerFigure = figure?.inner;
	useEffect(() => {
		if (innerFigure)
			setInitialFigureScale(innerFigure.getBoundingClientRect().width / bounds.width);
	}, [innerFigure, setInitialFigureScale]);
	const getFigureScale = useCallback(() => autoScale && innerFigure ? innerFigure.getBoundingClientRect().width / bounds.width : initialFigureScale, [autoScale, innerFigure, bounds, initialFigureScale]);

	// Set up refs and make them accessible to any implementing component.
	const drawingData = useMemo(() => ({
		id,
		bounds,
		figure,
		svg,
		svgDefs,
		htmlContents,
		canvas,
		getFigureScale,
		getCoordinates: (cPoint: Vector, figureRect?: DOMRect) => getCoordinates(cPoint, figureRect, bounds),
		getPointFromEvent: (event: MouseEvent | TouchEvent) => getCoordinates(getEventPosition(event), figure?.inner && figure?.inner.getBoundingClientRect(), bounds),
		contains: (point: Vector) => bounds.contains(point),
		applyBounds: (point: Vector) => bounds.applyBounds(point),
	}), [bounds, figure, svg, svgDefs, htmlContents, canvas, getFigureScale]);
	useImperativeHandle(mergedRef, () => drawingData, [bounds, figure, svg, svgDefs, htmlContents, canvas, getFigureScale]);

	// Render figure with SVG and Canvas properly placed.
	return <DrawingContext.Provider value={drawingData}>
		<Figure ref={figureRef} aspectRatio={aspectRatio} maxWidth={figureMaxWidth} {...figureProps} innerProps={{ style: { zIndex: 0, ...(figureProps?.innerProps?.style || {}) }, ...(figureProps?.innerProps || {}) }}>

			{/* SVG container */}
			{useSvg ? <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} style={{
				...svgStyle,
				...(disableSVGPointerEvents ? { pointerEvents: 'none' } : {}),
				...(svgProps?.style || {}),
			}} {...svgProps}>
				<defs ref={svgDefsRef} />
			</svg> : null}

			{/* HTML container */}
			<div ref={htmlContentsRef} style={{ ...htmlStyle, ...(htmlProps?.style || {}) }} />

			{/* Canvas */}
			{useCanvas ? <canvas ref={canvasRef} width={width} height={height} style={{ ...canvasStyle, ...(canvasProps?.style || {}) }} {...canvasProps} /> : null}

			{/* Put children here, but portals will move them */}
			{children}

			{/* Clip path to prevent overflow */}
			<SvgDefsPortal>
				<clipPath id={`noOverflow${id}`}>
					<rect x="0" y="0" width={width} height={height} fill="#fff" rx={7} />
				</clipPath>
			</SvgDefsPortal>

		</Figure>
	</DrawingContext.Provider>
}
