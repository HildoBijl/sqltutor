import { keysToObject } from '../javascript'
import { Vector } from '../geometry'

// getEventPosition takes an event and gives the coordinates (client) at which it happens. It does this by return a vector to said point. On a touch event, it extracts the first touch.
export function getEventPosition(event) {
	const obj = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]) || event
	if (obj.clientX === undefined || obj.clientY === undefined)
		return null
	return new Vector(obj.clientX, obj.clientY)
}

// getUtilKeys gets the utility keys (shift, ctrl, alt) status from an event.
export function getUtilKeys(event) {
	return keysToObject(['shift', 'ctrl', 'alt'], key => event[`${key}Key`])
}

// getWindowSize returns the size of the window at the current moment.
export function getWindowSize() {
	return {
		width: window.innerWidth,
		height: window.innerHeight,
	}
}

// getTextNodes takes a DOM object and finds all text nodes in it.
export function getTextNodes(element) {
	if (!element)
		return []
	if (element.nodeType === 3)
		return [element]
	return [...element.childNodes].map(child => getTextNodes(child)).flat()
}
