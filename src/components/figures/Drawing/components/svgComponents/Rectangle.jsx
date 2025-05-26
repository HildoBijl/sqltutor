import { ensureNumber, ensureString, ensureObject, processOptions, ensureRectangle as ensureGeometryRectangle } from 'util'

import { SvgPortal } from '../../DrawingContext'

import { defaultObject, useRefWithEventHandlers, filterEventHandlers } from './util'

const defaultRectangle = {
	...defaultObject,
	dimensions: undefined, // A Rectangle object from the Geometry toolbox.
	cornerRadius: 0,
	graphicalCornerRadius: 0,
}

export function Rectangle(props) {
	// Process the input.
	let { dimensions, cornerRadius, className, style, ref } = processOptions(props, defaultRectangle)
	dimensions = ensureGeometryRectangle(dimensions, 2)
	cornerRadius = ensureNumber(cornerRadius)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the circle.
	const { start, vector, end } = dimensions
	return <SvgPortal>
		<rect ref={ref} x={Math.min(start.x, end.x)} y={Math.min(start.y, end.y)} width={Math.abs(vector.x)} height={Math.abs(vector.y)} rx={cornerRadius} className={className} style={style} {...filterEventHandlers(props)} />
	</SvgPortal>
}
Rectangle.defaultProps = defaultRectangle
