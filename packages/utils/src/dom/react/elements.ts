import { useState, useCallback } from 'react'

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
