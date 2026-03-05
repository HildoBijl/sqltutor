import { useEffect, useState } from 'react';

import { useAppStore } from './useAppStore';

export function useIsStoreReady() {
  const state = useAppStore((state) => state);
  console.log(state)
  const hasHydrated = useAppStore((state) => state.main._hasHydrated);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (hasHydrated) {
      const timer = setTimeout(() => setIsReady(true), 0);
      return () => clearTimeout(timer);
    }
  }, [hasHydrated]);

  return isReady;
}
