/**
 * Derived hooks for store hydration.
 */

import { useLearningStore } from './learning/store';
import { useSettingsStore } from './settings/store';

export function useHasHydrated() {
  const settingsHydrated = useSettingsStore((state) => state._hasHydrated);
  const learningHydrated = useLearningStore((state) => state._hasHydrated);
  return settingsHydrated && learningHydrated;
}
