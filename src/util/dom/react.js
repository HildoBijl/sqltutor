import { useState, useCallback, useEffect, useRef, useReducer, isValidElement } from 'react'
import { createPortal } from 'react-dom'
import useResizeObserver from '@react-hook/resize-observer'

import { ensureConsistency } from '../javascript'

import { getWindowSize, getEventPosition, getUtilKeys, getTextNodes } from './dom'

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

// useRefWithElement will return the element of a ref. Special is that it also forces the component to update once the ref has been established. It returns an array [elementRef, element], where the ref must be inserted into the respective DOM element. The ref is actually a function used to update the element.
export function useRefWithElement() {
	const [element, setElement] = useState()
	const onRefChange = useCallback(node => setElement(node), [])
	return [onRefChange, element]
}

// useEnsureRef takes a ref object that comes in and assume that it actually is a ref. This is useful when forwarding a ref and wanting to make sure you get an existing ref right at the start.
export function useEnsureRef(ref) {
	const backupRef = useRef()
	return ref || backupRef
}

// useConsistentValue will check if the given value is the same as previously. If the reference changes, but a deepEquals check still results in the same object, the same reference will be maintained.
export function useConsistentValue(value) {
	const ref = useRef()
	ref.current = ensureConsistency(value, ref.current)
	return ref.current
}

// useEqualRefOnEquality will check if a value equals its previous value. If so, the reference is maintained. The difference between useConsistentValue and this function is that this has its own equality check.
export function useEqualRefOnEquality(value, equalityCheck = (a, b) => a && a.equals(b)) {
	const ref = useRef()
	if (value !== ref.current && !equalityCheck(value, ref.current))
		ref.current = value
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

// useStaggeredFunction turns a function into a staggered function. First of all, when calling the function, it's not called directly, but on a zero-timeout. Second of all, if it is called multiple times before being executed, it's only executed once. (And then the last given function is executed.)
export function useStaggeredFunction(func) {
	const funcRef = useLatest(func)
	const timeoutRef = useRef()
	return useStableCallback((...args) => {
		if (timeoutRef.current === undefined) {
			timeoutRef.current = setTimeout(() => {
				funcRef.current(...args)
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

// useResizeListener checks when the window or the app field resizes and calls the given callback function then.
export function useResizeListener(callbackFunc, element = document.querySelector('#root')) {
	useResizeObserver(element, () => callbackFunc())
	useEventListener('resize', () => callbackFunc())
}

// useBoundingClientRect takes an array of elements and tracks their BoundingClientRect. It only updates it on changes to the element and on scrolls, improving efficiency.
export function useBoundingClientRects(elements) {
	// Check the input.
	if (!Array.isArray(elements))
		throw new Error(`Invalid elements received: expected an array, but received something of type "${typeof elements}".`)

	const [rects, setRects] = useState()
	elements = useConsistentValue(elements)

	// Create a handler that calculates the rects.
	const getRects = () => elements.map(element => {
		if (!element)
			return element
		if (element.nodeType === 3) {
			const range = document.createRange()
			range.selectNode(element)
			const rect = range.getBoundingClientRect()
			range.detach() // For efficiency.
			return rect
		}
		return element.getBoundingClientRect()
	})

	// Create a handler that updates the rect.
	const updateElementPosition = useStaggeredFunction(() => {
		setRects(getRects())
	})

	// Listen for updates to the rect.
	useEffect(() => updateElementPosition(), [elements, updateElementPosition]) // Changes in the elements.
	useResizeListener(updateElementPosition, elements.find(element => element?.nodeType === 1)) // Element/window resize. Only the first Element is used, since the resize observer cannot handle multiple elements.
	useEventListener('scroll', updateElementPosition) // Window scrolling.
	useEventListener('swipe', updateElementPosition) // Swiper swiping.
	useEventListener('swipeEnd', updateElementPosition) // Swiper swiping.

	// On a first run the rect may not be known yet. Calculate it directly.
	if (!rects) {
		const actualRect = getRects()
		setRects(actualRect)
		return actualRect
	}

	// Normal case: return the rectangle.
	return rects
}

// useBoundingClientRect takes an element and tracks the BoundingClientRect. It only updates it on changes to the element and on scrolls, improving efficiency.
export function useBoundingClientRect(element) {
	return useBoundingClientRects([element])[0]
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

// ensureReactElement ensures that the given parameter is a React-type element. If not, it throws an error. On success it returns the element.
export function ensureReactElement(element, allowString = true, allowNumber = true) {
	if (!isValidElement(element) && (!allowString || typeof element !== 'string') && (!allowNumber || typeof element !== 'number'))
		throw new Error(`Invalid React element: expected a valid React element but received something of type "${typeof element}".`)
	return element
}

// Portal takes a target parameter - a DOM object - and then renders the children in there. It checks when the target changes and rerenders when that happens.
export function Portal({ target, children }) {
	return target ? createPortal(children, target) : null
}

// useTextNode takes an element (a container) and finds the text node in it satisfying a given condition. Optionally, an offset can be given if multiple elements satisfy that condition. If the condition is a string, it finds the text node containing that string.
export function useTextNode(container, condition, offset = 0) {
	// On a string condition, turn it into a function that filters based on whether the content contains that string.
	if (typeof condition === 'string') {
		const text = condition
		condition = node => node.textContent.includes(text)
	}

	// Get and filter the text nodes.
	return getTextNodes(container).filter(condition)[offset]
}

// useAnimation takes an animation function and calls it several times per second with both (1) the time since mounting, and (2) the time difference dt since the last call. On the first call dt is undefined.
export function useAnimation(animationFunc) {
	const startTimeRef = useRef()
	const previousTimeRef = useRef()
	const requestRef = useRef()
	const animationFuncRef = useLatest(animationFunc)

	// Set up an animate function that keeps calling itself.
	const animate = useCallback(pageTime => {
		// Calculate all relevant times.
		let dt, time
		if (startTimeRef.current === undefined) {
			startTimeRef.current = pageTime // Remember the starting time.
			time = 0
		} else {
			time = pageTime - startTimeRef.current
			dt = pageTime - previousTimeRef.current
		}
		previousTimeRef.current = pageTime

		// Call the given animation function, and then call itself a tiny bit later.
		animationFuncRef.current(time, dt)
		requestRef.current = requestAnimationFrame(animate)
	}, [startTimeRef, previousTimeRef, animationFuncRef])

	// Start the animation cycle upon mounting.
	useEffect(() => {
		requestRef.current = requestAnimationFrame(animate)
		return () => cancelAnimationFrame(requestRef.current)
	}, [requestRef, animate])
}
