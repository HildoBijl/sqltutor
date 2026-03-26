/**
 * Hook for reading and updating module state from the store.
 * Learning-specific.
 */

import { useCallback } from 'react';

import {
  useLearningStore,
  createModuleState,
  DEFAULT_MODULE_TYPE,
  type ModuleState,
} from '@/store';
import type { ModuleType } from '@/store';

export function useModuleState<State extends ModuleState = ModuleState>(
  moduleId: string,
  typeHint?: ModuleType,
) {
  const module = useLearningStore((state) => {
    const existing = state.modules[moduleId];
    if (existing) {
      return existing as State;
    }
    const fallbackType = (typeHint ?? DEFAULT_MODULE_TYPE) as ModuleType;
    return createModuleState(moduleId, fallbackType) as State;
  });
  const updateModule = useLearningStore((state) => state.updateModule);

  const setModuleState = useCallback(
    (updater: Partial<State> | State | ((prev: State) => Partial<State> | State)) => {
      if (typeof updater === 'function') {
        const currentState =
          (useLearningStore.getState().modules[moduleId] as State | undefined) ??
          (createModuleState(
            moduleId,
            (typeHint ?? DEFAULT_MODULE_TYPE) as ModuleType,
          ) as State);
        const result = updater(currentState);
        updateModule(moduleId, result as Partial<ModuleState>, typeHint);
      } else {
        updateModule(moduleId, updater as Partial<ModuleState>, typeHint);
      }
    },
    [moduleId, typeHint, updateModule],
  );

  return [module, setModuleState] as const;
}
