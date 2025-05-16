import { forwardRef } from 'react'

import { ensureNumber, ensureString, ensureBoolean, ensureObject, processOptions, ensureVectorArray } from 'util'

import { SvgPortal } from '../../DrawingContext'

import { useRefWithEventHandlers, filterEventHandlers, getCurvePathThrough, getCurvePathAlong } from './util'
import { Line } from './Line'

const defaultStyle = Line.defaultStyle

const defaultCurve = {
	...Line.defaultProps,
	className: 'curve',
	through: true,
	part: 1,
	spread: undefined,
}

// Curve draws a smooth curve along/through a set of points. For curving, you can either give a "part" (default), where the part indicates the amount of curve (0 being sharp corners, 1 being fully curve), or a "spread", where the spread value (given in pixels) more or less functions as curve radius. (An important difference: for a "part" longer line segments get large curve spaces, but for "spread" the radius is consistent.) Another important parameter is the "through" parameter (default true), which can be turned off to only curve along the given points.
export const Curve = forwardRef((props, ref) => {
	// Process the input.
	let { points, spread, part, through, close, className, style } = processOptions(props, defaultCurve)
	points = ensureVectorArray(points, 2)
	spread = (spread === undefined ? spread : ensureNumber(spread, true))
	part = ensureNumber(part)
	through = ensureBoolean(through)
	close = ensureBoolean(close)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the line.
	const path = (through ? getCurvePathThrough : getCurvePathAlong)(points, close, part, spread)
	return <SvgPortal>
		<path ref={ref} className={className} style={{ ...defaultStyle, ...style }} d={path} {...filterEventHandlers(props)} />
	</SvgPortal>
})
Curve.defaultStyle = defaultStyle
Curve.defaultProps = defaultCurve
Curve.displayName = 'Curve'
