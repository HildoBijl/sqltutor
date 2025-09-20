import { useCallback, useMemo } from 'react';
import { useComponentState } from '@/store';

type Validator = (input: string, state: any, result: any) => boolean;

export interface ExerciseEntry {
  id: string;
  description: string;
  state: any;
  expectedQuery?: string;
  inputs: string[];
  done: boolean;
  solved?: boolean;
  givenUp?: boolean;
  timestamp: Date;
}

export interface SkillExerciseModuleLike {
  generate?: (utils: any) => any;
  validate?: Validator;
  solutionTemplate?: string;
}

export interface SubmitResult {
  correct: boolean;
}

function normalizeQuery(s: string) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');
}

export function useSkillExerciseState(
  componentId: string,
  moduleLike: SkillExerciseModuleLike | null,
) {
  const [componentState, setComponentState] = useComponentState(componentId);

  const exerciseHistory: ExerciseEntry[] = useMemo(() => {
    return (componentState.exerciseHistory || []) as ExerciseEntry[];
  }, [componentState.exerciseHistory]);

  const currentExercise: ExerciseEntry | null = useMemo(() => {
    return exerciseHistory.length > 0 ? exerciseHistory[exerciseHistory.length - 1] : null;
  }, [exerciseHistory]);

  const genUtils = useMemo(
    () => ({
      selectRandomly: <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)],
      generateRandomNumber: (min: number, max: number) =>
        Math.floor(Math.random() * (max - min + 1)) + min,
    }),
    [],
  );

  const startNewExercise = useCallback(() => {
    if (!moduleLike?.generate) return;
    if (currentExercise && !currentExercise.done) return; // enforce done-before-next

    const state = moduleLike.generate(genUtils) || {};
    const entry: ExerciseEntry = {
      id: state?.id || 'exercise',
      description: state?.description || 'Solve the exercise',
      expectedQuery: state?.expectedQuery,
      state,
      inputs: [''],
      done: false,
      timestamp: new Date(),
    };

    setComponentState(prev => ({
      ...prev,
      exerciseHistory: [...(prev.exerciseHistory || []), entry],
    }));
  }, [moduleLike, currentExercise, genUtils, setComponentState]);

  const recordAttempt = useCallback(
    (input: string) => {
      if (!currentExercise) return;
      const idx = exerciseHistory.length - 1;
      const updated = { ...currentExercise, inputs: [...(currentExercise.inputs || []), input] } as ExerciseEntry;
      setComponentState(prev => ({
        ...prev,
        exerciseHistory: [...(prev.exerciseHistory || []).slice(0, idx), updated],
      }));
    },
    [currentExercise, exerciseHistory.length, setComponentState],
  );

  const submitInput = useCallback(
    (input: string, result: any): SubmitResult | null => {
      if (!currentExercise) return null;
      if (currentExercise.done) return { correct: currentExercise.solved === true };

      let correct = false;

      if (moduleLike?.validate) {
        correct = !!moduleLike.validate(input, currentExercise.state, result);
      } else if (currentExercise.expectedQuery) {
        correct = normalizeQuery(input) === normalizeQuery(currentExercise.expectedQuery);
      } else {
        correct = !!(result && Array.isArray(result) && result.length > 0);
      }

      const idx = exerciseHistory.length - 1;

      if (!correct) {
        const updated = { ...currentExercise, inputs: [...(currentExercise.inputs || []), input] } as ExerciseEntry;
        setComponentState(prev => ({
          ...prev,
          exerciseHistory: [...(prev.exerciseHistory || []).slice(0, idx), updated],
        }));
        return { correct: false };
      }

      // Mark solved and increment progress
      setComponentState(prev => ({
        ...prev,
        numSolved: (prev.numSolved || 0) + 1,
        exerciseHistory: [
          ...(prev.exerciseHistory || []).slice(0, idx),
          { ...currentExercise, done: true, solved: true },
        ],
      }));

      return { correct: true };
    },
    [currentExercise, exerciseHistory.length, moduleLike, setComponentState],
  );

  const giveUp = useCallback(() => {
    if (!currentExercise || currentExercise.done) return;
    const idx = exerciseHistory.length - 1;
    setComponentState(prev => ({
      ...prev,
      exerciseHistory: [
        ...(prev.exerciseHistory || []).slice(0, idx),
        { ...currentExercise, done: true, givenUp: true },
      ],
    }));
  }, [currentExercise, exerciseHistory.length, setComponentState]);

  return {
    exerciseHistory,
    currentExercise,
    startNewExercise,
    submitInput,
    giveUp,
    recordAttempt,
    moduleLike,
  } as const;
}

