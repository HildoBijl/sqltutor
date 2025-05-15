import { useState, useCallback, useEffect, useRef, useReducer } from 'react'
import { createPortal } from 'react-dom'
import useResizeObserver from '@react-hook/resize-observer'

import { ensureConsistency } from '../javascript'

import { getWindowSize, getEventPosition, getUtilKeys } from './dom'

// useWindowSize is a hook that gives the window size and updates it when changed.
export function useWindowSize() {
	const [windowSize, setWindowSize] = useState(getWindowSize())

	// Set up a listener that updates the window size when it changes.
	const updateWindowSize = useCallback(() => setWindowSize(getWindowSize()), [])
	useEventListener('resize', updateWindowSize, window)

	return windowSize
}

// useLatest gives a ref object whose value always equals the given value.
export function useLatest(value, initialValue = value) {
	const ref = useRef(initialValue)
	ref.current = value
	return ref
}

// useConsistentValue will check if the given value is the same as previously. If the reference changes, but a deepEquals check still results in the same object, the same reference will be maintained.
export function useConsistentValue(value) {
	const ref = useRef()
	ref.current = ensureConsistency(value, ref.current)
	return ref.current
}

// useEventListener sets up event listeners for the given elements, executing the given handler. It ensures to efficiently deal with registering and unregistering listeners. The element parameter can be a DOM object or an array of DOM objects. It is allowed to insert ref objects whose "current" parameter is a DOM object. In addition, the eventName attribute may be an array. The handler may be a single function (in which case it's used for all eventNames) or an array with equal length as the eventName array.
export function useEventListener(eventName, handler, elements = window, options = {}) {
	// If the handler changes, remember it within the ref. This allows us to change the handler without having to reregister listeners.
	eventName = useConsistentValue(eventName)
	const handlerRef = useLatest(handler)
	elements = useConsistentValue(elements)
	options = useConsistentValue(options)

	// Ensure that the elements parameter is an array of existing objects.
	elements = (Array.isArray(elements) ? elements : [elements])
	elements = elements.map(element => {
		if (!element)
			return false // No element. Throw it out.
		if (element.addEventListener)
			return element // The element can listen. Keep it.
		if (element.current && element.current.addEventListener)
			return element.current // There is a "current" property that can listen. The object is most likely a ref.
		return false // No idea. Throw it out.
	})
	elements = elements.filter(element => element) // Throw out non-existing elements or elements without an event listener.
	elements = useConsistentValue(elements)

	// Set up the listeners using another effect.
	useEffect(() => {
		// Set up redirecting handlers (one for each event name) which calls the latest functions in the handlerRef. 
		const eventNames = Array.isArray(eventName) ? eventName : [eventName]
		const redirectingHandlers = eventNames.map((_, index) => {
			return (event) => {
				const handler = handlerRef.current
				const currHandler = Array.isArray(handler) ? handler[index] : handler
				currHandler(event)
			}
		})

		// Add event listeners for each of the handlers, to each of the elements.
		eventNames.forEach((eventName, index) => {
			const redirectingHandler = redirectingHandlers[index]
			elements.forEach(element => element.addEventListener(eventName, redirectingHandler, options))
		})

		// Make sure to remove all handlers upon a change in settings or upon a dismount.
		return () => {
			eventNames.forEach((eventName, index) => {
				const redirectingHandler = redirectingHandlers[index]
				elements.forEach(element => element.removeEventListener(eventName, redirectingHandler))
			})
		}
	}, [eventName, handlerRef, elements, options]) // Reregister only when the event type or the listening objects change.
}

// useEventListeners takes an object like { mouseenter: (evt) => {...}, mouseleave: (evt) => {...} } and applies event listeners to it.
export function useEventListeners(handlers, elements, options) {
	useEventListener(Object.keys(handlers), Object.values(handlers), elements, options)
}

