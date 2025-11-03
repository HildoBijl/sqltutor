import { useState, useCallback, ReactNode, isValidElement } from 'react'
import { createPortal } from 'react-dom'

import { getTextNodes } from '../dom'

// Get a tuple [ref, element]. Put the ref into a DOM object, and element will be the corresponding DOM element.
export function useRefWithElement<T extends HTMLElement | null = HTMLElement>(): [(node: T) => void, T | null] {
	const [element, setElement] = useState<T | null>(null);
	const onRefChange = useCallback((node: T) => setElement(node), []);
	return [onRefChange, element];
}

// Ensure that the given parameter is a React-type element.
export function ensureReactElement(element: ReactNode, allowString = true, allowNumber = true): ReactNode {
	if (
		!isValidElement(element) &&
		(!allowString || typeof element !== 'string') &&
		(!allowNumber || typeof element !== 'number')
	)
		throw new Error(`Invalid React element: expected a valid React element but received something of type "${typeof element}".`);
	return element;
}

// Render the children inside the given target element.
interface PortalProps {
  target: HTMLElement | null;
  children: ReactNode;
}
export function Portal({ target, children }: PortalProps) {
  return target ? createPortal(children, target) : null;
}

// From an element (a container), find the text node in it satisfying a given condition. Optionally, an offset can be given if multiple elements satisfy that condition. If the condition is a string, it finds the text node containing that string.
export function useTextNode(
  container: Node | null | undefined,
  condition: ((node: Text) => boolean) | string,
  offset = 0,
): Text | undefined {
	// Normalize the given condition.
  let predicate: (node: Text) => boolean;
  if (typeof condition === 'string') {
    const text = condition;
    predicate = (node: Text) => node.textContent?.includes(text) ?? false;
  } else {
    predicate = condition;
  }

	// Find the respective text node.
  return getTextNodes(container).filter(predicate)[offset];
}
