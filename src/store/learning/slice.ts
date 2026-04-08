/**
 * Learning store slice.
 */

import type {
  ModuleState,
  ModuleType,
  ConceptModuleState,
  LearningState,
  SkillModuleState,
  StoredExerciseAction,
  StoredExerciseInstance,
  StoredExerciseState,
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
  // Deprecated for exercise mutations. Keep for generic module metadata updates.
  updateModule: (id: string, data: Partial<ModuleState>, typeHint?: ModuleType) => void;
  completeConcept: (conceptId: string) => void;
  startNewExercise: (
    skillId: string,
    exerciseId: string,
    version: number,
    parameters: Record<string, unknown>,
  ) => void;
  submitExerciseAction: (
    skillId: string,
    action: StoredExerciseAction,
    resultingState: StoredExerciseState,
    exerciseDone: boolean,
    increaseSolvedCounter: boolean,
  ) => void;
  setExerciseDraftInput: (skillId: string, draftInput: unknown) => void;
  getModule: (id: string) => ModuleState;
  resetModule: (id: string, type?: ModuleType) => void;
  getCurrentExerciseInstance: (skillId: string) => StoredExerciseInstance | null;
  getAllExerciseInstances: (skillId: string) => StoredExerciseInstance[];
}

function getSkillModuleForUpdate(moduleId: string, state: LearningState): SkillModuleState {
  const existing = state.modules[moduleId];
  if (isSkillModule(existing)) {
    return existing;
  }
  return createModuleState(moduleId, 'skill') as SkillModuleState;
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

    completeConcept: (conceptId) =>
      set((state) => {
        const existing = state.modules[conceptId];
        const currentConcept = existing && !isSkillModule(existing)
          ? (existing as ConceptModuleState)
          : (createModuleState(conceptId, 'concept') as ConceptModuleState);

        return {
          modules: {
            ...state.modules,
            [conceptId]: {
              ...currentConcept,
              id: conceptId,
              understood: true,
              lastAccessed: Date.now(),
            },
          },
        };
      }),

    startNewExercise: (skillId, exerciseId, version, parameters) =>
      set((state) => {
        const skillModule = getSkillModuleForUpdate(skillId, state);
        const newExercise: StoredExerciseInstance = {
          exerciseId,
          version,
          parameters: { ...parameters },
          createdAt: Date.now(),
          events: [],
          draftInput: undefined,
        };

        return {
          modules: {
            ...state.modules,
            [skillId]: {
              ...skillModule,
              id: skillId,
              lastAccessed: Date.now(),
              exercises: [...skillModule.exercises, newExercise],
            },
          },
        };
      }),

    submitExerciseAction: (skillId, action, resultingState, exerciseDone, increaseSolvedCounter) =>
      set((state) => {
        const skillModule = getSkillModuleForUpdate(skillId, state);
        if (skillModule.exercises.length === 0) {
          return {
            modules: {
              ...state.modules,
              [skillId]: {
                ...skillModule,
                id: skillId,
                lastAccessed: Date.now(),
              },
            },
          };
        }

        const lastIndex = skillModule.exercises.length - 1;
        const currentExercise = skillModule.exercises[lastIndex];
        const updatedExercise: StoredExerciseInstance = {
          ...currentExercise,
          events: [
            ...currentExercise.events,
            {
              timestamp: Date.now(),
              action: { ...action },
              resultingState: { ...resultingState },
            },
          ],
          draftInput: exerciseDone ? undefined : currentExercise.draftInput,
        };

        const exercises = skillModule.exercises.map((exercise, index) =>
          index === lastIndex ? updatedExercise : exercise,
        );

        return {
          modules: {
            ...state.modules,
            [skillId]: {
              ...skillModule,
              id: skillId,
              lastAccessed: Date.now(),
              numSolved: increaseSolvedCounter ? skillModule.numSolved + 1 : skillModule.numSolved,
              exercises,
            },
          },
        };
      }),

    setExerciseDraftInput: (skillId, draftInput) =>
      set((state) => {
        const skillModule = getSkillModuleForUpdate(skillId, state);
        if (skillModule.exercises.length === 0) {
          return {
            modules: {
              ...state.modules,
              [skillId]: {
                ...skillModule,
                id: skillId,
                lastAccessed: Date.now(),
              },
            },
          };
        }

        const lastIndex = skillModule.exercises.length - 1;
        const exercises = skillModule.exercises.map((exercise, index) =>
          index === lastIndex
            ? {
              ...exercise,
              draftInput,
            }
            : exercise,
        );

        return {
          modules: {
            ...state.modules,
            [skillId]: {
              ...skillModule,
              id: skillId,
              lastAccessed: Date.now(),
              exercises,
            },
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
  };
}

export { normalizeModuleState };
