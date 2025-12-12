import { useState, useEffect, useRef, useMemo, useImperativeHandle, useId, type CSSProperties } from 'react';

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
	const figureRef = useRef<FigureData>(null);
	const htmlContentsRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const svgDefsRef = useRef<SVGDefsElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Rerender the component once references are established.
	useForceUpdateEffect();

	// Determine figure size parameters to use for rendering.
	if (width <= 0)
		throw new Error(`Invalid Drawing width: ${width}`);
	if (height <= 0)
		throw new Error(`Invalid Drawing height: ${height}`);
	const bounds = useMemo(() => new Rectangle([0, 0], [width, height]), [width, height]);
	const aspectRatio = height / width; // This must be passed on to the Figure object.
	const figureMaxWidth = maxWidth === 'fill' ? undefined : (typeof maxWidth === 'function' ? maxWidth(bounds) : maxWidth);

	// Determine the initial figure scale, in case autoScale is applied.
	const [initialFigureScale, setInitialFigureScale] = useState<number | undefined>();
	const innerFigure = figureRef.current?.inner;
	useEffect(() => {
		if (innerFigure)
			setInitialFigureScale(innerFigure.getBoundingClientRect().width / bounds.width);
	}, [innerFigure, setInitialFigureScale]);

	// Set up refs and make them accessible to any implementing component.
	const drawingData = {
		id,
		bounds,
		figure: figureRef.current,
		svg: svgRef.current,
		svgDefs: svgDefsRef.current,
		htmlContents: htmlContentsRef.current,
		canvas: canvasRef.current,
		getFigureScale: () => autoScale && innerFigure ? innerFigure.getBoundingClientRect().width / bounds.width : initialFigureScale,
		getCoordinates: (cPoint: Vector, figureRect?: DOMRect) => getCoordinates(cPoint, bounds, figureRef.current, figureRect),
		getPointFromEvent: (event: MouseEvent | TouchEvent) => getCoordinates(getEventPosition(event), bounds, figureRef.current),
		contains: (point: Vector) => bounds.contains(point),
		applyBounds: (point: Vector) => bounds.applyBounds(point),
	};
	useImperativeHandle(mergedRef, () => drawingData, [bounds, figureRef.current, svgRef.current, svgDefsRef.current, htmlContentsRef.current, canvasRef.current]);

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
