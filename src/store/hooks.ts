import { useEffect, useState } from 'react';

import { useAppStore } from './useAppStore';

// Check if the data store has hydrated its data from local storage.
export function useIsStoreReady() {
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

// Get easy access to the settings object.
export function useSettings() {
  return useAppStore(state => state.settings);  
}
