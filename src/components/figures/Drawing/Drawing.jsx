import { useRef, useMemo, useImperativeHandle, useId } from 'react'
import clsx from 'clsx'

import { processOptions, filterOptions, resolveFunctions, getEventPosition, useEnsureRef, useForceUpdateEffect, Rectangle, Vector, notSelectable } from 'util'

import { Figure, defaultFigureOptions } from '../Figure'

import { defaultDrawingOptions } from './settings'
import { DrawingContext, SvgDefsPortal } from './DrawingContext'
import { getCoordinates } from './util'

// Define component styles.
const svgStyle = {
	display: 'block',
	...notSelectable,
	outline: 'none',
	overflow: 'visible',
	width: '100%',
	zIndex: 2,
}
const canvasStyle = {
	height: '100%',
	...notSelectable,
	width: '100%',
	zIndex: 1,
}

// Set up the component with an imperative handle.
export function Drawing(options) {
	// Process and check the options.
	options = processOptions(options, defaultDrawingOptions)
	if (!options.useSvg && !options.useCanvas)
		throw new Error('Drawing render error: cannot generate a drawing without either an SVG or a canvas present. Either useSvg or useCanvas must be set to true.')

	// Set up styles and references.
	const id = useId()
	const ref = useEnsureRef(options.ref)
	const figureRef = useRef()
	const htmlContentsRef = useRef()
	const svgRef = useRef()
	const svgDefsRef = useRef()
	const canvasRef = useRef()
	useForceUpdateEffect() // Rerender the component once references are established.

	// Determine figure size parameters to use for rendering.
	const { width, height } = options
	const bounds = useMemo(() => new Rectangle({ start: new Vector(0, 0), end: new Vector(width, height) }), [width, height])
	if (width === 0)
		throw new Error(`Invalid Drawing width: cannot have a width being 0 or negative. Received was ${width}.`)
	if (height === 0)
		throw new Error(`Invalid Drawing height: cannot have a height being 0 or negative. Received was ${height}.`)
	options.aspectRatio = height / width // This must be passed on to the Figure object.
	options.maxWidth = options.maxWidth === 'fill' ? undefined : resolveFunctions(options.maxWidth, bounds)

	// Set up refs and make them accessible to any implementing component.
	useImperativeHandle(ref, () => ({
		// Basic getters.
		get bounds() { return bounds },
		get figure() { return figureRef.current },
		get svg() { return svgRef.current },
		get svgDefs() { return svgDefsRef.current },
		get htmlContents() { return htmlContentsRef.current },
		get canvas() { return canvasRef.current },

		// Coordinate manipulation functions. Note the distinction between client points and drawing points, all in different coordinate systems.
		getCoordinates(cPoint, figureRect) {
			return getCoordinates(cPoint, bounds, figureRef.current, figureRect)
		},
		getPointFromEvent(event) {
			const cPoint = getEventPosition(event)
			return getCoordinates(cPoint, bounds, figureRef.current)
		},
		contains(point) {
			if (!point)
				return false
			return bounds.contains(point)
		},
		applyBounds(point) {
			return bounds.applyBounds(point)
		},
	}))

	// Render figure with SVG and Canvas properly placed.
	options.className = clsx('drawing', options.className)
	return (
		<DrawingContext.Provider value={{ id, bounds, figure: figureRef.current, svg: svgRef.current, svgDefs: svgDefsRef.current, htmlContents: htmlContentsRef.current, canvas: canvasRef.current }}>
			<Figure {...{ ...filterOptions(options, defaultFigureOptions), ref: figureRef }}>
				{options.useSvg ? (
					<svg ref={svgRef} style={svgStyle} viewBox={`0 0 ${width} ${height}`}>
						<defs ref={svgDefsRef} />
					</svg>
				) : null}
				{options.useCanvas ? <canvas ref={canvasRef} style={canvasStyle} width={width} height={height} /> : null}
				<div ref={htmlContentsRef} />
				{options.children}

				{/* Clip path to prevent overflow. */}
				<SvgDefsPortal>
					<clipPath id={`noOverflow${id}`}>
						<rect x="0" y="0" width={width} height={height} fill="#fff" rx={7} />
					</clipPath>
				</SvgDefsPortal>
			</Figure>
		</DrawingContext.Provider>
	)
}
