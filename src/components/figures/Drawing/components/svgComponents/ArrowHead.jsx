import { ensureNumber, ensureString, ensureObject, processOptions, Vector, ensureVector } from 'util'

import { SvgPortal } from '../../DrawingContext'

import { defaultObject, useRefWithEventHandlers } from './util'

const defaultStyle = {
	fill: 'black',
	strokeWidth: 0,
}

const defaultArrowHead = {
	...defaultObject,
	position: Vector.zero,
	angle: 0,
	size: 2,
	color: 'black',
	className: 'arrowHead',
}

// ArrowHead draws an arrowhead in the given container at the given position and with the given angle. It can also be sized up and styled further.
export function ArrowHead(props) {
	// Check input.
	let { position, angle, size, color, className, style, ref } = processOptions(props, defaultArrowHead)
	position = ensureVector(position, 2)
	angle = ensureNumber(angle)
	size = ensureNumber(size)
	color = ensureString(color)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Draw the arrow head shape and position it.
	return <SvgPortal>
		<polygon
			ref={ref}
			points="0 0, -12 -6, -9 0, -12 6"
			className={className}
			style={{
				fill: color,
				transform: `translate(${position.x}px, ${position.y}px) rotate(${angle * 180 / Math.PI}deg) scale(${size / defaultArrowHead.size})`,
				...style,
			}}
		/>
	</SvgPortal>
}
ArrowHead.defaultStyle = defaultStyle
ArrowHead.defaultProps = defaultArrowHead
ArrowHead.pullIn = 3 // This is a factor determining how much the line should be pulled in (for a size 1 line) to make sure the line ends in the proper place in the arrow head.
