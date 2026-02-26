/**
 * Learning store slice.
 */

import type {
  ComponentState,
  ComponentType,
  ConceptComponentState,
  PlaygroundComponentState,
  SkillComponentState,
  StoredExerciseEvent,
  StoredExerciseInstance,
} from './types';
import {
  createComponentState,
  DEFAULT_COMPONENT_TYPE,
  normalizeComponentState,
} from './support';

export const initialLearningState = {
  components: {} as Record<string, ComponentState>,
};

export interface LearningActions {
  updateComponent: (id: string, data: Partial<ComponentState>) => void;
  getComponent: (id: string) => ComponentState;
  resetComponent: (id: string, type?: ComponentType) => void;
  getCurrentExerciseInstance: (skillId: string) => StoredExerciseInstance | null;
  getAllExerciseInstances: (skillId: string) => StoredExerciseInstance[];
  getExerciseHistory: (skillId: string, instanceId: string) => StoredExerciseEvent[];
}

export function createLearningActions(
  set: (fn: (state: { components: Record<string, ComponentState> }) => Partial<{ components: Record<string, ComponentState> }>) => void,
  get: () => { components: Record<string, ComponentState> },
): LearningActions {
  return {
    updateComponent: (id, data) =>
      set((state) => {
        const prev = state.components[id];
        const nextType = (data.type ?? prev?.type ?? DEFAULT_COMPONENT_TYPE) as ComponentType;
        let nextState: ComponentState;

        switch (nextType) {
          case 'concept': {
            const previous = prev?.type === 'concept' ? prev : undefined;
            nextState = {
              ...createComponentState(id, 'concept'),
              ...(previous ?? {}),
              ...(data as Partial<ConceptComponentState>),
              id,
              type: 'concept',
              lastAccessed: Date.now(),
            };
            break;
          }
          case 'playground': {
            const previous = prev?.type === 'playground' ? prev : undefined;
            nextState = {
              ...createComponentState(id, 'playground'),
              ...(previous ?? {}),
              ...(data as Partial<PlaygroundComponentState>),
              id,
              type: 'playground',
              lastAccessed: Date.now(),
            };
            break;
          }
          case 'skill':
          default: {
            const previous = prev?.type === 'skill' ? prev : undefined;
            const incoming = data as Partial<SkillComponentState>;
            const baseSkill = createComponentState(id, 'skill') as SkillComponentState;
            const nextSkill: SkillComponentState = {
              ...baseSkill,
              ...(previous ?? {}),
              ...incoming,
              id,
              type: 'skill',
              lastAccessed: Date.now(),
              instances: incoming.instances ?? previous?.instances ?? baseSkill.instances,
              numSolved: incoming.numSolved ?? previous?.numSolved ?? baseSkill.numSolved,
              currentInstanceId:
                incoming.currentInstanceId ?? previous?.currentInstanceId ?? baseSkill.currentInstanceId,
            };
            nextState = nextSkill;
            break;
          }
        }
        return {
          components: {
            ...state.components,
            [id]: nextState,
          },
        };
      }),

    getComponent: (id) => {
      const existing = get().components[id];
      return existing ?? createComponentState(id);
    },

    resetComponent: (id, type) =>
      set((state) => {
        const targetType = (type ?? state.components[id]?.type ?? DEFAULT_COMPONENT_TYPE) as ComponentType;
        return {
          components: {
            ...state.components,
            [id]: createComponentState(id, targetType),
          },
        };
      }),

    getCurrentExerciseInstance: (skillId) => {
      const component = get().components[skillId];
      if (!component || component.type !== 'skill') {
        return null;
      }
      const { currentInstanceId, instances } = component;
      if (!currentInstanceId) {
        return null;
      }
      return instances[currentInstanceId] ?? null;
    },

    getAllExerciseInstances: (skillId) => {
      const component = get().components[skillId];
      if (!component || component.type !== 'skill') {
        return [];
      }
      return Object.values(component.instances);
    },

    getExerciseHistory: (skillId, instanceId) => {
      const component = get().components[skillId];
      if (!component || component.type !== 'skill') {
        return [];
      }
      return component.instances[instanceId]?.events ?? [];
    },
  };
}

export { normalizeComponentState };
