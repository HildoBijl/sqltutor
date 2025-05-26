import { ensureNumber, ensureString, ensureBoolean, ensureObject, processOptions, removeProperties, ensureVectorArray } from 'util'

import { SvgPortal } from '../../DrawingContext'

import { useRefWithEventHandlers, filterEventHandlers, getCurvePathThrough, getCurvePathAlong, preprocessPoints } from './util'
import { Group } from './Group'
import { ArrowHead } from './ArrowHead'
import { Line } from './Line'

const defaultStyle = Line.defaultStyle

const defaultCurve = {
	...Line.defaultProps,
	className: 'curve',
	through: false,
	part: 1,
	spread: undefined,
}

// Curve draws a smooth curve along/through a set of points. For curving, you can either give a "part" (default), where the part indicates the amount of curve (0 being sharp corners, 1 being fully curve), or a "spread", where the spread value (given in pixels) more or less functions as curve radius. (An important difference: for a "part" longer line segments get large curve spaces, but for "spread" the radius is consistent.) Another important parameter is the "through" parameter (default true), which can be turned off to only curve along the given points.
export function Curve(props) {
	// When the curve does not have arrows, just render the line.
	let startArrowDef = props.startArrow || props.arrow
	let endArrowDef = props.endArrow || props.arrow
	if (!startArrowDef && !endArrowDef)
		return <CurveWithoutArrowHead {...props} />

	// Preprocess the points to account for the arrow heads.
	props = processOptions(props, defaultCurve)
	const { points, startArrow, endArrow } = preprocessPoints(props, startArrowDef, endArrowDef, ArrowHead.pullIn)

	// Render a group with a curve and arrow heads.
	return <Group ref={props.ref}>
		<CurveWithoutArrowHead {...removeProperties({ ...props, points }, ['ref', 'startArrow', 'endArrow', 'arrow'])} />
		{startArrowDef && <ArrowHead {...startArrow} />}
		{endArrowDef && <ArrowHead {...endArrow} />}
	</Group>
}
Curve.defaultStyle = defaultStyle
Curve.defaultProps = defaultCurve

// CurveWithoutArrowHead is a regular SVG curve without any arrows at the ends.
export function CurveWithoutArrowHead(props) {
	// Process the input.
	props = processOptions(props, defaultCurve)
	let { points, spread, part, through, close, size, color, className, style, ref } = props
	points = ensureVectorArray(points, 2)
	spread = (spread === undefined ? spread : ensureNumber(spread, true))
	part = ensureNumber(part)
	through = ensureBoolean(through)
	close = ensureBoolean(close)
	ensureNumber(size, true)
	ensureString(color)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the curve.
	const path = (through ? getCurvePathThrough : getCurvePathAlong)(points, close, part, spread)
	return <SvgPortal>
		<path ref={ref} className={className} style={{ ...defaultStyle(props), ...style }} d={path} {...filterEventHandlers(props)} />
	</SvgPortal>
}
Curve.defaultStyle = defaultStyle
Curve.defaultProps = defaultCurve
