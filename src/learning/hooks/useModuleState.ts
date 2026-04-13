/**
 * Hook for reading module state from the store.
 * Learning-specific.
 */

import {
  useLearningStore,
  createModuleState,
  type ModuleState,
} from '@/store';
import type { ModuleType } from '@/store';

export function useModuleState<State extends ModuleState = ModuleState>(
  moduleId: string,
  typeHint: ModuleType,
) {
  return useLearningStore((state) => {
    const existing = state.modules[moduleId];
    if (existing) {
      return existing as State;
    }
    return createModuleState(moduleId, typeHint) as State;
  });
}
