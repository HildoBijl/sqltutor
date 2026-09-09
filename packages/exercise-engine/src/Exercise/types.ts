import type { ReactNode } from 'react';
import type {
  SkillId,
  StoredExerciseAction,
  StoredExerciseEvent,
  StoredExerciseState,
} from '../storedState';
import type { ExerciseDefinition } from './definition';

/** Dynamically generated data about the current exercise. */
export interface ExerciseData<
  Parameters extends Record<string, unknown>,
  State extends StoredExerciseState,
> {
  parameters: Parameters;
  state: State;
  events: StoredExerciseEvent[];
  draftInput: unknown;
  pending: boolean;
}

/** Handlers connecting the exercise to the data store, set up by the manager. */
export interface ExerciseControls<Action extends StoredExerciseAction> {
  submitAction: (action: Action) => Promise<void>;
  setDraftInput: (draftInput: unknown) => void;
  startNewExercise: () => void;
  adminControls?: ReactNode;
}

export interface ExerciseSkill {
  id: SkillId;
}

export interface ExerciseContextValue<
  Parameters extends Record<string, unknown>,
  Action extends StoredExerciseAction,
  State extends StoredExerciseState,
> {
  definition: ExerciseDefinition<Parameters, Action, State>;
  data: ExerciseData<Parameters, State>;
  controls: ExerciseControls<Action>;
  skill: ExerciseSkill;
}

export interface ExerciseProps {
  value: ExerciseContextValue<
    Record<string, unknown>,
    StoredExerciseAction,
    StoredExerciseState
  >;
}
