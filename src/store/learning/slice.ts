/**
 * Learning store slice.
 */

import type {
  ModuleState,
  ModuleType,
  ConceptModuleState,
  LearningState,
  SkillModuleState,
  StoredExerciseEvent,
  StoredExerciseInstance,
} from './types';
import {
  createModuleState,
  DEFAULT_MODULE_TYPE,
  normalizeModuleState,
} from './support';
import type { SetState, GetState } from '../utils';

export const initialLearningState: LearningState = {
  modules: {} as Record<string, ModuleState>,
};

export interface LearningActions {
  updateModule: (id: string, data: Partial<ModuleState>) => void;
  getModule: (id: string) => ModuleState;
  resetModule: (id: string, type?: ModuleType) => void;
  getCurrentExerciseInstance: (skillId: string) => StoredExerciseInstance | null;
  getAllExerciseInstances: (skillId: string) => StoredExerciseInstance[];
  getExerciseHistory: (skillId: string, instanceId: string) => StoredExerciseEvent[];
}

export function createLearningActions(
  set: SetState<LearningState>,
  get: GetState<LearningState>,
): LearningActions {
  return {
    updateModule: (id, data) =>
      set((state) => {
        const prev = state.modules[id];
        const nextType = (data.type ?? prev?.type ?? DEFAULT_MODULE_TYPE) as ModuleType;
        let nextState: ModuleState;

        switch (nextType) {
          case 'concept': {
            const previous = prev?.type === 'concept' ? prev : undefined;
            nextState = {
              ...createModuleState(id, 'concept'),
              ...(previous ?? {}),
              ...(data as Partial<ConceptModuleState>),
              id,
              type: 'concept',
              lastAccessed: Date.now(),
            };
            break;
          }
          case 'skill':
          default: {
            const previous = prev?.type === 'skill' ? prev : undefined;
            const incoming = data as Partial<SkillModuleState>;
            const baseSkill = createModuleState(id, 'skill') as SkillModuleState;
            const nextSkill: SkillModuleState = {
              ...baseSkill,
              ...(previous ?? {}),
              ...incoming,
              id,
              type: 'skill',
              lastAccessed: Date.now(),
              exercises:
                incoming.exercises ?? previous?.exercises ?? baseSkill.exercises,
              numSolved: incoming.numSolved ?? previous?.numSolved ?? baseSkill.numSolved,
              understood:
                incoming.understood ?? previous?.understood ?? baseSkill.understood,
            };
            nextState = nextSkill;
            break;
          }
        }
        return {
          modules: {
            ...state.modules,
            [id]: nextState,
          },
        };
      }),

    getModule: (id) => {
      const existing = get().modules[id];
      return existing ?? createModuleState(id);
    },

    resetModule: (id, type) =>
      set((state) => {
        const targetType = (type ?? state.modules[id]?.type ?? DEFAULT_MODULE_TYPE) as ModuleType;
        return {
          modules: {
            ...state.modules,
            [id]: createModuleState(id, targetType),
          },
        };
      }),

    getCurrentExerciseInstance: (skillId) => {
      const module = get().modules[skillId];
      if (!module || module.type !== 'skill') {
        return null;
      }
      return module.exercises[module.exercises.length - 1] ?? null;
    },

    getAllExerciseInstances: (skillId) => {
      const module = get().modules[skillId];
      if (!module || module.type !== 'skill') {
        return [];
      }
      return [...module.exercises];
    },

    getExerciseHistory: (skillId, instanceId) => {
      const module = get().modules[skillId];
      if (!module || module.type !== 'skill') {
        return [];
      }
      const instance = module.exercises.find((exercise) => exercise.id === instanceId);
      return instance?.events ?? [];
    },
  };
}

export { normalizeModuleState };
