import type {
  ExerciseId,
  ExerciseVersion,
  SkillId,
  StoredExerciseAction,
  StoredExerciseInstance,
  StoredExerciseState,
} from './storedState';

/**
 * Storage the engine needs, passed in by the app so it isn't tied to one store.
 * getInstance has to return the same reference when nothing changed, since it feeds
 * useSyncExternalStore.
 */
export interface ExerciseStorage {
  getInstance(skillId: SkillId): StoredExerciseInstance | null;
  getAllInstances?(skillId: SkillId): readonly StoredExerciseInstance[];
  getSolvedExerciseIds?(skillId: SkillId): readonly ExerciseId[];
  subscribe(listener: () => void): () => void;
  startExercise(
    skillId: SkillId,
    exerciseId: ExerciseId,
    version: ExerciseVersion,
    parameters: Record<string, unknown>,
  ): void;
  submitAction(
    skillId: SkillId,
    action: StoredExerciseAction,
    resultingState: StoredExerciseState,
    report: unknown,
    exerciseDone: boolean,
    increaseSolvedCounter: boolean,
  ): void;
  setDraftInput(skillId: SkillId, draftInput: unknown): void;
}
