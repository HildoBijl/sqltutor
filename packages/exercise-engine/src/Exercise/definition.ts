import type { ComponentType } from 'react';

import type {
  ExerciseId,
  ExerciseVersion,
  SkillId,
  StoredExerciseAction,
  StoredExerciseState,
} from '../storedState';

export type Awaitable<T> = T | Promise<T>;

export interface GenerateExerciseParametersContext<Parameters extends Record<string, unknown>> {
  previousParameters?: Parameters | null;
  skillId: SkillId;
  learnerSeed: string;
  attemptSeed: string;
  attemptNumber: number;
  solvedExerciseIds: readonly ExerciseId[];
}

export interface ReduceResult<State extends StoredExerciseState> {
  state: State;
  /** Opaque per-exercise-type data used to build feedback (stored with the action). */
  report?: unknown;
}

/**
 * Grades an action. May be sync or async; `moduleContext` is the subject-specific
 * environment (for SQL: database access) injected by the manager.
 */
export type ExerciseReducer<
  Parameters extends Record<string, unknown>,
  Action extends StoredExerciseAction,
  State extends StoredExerciseState,
> = (
  parameters: Parameters,
  state: State,
  action: Action,
  moduleContext: unknown,
) => Awaitable<ReduceResult<State>>;

/**
 * A single self-contained exercise: how to generate it, how to reduce an action
 * against its state, and the component that renders it (props-free, context-fed).
 */
export interface ExerciseDefinition<
  Parameters extends Record<string, unknown>,
  Action extends StoredExerciseAction,
  State extends StoredExerciseState,
> {
  exerciseId: ExerciseId;
  version: ExerciseVersion;
  generateParameters: (
    moduleContext: unknown,
    context: GenerateExerciseParametersContext<Parameters>,
  ) => Parameters;
  initialState: State;
  isComplete: (state: State) => boolean;
  isSolved: (state: State) => boolean;
  reduce: ExerciseReducer<Parameters, Action, State>;
  Component: ComponentType;
}

/** An exercise definition with its generics erased, for holding a mixed list. */
export type AnyExerciseDefinition = ExerciseDefinition<
  Record<string, unknown>,
  StoredExerciseAction,
  StoredExerciseState
>;
