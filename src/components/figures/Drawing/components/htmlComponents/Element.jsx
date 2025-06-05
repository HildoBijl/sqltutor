import { useCallback, useLayoutEffect } from 'react'
import clsx from 'clsx'

import { ensureNumber, ensureBoolean, ensureObject, processOptions, Vector, ensureVector, useEnsureRef, ensureReactElement, useEqualRefOnEquality, useResizeListener, notSelectable } from 'util'

import { useDrawingData, HtmlPortal } from '../../DrawingContext'

const elementStyle = {
	left: 0,
	position: 'absolute',
	top: 0,
	transformOrigin: '0% 0%',
	zIndex: 0,
}

const defaultElement = {
	children: null,
	position: undefined,
	graphicalPosition: undefined,
	rotate: 0, // Radians.
	scale: 1,
	anchor: new Vector(0.5, 0.5), // Use 0 for left/top and 1 for right/bottom.
	passive: false, // When set to true, the element ignores all mouse events like selecting and pointer events.
	behind: false, // When set to true, the element is placed in the div behind the SVG and not in front.
	style: {},
	className: undefined,
}

export function Element(props) {
	// Check input.
	let { children, position, rotate, scale, anchor, passive, behind, style, ref } = processOptions(props, defaultElement)
	children = ensureReactElement(children)
	position = ensureVector(position, 2)
	rotate = ensureNumber(rotate)
	scale = ensureNumber(scale)
	anchor = ensureVector(anchor, 2)
	passive = ensureBoolean(passive)
	behind = ensureBoolean(behind)
	style = { ...defaultElement.style, ...elementStyle, zIndex: behind ? -1 : 3, ...ensureObject(style) }
	ref = useEnsureRef(ref)

	// Check if mouse events should be ignored.
	if (passive)
		style = { ...style, ...notSelectable, pointerEvents: 'none' }

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
	return <HtmlPortal>
		<div ref={ref} className={clsx('drawingElement', props.className)} style={style}>
			{children}
		</div>
	</HtmlPortal>
}
Element.defaultProps = defaultElement
Element.defaultStyle = elementStyle
