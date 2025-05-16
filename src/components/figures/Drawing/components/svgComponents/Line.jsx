import { forwardRef } from 'react'

import { ensureString, ensureBoolean, ensureObject, processOptions, ensureVectorArray } from 'util'

import { SvgPortal } from '../../DrawingContext'

import { defaultObject, useRefWithEventHandlers, filterEventHandlers, getLinePath } from './util'

const defaultStyle = {
	fill: 'none',
	stroke: 'black',
	strokeWidth: 1,
}

const defaultLine = {
	...defaultObject,
	points: undefined,
	close: false,
	className: 'line',
}

export const Line = forwardRef((props, ref) => {
	// Process the input.
	let { points, close, className, style } = processOptions(props, defaultLine)
	points = ensureVectorArray(points, 2)
	close = ensureBoolean(close)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the line.
	const path = getLinePath(points, close)
	return <SvgPortal><path ref={ref} className={className} style={{...defaultStyle, ...style}} d={path} {...filterEventHandlers(props)} /></SvgPortal>
})
Line.defaultStyle = defaultStyle
Line.defaultProps = defaultLine
Line.displayName = 'Line'
