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

// For a given node (Element, Text) find the LayoutRoot: the first parent that is involved in positioning.
export function findLayoutRoot(node: Element | Text | null | undefined, stopAt?: Element): Element | null {
	if (!node)
		return null;

	// Walk up the tree until we find an element establishing layout.
	let el: Element | null = node instanceof Element ? node : node.parentElement;
	while (el) {
		const style = getComputedStyle(el);

		// Skip non-layout participants.
		if (style.display === "contents" || style.position === "fixed") {
			if (el === stopAt)
				break;
			el = el.parentElement;
			continue;
		}

		// These typically establish layout flow
		if (style.display === "block" || style.display === "flex" || style.display === "grid" || style.display === "inline-block")
			return el;

		el = el.parentElement;
	}

	return null;
}

// For a given set of nodes, find all (possibly shared) layout roots.
export function findLayoutRoots(nodes: (Element | Text | null | undefined)[], stopAt?: Element): Element[] {
	const roots = new Set<Element>();
	for (const node of nodes) {
		const root = findLayoutRoot(node, stopAt);
		if (root)
			roots.add(root);
	}
	return [...roots];
}
