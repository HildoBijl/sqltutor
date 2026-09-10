import { useLearningStore, type SkillModuleState } from '@/store';
import type { ExerciseStorage } from '@sqlvalley/exercise-engine';

/**
 * Adapts the learning store to ExerciseStorage. getInstance returns the raw last
 * exercise so the reference only changes when the exercise does, which is what
 * useSyncExternalStore needs.
 */
export const exerciseStorage: ExerciseStorage = {
  getInstance: (skillId) => {
    const module = useLearningStore.getState().modules[skillId] as SkillModuleState | undefined;
    return module?.exercises?.[module.exercises.length - 1] ?? null;
  },
  getAllInstances: (skillId) =>
    useLearningStore.getState().getAllExerciseInstances(skillId),
  getSolvedExerciseIds: (skillId) =>
    useLearningStore.getState().getSolvedExerciseIds(skillId),
  subscribe: (listener) => useLearningStore.subscribe(listener),
  startExercise: (skillId, exerciseId, version, parameters) =>
    useLearningStore.getState().startNewExercise(skillId, exerciseId, version, parameters),
  submitAction: (skillId, action, resultingState, report, exerciseDone, increaseSolvedCounter) =>
    useLearningStore.getState().submitExerciseAction(
      skillId, action, resultingState, report, exerciseDone, increaseSolvedCounter,
    ),
  setDraftInput: (skillId, draftInput) =>
    useLearningStore.getState().setExerciseDraftInput(skillId, draftInput),
};
