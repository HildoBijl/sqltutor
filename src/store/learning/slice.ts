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

function isSkillModule(
  module: ModuleState | Partial<ModuleState> | undefined,
): module is SkillModuleState {
  if (!module) return false;
  return (
    typeof (module as Partial<SkillModuleState>).numSolved === 'number' ||
    Array.isArray((module as Partial<SkillModuleState>).exercises)
  );
}

export interface LearningActions {
  updateModule: (id: string, data: Partial<ModuleState>, typeHint?: ModuleType) => void;
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
    updateModule: (id, data, typeHint) =>
      set((state) => {
        const prev = state.modules[id];
        const inferredPrevType: ModuleType | undefined = prev
          ? (isSkillModule(prev) ? 'skill' : 'concept')
          : undefined;
        const nextType = (typeHint ?? inferredPrevType ?? DEFAULT_MODULE_TYPE) as ModuleType;
        let nextState: ModuleState;

        switch (nextType) {
          case 'concept': {
            const previous = prev && !isSkillModule(prev) ? (prev as ConceptModuleState) : undefined;
            const incoming = data as Partial<ConceptModuleState>;
            const nextConcept: ConceptModuleState = {
              ...createModuleState(id, 'concept'),
              ...(previous ?? {}),
              ...incoming,
              id,
              lastAccessed: Date.now(),
              understood: incoming.understood === true ? true : previous?.understood,
            };
            nextState = nextConcept;
            break;
          }
          case 'skill':
          default: {
            const previous = isSkillModule(prev) ? prev : undefined;
            const incoming = data as Partial<SkillModuleState>;
            const baseSkill = createModuleState(id, 'skill') as SkillModuleState;
            const nextSkill: SkillModuleState = {
              ...baseSkill,
              ...(previous ?? {}),
              ...incoming,
              id,
              lastAccessed: Date.now(),
              exercises:
                incoming.exercises ?? previous?.exercises ?? baseSkill.exercises,
              numSolved: incoming.numSolved ?? previous?.numSolved ?? baseSkill.numSolved,
              understood: incoming.understood === true ? true : previous?.understood,
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
        const existing = state.modules[id];
        const targetType = (
          type ??
          (existing ? (isSkillModule(existing) ? 'skill' : 'concept') : undefined) ??
          DEFAULT_MODULE_TYPE
        ) as ModuleType;
        return {
          modules: {
            ...state.modules,
            [id]: createModuleState(id, targetType),
          },
        };
      }),

    getCurrentExerciseInstance: (skillId) => {
      const module = get().modules[skillId];
      if (!isSkillModule(module)) {
        return null;
      }
      return module.exercises[module.exercises.length - 1] ?? null;
    },

    getAllExerciseInstances: (skillId) => {
      const module = get().modules[skillId];
      if (!isSkillModule(module)) {
        return [];
      }
      return [...module.exercises];
    },

    getExerciseHistory: (skillId, instanceId) => {
      const module = get().modules[skillId];
      if (!isSkillModule(module)) {
        return [];
      }
      const instance = module.exercises.find((exercise) => exercise.id === instanceId);
      return instance?.events ?? [];
    },
  };
}

export { normalizeModuleState };
