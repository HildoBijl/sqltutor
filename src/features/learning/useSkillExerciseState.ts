import { useCallback, useEffect, useMemo, useState } from 'react';
import { useComponentState } from '@/store';
import {
  createInitialProgress,
  createSimpleExerciseReducer,
  type ExerciseAction,
  type ExerciseHelpers,
  type ExerciseProgress,
  type ExerciseStatus,
  type ValidationResult,
  type VerificationResult,
  type CheckInputArgs,
  type ValidateInputArgs,
} from './exerciseEngine';

const normalizeSql = (value: string) =>
  value.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');

function applyTemplate(template: string, context: Record<string, unknown>): string {
  return template.replace(/{{(.*?)}}/g, (_match, token) => {
    const key = String(token).trim();
    const v = context[key];
    return v !== undefined && v !== null ? String(v) : '';
  });
}

export interface SkillExerciseModuleLike {
  generate?: (helpers: ExerciseHelpers) => any;
  validate?: (input: string, exerciseState: any, result: unknown) => boolean;
  validateInput?: (args: ValidateInputArgs<any, string, unknown>) => ValidationResult;
  checkInput?: (args: CheckInputArgs<any, string, unknown>) => VerificationResult;
  validateOutput?: (exercise: any, result: unknown) => ValidationResult;
  verifyOutput?: (exercise: any, output: unknown) => VerificationResult;
  getSolution?: (exercise: any) => string | null | undefined;
  runDemo?: (args: { exercise: any; helpers: ExerciseHelpers }) => unknown;
  solutionTemplate?: string;
  messages?: {
    correct?: string;
    incorrect?: string;
    invalid?: string;
  };
}

type SkillExerciseProgress = ExerciseProgress<any, string, unknown, unknown>;

type Dispatch = (action: ExerciseAction<string, unknown>) => void;

type ValidationPreview = (input: string) => ValidationResult;

function defaultCorrectMessage(messages?: SkillExerciseModuleLike['messages']) {
  return messages?.correct || 'Excellent work! That matches the expected result.';
}

function defaultIncorrectMessage(messages?: SkillExerciseModuleLike['messages']) {
  return messages?.incorrect || 'Not quite right yet. Compare the requirements to your query and try again.';
}

function defaultInvalidMessage(messages?: SkillExerciseModuleLike['messages']) {
  return messages?.invalid || 'Please enter a valid SQL SELECT query so we can check it.';
}

