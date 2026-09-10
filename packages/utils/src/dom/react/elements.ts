import { useState, useCallback } from 'react'

import { getTextNodes } from '../dom'

// Get a tuple [ref, element]. Put the ref into a DOM object, and element will be the corresponding DOM element.
export function useRefWithElement<T extends Element | null = Element>(): [(node: T | null) => void, T | null] {
  const [element, setElement] = useState<T | null>(null);
  const onRefChange = useCallback((node: T | null) => setElement(node), []);
  return [onRefChange, element];
}

// Get a tuple [ref, value]. Put the ref into a React object, and value will be the corresponding ref's value (which could be an imperative handle or similar).
export function useRefWithValue<T>(): [(value: T | null) => void, T | null] {
  const [value, setValue] = useState<T | null>(null);
  const refCallback = useCallback((value: T | null) => setValue(value), []);
  return [refCallback, value];
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
