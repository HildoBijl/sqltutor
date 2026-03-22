/**
 * Persistence helpers for the learning slice.
 */

import type { ModuleState, LearningState } from './types';
import { normalizeModuleState } from './support';

export interface PersistedLearning {
  modules?: Record<string, Partial<ModuleState> | ModuleState>;
}

export function partializeLearning(state: LearningState): PersistedLearning {
  return {
    modules: state.modules,
  };
}

export function rehydrateLearning(
  state: LearningState,
  persisted: PersistedLearning | undefined,
): void {
  const rawModules = persisted?.modules;
  if (!rawModules) {
    return;
  }

  state.modules = Object.fromEntries(
    Object.entries(rawModules).map(([id, value]) => [
      id,
      normalizeModuleState(id, value as Partial<ModuleState> | undefined),
    ]),
  );
}
