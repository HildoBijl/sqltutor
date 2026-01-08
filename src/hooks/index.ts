/**
 * General-purpose hooks (not database-specific).
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
export { useState, useEffect, useCallback, useMemo, useRef };

/**
 * Debounce a value by the specified delay.
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
