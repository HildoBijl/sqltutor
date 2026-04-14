/**
 * Derived hooks for store hydration.
 */

import { useLearningStore } from './learning';
import { useSettingsStore } from './settings';
import { useSkillTreeSettingsStore } from './skillTreeSettings';

export function useHasHydrated() {
  const settingsHydrated = useSettingsStore((state) => state._hasHydrated);
  const learningHydrated = useLearningStore((state) => state._hasHydrated);
  const skillTreeSettingsHydrated = useSkillTreeSettingsStore((state) => state._hasHydrated);
  return settingsHydrated && learningHydrated && skillTreeSettingsHydrated;
}
