/**
 * Derived hooks for the app store.
 */

import { useEffect, useState } from 'react';

import { useAppStore } from './useAppStore';

export function useIsStoreReady() {
  const hasHydrated = useAppStore((state) => state._hasHydrated);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (hasHydrated) {
      const timer = setTimeout(() => setIsReady(true), 0);
      return () => clearTimeout(timer);
    }
  }, [hasHydrated]);

  return isReady;
}
