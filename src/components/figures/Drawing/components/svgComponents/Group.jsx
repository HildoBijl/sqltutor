import { ensureNumber, ensureString, ensureBoolean, ensureObject, processOptions, Vector, ensureVector } from 'util'

import { useDrawingId, SvgPortal } from '../../DrawingContext'

import { defaultObject, useRefWithEventHandlers } from './util'

const defaultGroup = {
	...defaultObject,
	position: Vector.zero,
	rotate: 0,
	scale: 1,
	overflow: true,
	children: null,
}

// Group sets up a groups with a given position, rotation and scale. (In that order: it's first translated, then rotated and then scaled.)
export function Group(props) {
	// Process the input.
	let { position, rotate, scale, overflow, className, style, children, ref } = processOptions(props, defaultGroup)
	position = ensureVector(position, 2)
	rotate = ensureNumber(rotate)
	scale = ensureNumber(scale)
	overflow = ensureBoolean(overflow)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the group with the right transform property.
	const drawingId = useDrawingId()
	return <SvgPortal>
		<g ref={ref} className={className} style={{
			...style,
			clipPath: overflow ? '' : `url(#noOverflow${drawingId})`,
			transform: `translate(${position.x}px, ${position.y}px) rotate(${rotate * 180 / Math.PI}deg) scale(${scale}) ${style.transform || ''}`,
		}}>
			{children}
		</g>
	</SvgPortal>
}
Group.defaultProps = defaultGroup
