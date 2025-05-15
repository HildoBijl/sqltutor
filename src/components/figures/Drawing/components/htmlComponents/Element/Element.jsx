import { forwardRef, useCallback, useLayoutEffect } from 'react'
import clsx from 'clsx'

import { ensureNumber, ensureBoolean, ensureObject, processOptions, ensureVector, useEnsureRef, ensureReactElement, useEqualRefOnEquality, useResizeListener, notSelectable } from 'util'

import { useDrawingData, HtmlPortal } from '../../../DrawingContext'

import { defaultElement } from './settings'

const elementStyle = {
	left: 0,
	...notSelectable,
	position: 'absolute',
	top: 0,
	transformOrigin: '0% 0%',
	zIndex: 0,
}

export const Element = forwardRef((props, ref) => {
	ref = useEnsureRef(ref)

	// Check input.
	let { children, position, rotate, scale, anchor, ignoreMouse, style } = processOptions(props, defaultElement)
	children = ensureReactElement(children)
	position = ensureVector(position, 2)
	rotate = ensureNumber(rotate)
	scale = ensureNumber(scale)
	anchor = ensureVector(anchor, 2)
	ignoreMouse = ensureBoolean(ignoreMouse)
	style = { ...defaultElement.style, ...ensureObject(style) }

	// Check if mouse events should be ignored.
	if (ignoreMouse)
		style.pointerEvents = 'none'

	// Make sure the vector references remain consistent.
	position = useEqualRefOnEquality(position)
	anchor = useEqualRefOnEquality(anchor)

	// Extract the drawing from the context.
	const { bounds, figure } = useDrawingData()

	// Define a handler that positions the element accordingly.
	const updateElementPosition = useCallback(() => {
		// Can we do anything?
		const element = ref.current
		if (!element || !bounds || !figure?.inner)
			return

		// Calculate the scale at which the figure is drawn.
		const figureRect = figure.inner.getBoundingClientRect()
		const figureScale = figureRect.width / bounds.width

		// Position the element accordingly.
		element.style.transformOrigin = `${anchor.x * 100}% ${anchor.y * 100}%`
		element.style.transform = `
			translate(${-anchor.x * 100}%, ${-anchor.y * 100}%)
			scale(${figureScale})
			translate(${position.x}px, ${position.y}px)
			scale(${scale})
			rotate(${rotate * 180 / Math.PI}deg)
		`
	}, [ref, bounds, figure, position, rotate, scale, anchor])

	// Properly position the element on a change of settings, a change of contents or on a window resize.
	useLayoutEffect(updateElementPosition, [updateElementPosition, children])
	useResizeListener(updateElementPosition)

	// Render the children inside the Drawing HTML contents container.
	return <HtmlPortal><div ref={ref} className={clsx('drawingElement', props.className)} style={{ ...elementStyle, ...style }}>{children}</div></HtmlPortal>
})
Element.displayName = 'Element'
Element.defaultProps = defaultElement
export default Element
