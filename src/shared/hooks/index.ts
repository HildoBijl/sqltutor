// Core hooks for the application
export { useDatabase } from './useDatabase';

// Import React hooks for local use within this module,
// then re-export them for convenience from this index.
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
export { useState, useEffect, useCallback, useMemo, useRef };

/**
 * useDebounce - Debounce a value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