export function useSkillExerciseState(componentId: string, moduleLike: SkillExerciseModuleLike | null) {
  const [componentState, setComponentState] = useComponentState(componentId);

  const helpers = useMemo<ExerciseHelpers>(
    () => ({
      selectRandomly: <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)],
      randomInt: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
    }),
    [],
  );

  const storedProgress = componentState.exerciseProgress as SkillExerciseProgress | undefined;

  const { reducer, validateInputFn, deriveSolution, checkInputFn } = useMemo(() => {
    const generateExercise = (exerciseHelpers: ExerciseHelpers) => {
      if (moduleLike?.generate) {
        return moduleLike.generate(exerciseHelpers) || {};
      }
      return {
        id: 'exercise',
        description: 'Solve the exercise',
      };
    };

    const validateInput = (args: ValidateInputArgs<any, string, unknown>): ValidationResult => {
      const query = typeof args.input === 'string' ? args.input : '';
      if (!query.trim()) {
        return { ok: false, message: defaultInvalidMessage(moduleLike?.messages) };
      }
      if (!/\b(select|with)\b/i.test(query)) {
        return {
          ok: false,
          message: 'Start with a SELECT (or WITH) clause so we can understand the query.',
        };
      }
      if (moduleLike?.validateInput) {
        const custom = moduleLike.validateInput(args);
        if (custom) {
          return custom;
        }
      }
      return { ok: true };
    };

    const solveFromTemplate = (exercise: any) => {
      if (!moduleLike?.solutionTemplate) return null;
      return applyTemplate(moduleLike.solutionTemplate, exercise || {});
    };

    const checkInput = (args: CheckInputArgs<any, string, unknown>): VerificationResult => {
      const query = typeof args.input === 'string' ? args.input : '';

      if (moduleLike?.checkInput) {
        return moduleLike.checkInput(args);
      }

      if (typeof moduleLike?.validate === 'function') {
        const isCorrect = moduleLike.validate(query, args.exercise, args.result);
        const solution = isCorrect ? solveFromTemplate(args.exercise) || args.exercise?.expectedQuery : undefined;
        return {
          correct: isCorrect,
          message: isCorrect ? defaultCorrectMessage(moduleLike?.messages) : defaultIncorrectMessage(moduleLike?.messages),
          solution,
        };
      }

      const expected = args.exercise?.expectedQuery;
      if (expected) {
        const matches = args.normalizedInput === normalizeSql(expected);
        return {
          correct: matches,
          message: matches ? defaultCorrectMessage(moduleLike?.messages) : defaultIncorrectMessage(moduleLike?.messages),
          solution: expected,
        };
      }

      const hasRows =
        Array.isArray(args.result) &&
        args.result.length > 0 &&
        Array.isArray((args.result as any)[0]?.values) &&
        (args.result as any)[0].values.length > 0;

      return {
        correct: false,
        message: hasRows
          ? 'Your query runs, but it does not match the expected pattern yet.'
          : defaultIncorrectMessage(moduleLike?.messages),
      };
    };

    const derive = ({ exercise, verification }: { exercise: any; verification?: VerificationResult }) => {
      if (verification?.solution) return verification.solution;
      if (moduleLike?.getSolution && exercise) {
        const generatedSolution = moduleLike.getSolution(exercise);
        if (generatedSolution) {
          return generatedSolution;
        }
      }
      if (exercise?.expectedQuery) return exercise.expectedQuery;
      const templateSolution = solveFromTemplate(exercise);
      if (templateSolution) return templateSolution;
      return null;
    };

    return {
      reducer: createSimpleExerciseReducer<any, string, unknown, unknown>({
        helpers,
        normalizeInput: normalizeSql,
        generateExercise,
        validateInput,
        checkInput,
        deriveSolution: derive,
        runDemo: moduleLike?.runDemo,
      }),
      validateInputFn: validateInput,
      deriveSolution: derive,
      checkInputFn: checkInput,
    };
  }, [helpers, moduleLike]);

  const [progress, setProgress] = useState<SkillExerciseProgress>(() => {
    if (storedProgress) {
      return reducer(storedProgress, { type: 'hydrate', state: storedProgress });
    }
    return createInitialProgress();
  });

  useEffect(() => {
    if (!storedProgress) return;
    setProgress(prev => {
      if (prev === storedProgress) return prev;
      if (
        prev.generatedAt === storedProgress.generatedAt &&
        prev.status === storedProgress.status &&
        prev.attempts?.length === storedProgress.attempts?.length
      ) {
        return prev;
      }
      return reducer(prev, { type: 'hydrate', state: storedProgress });
    });
  }, [storedProgress, reducer]);

  const persistProgress = useCallback(
    (next: SkillExerciseProgress) => {
      setComponentState(prev => ({
        ...prev,
        exerciseProgress: next,
        exerciseHistory: next.history,
      }));
    },
    [setComponentState],
  );

  const dispatch: Dispatch = useCallback(
    (action) => {
      setProgress(prev => {
        const next = reducer(prev, action);
        if (next === prev) return prev;
        persistProgress(next);
        return next;
      });
    },
    [reducer, persistProgress],
  );

  const previewValidation: ValidationPreview = useCallback(
    (input: string) => {
      const exercise = progress.exercise;
      return validateInputFn({
        exercise,
        input,
        normalizedInput: normalizeSql(input),
        result: undefined,
        previousAttempts: progress.attempts,
        helpers,
      });
    },
    [helpers, progress.attempts, progress.exercise, validateInputFn],
  );

  const status: ExerciseStatus = progress.status;
  const currentExercise = progress.exercise;

  const derivedSolution = useMemo(() => {
    return deriveSolution({ exercise: currentExercise, verification: progress.verification || undefined });
  }, [currentExercise, deriveSolution, progress.verification]);

  const evaluate = useCallback(
    (input: string, result?: unknown) => {
      return checkInputFn({
        exercise: progress.exercise,
        input,
        normalizedInput: normalizeSql(input),
        result,
        previousAttempts: progress.attempts,
        helpers,
      });
    },
    [checkInputFn, helpers, progress.attempts, progress.exercise],
  );

  const recordAttempt = useCallback(
    (args: {
      input: string;
      result?: unknown;
      validation?: ValidationResult | null;
      verification?: VerificationResult | null;
    }) => {
      dispatch({
        type: 'input',
        input: args.input,
        result: args.result,
        validation: args.validation ?? null,
        verification: args.verification ?? null,
      });
    },
    [dispatch],
  );

  return {
    progress,
    status,
    currentExercise,
    history: progress.history,
    attempts: progress.attempts,
    feedback: progress.feedback,
    solution: derivedSolution,
    dispatch,
    previewValidation,
    evaluate,
    checkInput: checkInputFn,
    recordAttempt,
    moduleLike,
  } as const;
}
