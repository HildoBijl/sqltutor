import { ensureString, ensureObject, processOptions, ensureVector } from 'util'

import { SvgPortal } from '../../DrawingContext'

import { defaultObject, useRefWithEventHandlers, filterEventHandlers } from './util'

const defaultText = {
	...defaultObject,
	className: 'text',
	position: undefined,
	anchor: 'middle', // Can be start, middle or end; see the text-anchor SVG parameter.
	children: undefined,
}

export function Text(props) {
	// Process the input.
	let { position, anchor, className, style, children, ref } = processOptions(props, defaultText)
	position = ensureVector(position, 2)
	anchor = ensureString(anchor)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Only accept a string as a child.
	if (typeof children !== 'string')
		throw new Error(`Invalid Text parameter: expected a string as input for the Text component, but received something of type "${typeof children}".`)

	// Set up the text object.
	return <SvgPortal>
		<text ref={ref} textAnchor={anchor} className={className} style={style} x={position.x} y={position.y} {...filterEventHandlers(props)}>{children}</text>
	</SvgPortal>
}
Text.defaultProps = defaultText
