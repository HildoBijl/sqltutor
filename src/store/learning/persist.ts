/**
 * Persistence helpers for the learning slice.
 */

import type { ComponentState, LearningState } from './types';
import { normalizeComponentState } from './support';

export interface PersistedLearning {
  components?: Record<string, Partial<ComponentState> | ComponentState>;
}

export function partializeLearning(state: LearningState): PersistedLearning {
  return {
    components: state.components,
  };
}

export function rehydrateLearning(
  state: LearningState,
  persisted: PersistedLearning | undefined,
): void {
  const rawComponents = persisted?.components;
  if (!rawComponents) {
    return;
  }

  state.components = Object.fromEntries(
    Object.entries(rawComponents).map(([id, value]) => [
      id,
      normalizeComponentState(id, value as Partial<ComponentState> | undefined),
    ]),
  );
}

