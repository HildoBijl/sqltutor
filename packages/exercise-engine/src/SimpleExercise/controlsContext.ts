import { createContext, useContext, type ReactNode } from 'react';

/** Control state the SimpleExercise view exposes so ExerciseControls can self-serve. */
export interface SimpleExerciseControlsValue {
  solved: boolean;
  givenUp: boolean;
  canSubmit: boolean;
  canGiveUp: boolean;
  onSubmit: () => void;
  onGiveUp: () => void;
  onNext: () => void;
  adminControls?: ReactNode;
}

export const SimpleExerciseControlsContext = createContext<SimpleExerciseControlsValue | null>(null);

export function useSimpleExerciseControls(): SimpleExerciseControlsValue {
  const value = useContext(SimpleExerciseControlsContext);
  if (!value) {
    throw new Error('useSimpleExerciseControls must be used within a SimpleExercise view.');
  }
  return value;
}
