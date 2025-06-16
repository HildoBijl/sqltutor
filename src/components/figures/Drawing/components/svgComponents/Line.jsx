import { ensureNumber, ensureString, ensureBoolean, ensureObject, processOptions, removeProperties, ensureVectorArray } from 'util'
import { themeColor } from 'components'

import { SvgPortal } from '../../DrawingContext'

import { defaultObject, useRefWithEventHandlers, filterEventHandlers, getLinePath, preprocessPoints } from './util'
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
	color: themeColor,
	arrow: undefined,
	startArrow: undefined,
	endArrow: undefined,
	className: 'line',
}

// The Line function renders are line in SVG. 
export function Line(props) {
	// When the line does not have arrows, just render the line.
	let startArrowDef = props.startArrow || props.arrow
	let endArrowDef = props.endArrow || props.arrow
	if (!startArrowDef && !endArrowDef)
		return <LineWithoutArrowHead {...props} />

	// Preprocess the points to account for the arrow heads.
	props = processOptions(props, defaultLine)
	const { points, startArrow, endArrow } = preprocessPoints(props, startArrowDef, endArrowDef, ArrowHead.pullIn)

	// Render a group with a line and arrow heads.
	return <Group ref={props.ref}>
		<LineWithoutArrowHead {...removeProperties({ ...props, points }, ['ref', 'startArrow', 'endArrow', 'arrow'])} />
		{startArrowDef && <ArrowHead {...startArrow} />}
		{endArrowDef && <ArrowHead {...endArrow} />}
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
