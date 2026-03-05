import type { LearningSlice, LearningState, LearningPersisted, ComponentState } from './types';
import { normalizeComponentState } from './support';
import { createActions } from './createActions';

const initialState: LearningState = {
  components: {} as Record<string, ComponentState>,
};

function partialize(state: LearningState): LearningPersisted {
  return {
    components: state.components,
  };
}

function rehydrate(state: LearningState): void {
  const rawComponents = state?.components;
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

function migrate(state: LearningPersisted, _version: number): LearningPersisted {
  return state
}

export const slice: LearningSlice = {
  key: 'learning',
  initialState,
  createActions,
  partialize,
  rehydrate,
  migrate,
}