// useRefWithEventListeners takes an object like { mouseenter: (evt) => {...}, mouseleave: (evt) => {...} } and returns a ref. If the ref is coupled to a DOM object, this DOM object listens to the relevant events.
export function useRefWithEventListeners(handlers, options) {
	const ref = useRef()
	useEventListeners(handlers, ref, options)
	return ref
}

// useStableCallback is like useCallback(func, []) but then can have dependencies without giving warnings. It's a constant-reference function that just looks up which function is registered to it whenever it's called. If any of the optional dependencies changes, then the callback is changed though.
export function useStableCallback(func, dependencies) {
	dependencies = useConsistentValue(dependencies)
	const funcRef = useLatest(func) // eslint-disable-next-line react-hooks/exhaustive-deps
	return useCallback((...args) => funcRef.current(...args), [funcRef, dependencies])
}

// useStaggeredFunction turns a function into a staggered function. First of all, when calling the function, it's not called directly, but on a zero-timeout. Second of all, if it is called multiple times before being executed, it's only executed once.
export function useStaggeredFunction(func) {
	const funcRef = useLatest(func)
	const timeoutRef = useRef()
	return useStableCallback((...args) => {
		if (timeoutRef.current === undefined) {
			timeoutRef.current = setTimeout(() => {
				func(...args)
				timeoutRef.current = undefined
			}, [timeoutRef])
		}
	}, [funcRef, timeoutRef])
}

// useMouseData returns the last-known data related to mouse motion, with the position in client coordinates. The format is { position: new Vector(x, y), keys: { shift: true, alt: false, ctrl: false } }.
export function useMouseData() {
	const [data, setData] = useState({})

	// Track the position of the mouse.
	const storeData = (event) => setData({ position: getEventPosition(event), keys: getUtilKeys(event) })
	useEventListener(['mousemove', 'touchstart', 'touchmove'], storeData)

	// Track additional key-down/up for the utility keys.
	const processKeyPress = (event) => setData(data => ({ ...data, keys: getUtilKeys(event) }))
	useEventListener(['keydown', 'keyup'], processKeyPress)

	// Return the known data.
	return data
}

// useMousePosition returns the position of the mouse in client coordinates, as a Vector.
export function useMousePosition() {
	return useMouseData().position
}

// useBoundingClientRect takes an element and tracks the BoundingClientRect. It only updates it on changes to the element and on scrolls, improving efficiency.
export function useBoundingClientRect(element) {
	const [rect, setRect] = useState(null)

	// Create a handler that updates the rect.
	const updateElementPosition = useStaggeredFunction(() => {
		if (element)
			setRect(element.getBoundingClientRect())
	}, [element, setRect])

	// Listen for updates to the rect.
	useEffect(() => updateElementPosition(), [element, updateElementPosition]) // Changes in the rectangle.
	useResizeObserver(window?.document?.body, updateElementPosition) // Window/body resize.
	useResizeObserver(element, updateElementPosition) // Element resize.
	useEventListener('scroll', updateElementPosition) // Window scrolling.
	useEventListener('swipe', updateElementPosition) // Swiper swiping.
	useEventListener('swipeEnd', updateElementPosition) // Swiper swiping.

	// On a first run the rect may not be known yet. Calculate it directly.
	if (element && !rect) {
		const actualRect = element.getBoundingClientRect()
		setRect(actualRect)
		return actualRect
	}

	// Normal case: return the rectangle.
	return rect
}

// useForceUpdate gives you a force update function, which is useful in some extreme cases.
export function useForceUpdate() {
	return useReducer(() => ({}))[1]
}

// useForceUpdateEffect forces an update of the component as an effect, updating it after its render. This is useful if we need an update after the references have been established.
export function useForceUpdateEffect() {
	const forceUpdate = useForceUpdate()
	useEffect(() => forceUpdate(), [forceUpdate])
}

// Portal takes a target parameter - a DOM object - and then renders the children in there. It checks when the target changes and rerenders when that happens.
export function Portal({ target, children }) {
	return target ? createPortal(children, target) : null
}
