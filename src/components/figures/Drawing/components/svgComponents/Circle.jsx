import { ensureNumber, ensureString, ensureObject, processOptions, Vector, ensureVector } from 'util'

import { SvgPortal } from '../../DrawingContext'

import { defaultObject, useRefWithEventHandlers, filterEventHandlers } from './util'

const defaultCircle = {
	...defaultObject,
	center: Vector.zero,
	radius: 0,
}

export function Circle(props) {
	// Process the input.
	let { center, radius, className, style, ref } = processOptions(props, defaultCircle)
	center = ensureVector(center, 2)
	radius = ensureNumber(radius, true)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the circle.
	return <SvgPortal>
		<circle ref={ref} cx={center.x} cy={center.y} r={radius} className={className} style={style} {...filterEventHandlers(props)} />
	</SvgPortal>
}
Circle.defaultProps = defaultCircle
