import { keysToObject } from '../javascript';
import { Vector } from '../geometry';

// Find the coordinates (client) of a given event, as a Vector. For a touch event, the first touch is used.
export function getEventPosition(event: MouseEvent | TouchEvent | PointerEvent): Vector | undefined {
	const obj = (event instanceof TouchEvent && (event.touches[0] || event.changedTouches[0])) || event;
	const clientX = (obj as any).clientX;
	const clientY = (obj as any).clientY;
	if (clientX === undefined || clientY === undefined)
		return undefined;
	return new Vector(clientX, clientY);
}

// Types for utility keys.
export interface UtilKeys {
	shift: boolean;
	alt: boolean;
	ctrl: boolean;
}

// Determine the status of the utility keys (shift, ctrl, alt) for an event.
export function getUtilKeys(event: MouseEvent | TouchEvent | KeyboardEvent | PointerEvent): UtilKeys {
	return keysToObject(['shift', 'ctrl', 'alt'], key => (event as any)[`${key}Key`]) as UtilKeys;
}

// Find the size of the window at the current moment.
export function getWindowSize(): { width: number; height: number } {
	return {
		width: window.innerWidth,
		height: window.innerHeight,
	};
}

// For a DOM object, set up a list of all textNodes in it.
export function getTextNodes(element: Node | null | undefined): Text[] {
	if (!element)
		return [];
	if (element.nodeType === Node.TEXT_NODE)
		return [element as Text];
	const children = Array.from(element.childNodes);
	return children.flatMap(child => getTextNodes(child));
}
