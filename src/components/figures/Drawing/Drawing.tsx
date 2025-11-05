import { useRef, useMemo, useImperativeHandle, useId, CSSProperties } from 'react';

import { type Vector, Rectangle } from '@/utils/geometry';
import { getEventPosition, useEnsureRef, useForceUpdateEffect, notSelectable } from '@/utils/dom';

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
const canvasStyle: CSSProperties = {
	height: '100%',
	...notSelectable,
	width: '100%',
	zIndex: 1,
};

export function Drawing(props: DrawingProps) {
	const { maxWidth, width, height, useSvg, useCanvas, ref, style, ...figureProps } = { ...getDefaultDrawing(), ...props };
	if (!useSvg && !useCanvas)
		throw new Error('Drawing error: cannot generate a drawing without either an SVG or a canvas present.');

	// Set up references.
	const id = useId();
	const [mergedRef] = useEnsureRef<DrawingData>(ref);
	const figureRef = useRef<FigureData>(null);
	const htmlContentsRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const svgDefsRef = useRef<SVGDefsElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Rerender the component once references are established.
	useForceUpdateEffect()

	// Determine figure size parameters to use for rendering.
	if (width <= 0)
		throw new Error(`Invalid Drawing width: ${width}`);
	if (height <= 0)
		throw new Error(`Invalid Drawing height: ${height}`);
	const bounds = useMemo(() => new Rectangle([0, 0], [width, height]), [width, height]);
	const aspectRatio = height / width; // This must be passed on to the Figure object.
	const figureMaxWidth = maxWidth === 'fill' ? undefined : (typeof maxWidth === 'function' ? maxWidth(bounds) : maxWidth);

	// Set up refs and make them accessible to any implementing component.
	const drawingData = {
		id,
		bounds,
		figure: figureRef.current,
		svg: svgRef.current,
		svgDefs: svgDefsRef.current,
		htmlContents: htmlContentsRef.current,
		canvas: canvasRef.current,
		getCoordinates: (cPoint: Vector, figureRect?: DOMRect) => getCoordinates(cPoint, bounds, figureRef.current, figureRect),
		getPointFromEvent: (event: MouseEvent | TouchEvent) => getCoordinates(getEventPosition(event), bounds, figureRef.current),
		contains: (point: Vector) => bounds.contains(point),
		applyBounds: (point: Vector) => bounds.applyBounds(point),
	};
	useImperativeHandle(mergedRef, () => drawingData, [bounds, figureRef.current, svgRef.current, svgDefsRef.current, htmlContentsRef.current, canvasRef.current])

	// Render figure with SVG and Canvas properly placed.
	return <DrawingContext.Provider value={drawingData}>
		<Figure ref={figureRef} aspectRatio={aspectRatio} maxWidth={figureMaxWidth} {...figureProps}>
			{/* Containers that portals can place elements into. */}
			{useSvg ? <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} style={svgStyle}>
				<defs ref={svgDefsRef} />
			</svg> : null}
			{useCanvas ? <canvas ref={canvasRef} width={width} height={height} style={canvasStyle} /> : null}
			<div ref={htmlContentsRef} />
			{props.children}

			{/* Clip path to prevent overflow. */}
			<SvgDefsPortal>
				<clipPath id={`noOverflow${id}`}>
					<rect x="0" y="0" width={width} height={height} fill="#fff" rx={7} />
				</clipPath>
			</SvgDefsPortal>
		</Figure>
	</DrawingContext.Provider>
}
