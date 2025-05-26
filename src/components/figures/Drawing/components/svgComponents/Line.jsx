import { firstOf, lastOf, ensureNumber, ensureString, ensureBoolean, ensureObject, processOptions, removeProperties, ensureVectorArray, Span } from 'util'

import { SvgPortal } from '../../DrawingContext'

import { defaultObject, useRefWithEventHandlers, filterEventHandlers, getLinePath } from './util'
import { Group } from './Group'
import { ArrowHead } from './ArrowHead'

const defaultStyle = props => ({
	fill: 'none',
	stroke: props.color,
	strokeWidth: props.size,
})

const defaultLine = {
	...defaultObject,
	points: undefined,
	close: false,
	size: 2,
	color: 'black',
	arrow: undefined,
	startArrow: undefined,
	endArrow: undefined,
	className: 'line',
}

// The Line function renders are line in SVG. 
export function Line(props) {
	// When the line does not have arrows, just render the line.
	let startArrow = props.startArrow || props.arrow
	let endArrow = props.endArrow || props.arrow
	if (!startArrow && !endArrow)
		return <LineWithoutArrowHead {...props} />

	// Extract and check some properties.
	let { points, size, color, ref } = processOptions(props, defaultLine)
	points = ensureVectorArray(points, 2)
	if (points.length < 2)
		throw new Error(`Invalid Line properties: cannot add arrow heads to lines consisting of less than two points.`)
	size = ensureNumber(size, true)
	color = ensureString(color)

	// Find the start and end point of the line. Shift these positions a bit inwards to draw the lines.
	const startSpan = new Span({ start: firstOf(points, 1), end: firstOf(points) })
	const endSpan = new Span({ start: lastOf(points, 1), end: lastOf(points) })
	if (startArrow) {
		startArrow = { position: startSpan.end, angle: startSpan.angle, size, color, ...startArrow }
		const arrowSize = ensureNumber(startArrow.size, true)
		const lineStart = startSpan.end.subtract(startSpan.vector.normalize().multiply(ArrowHead.pullIn * arrowSize))
		points = [lineStart, ...points.slice(1)]
	}
	if (endArrow) {
		endArrow = { position: endSpan.end, angle: endSpan.angle, size, color, ...endArrow }
		const arrowSize = ensureNumber(endArrow.size, true)
		const lineEnd = endSpan.end.subtract(endSpan.vector.normalize().multiply(ArrowHead.pullIn * arrowSize))
		points = [...points.slice(0, -1), lineEnd]
	}

	// Render a group with a line and arrow heads.
	return <Group ref={ref}>
		<LineWithoutArrowHead {...removeProperties({ ...props, points }, ['ref', 'startArrow', 'endArrow', 'arrow'])} />
		{startArrow && <ArrowHead {...startArrow} />}
		{endArrow && <ArrowHead {...endArrow} />}
	</Group>
}
Line.defaultStyle = defaultStyle
Line.defaultProps = defaultLine

// The LineWithoutArrowHead is just a line (a path) without any potential arrow heads.
function LineWithoutArrowHead(props) {
	// Process the input.
	let { points, close, size, color, className, style, ref } = processOptions(props, defaultLine)
	points = ensureVectorArray(points, 2)
	close = ensureBoolean(close)
	ensureNumber(size, true)
	ensureString(color)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the line.
	const path = getLinePath(points, close)
	return <SvgPortal>
		<path ref={ref} className={className} style={{ ...defaultStyle(props), ...style }} d={path} {...filterEventHandlers(props)} />
	</SvgPortal>
}
