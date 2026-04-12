import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  createInitialProgress,
  createSimpleExerciseReducer,
  type ExerciseAction,
  type ExerciseAttempt,
  type ExerciseHelpers,
  type ExerciseProgress,
  type ExerciseStatus,
  type SimpleExerciseConfig,
  type ValidationResult,
  type VerificationResult,
  type ValidateInputArgs,
} from './engine';
import { useModuleState } from '@/learning/hooks/useModuleState';
import {
  useLearningStore,
  type SkillModuleState,
  type StoredExerciseAction,
  type StoredExerciseInstance,
  type StoredExerciseState,
} from '@/store';
import type { PracticeSolutionLike, PracticeSolution } from './types';
import { normalizePracticeSolution } from './utils/normalizePracticeSolution';

const normalizeSql = (value: string) =>
  value.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function applyTemplate(template: string, context: Record<string, unknown>): string {
  return template.replace(/{{(.*?)}}/g, (_match, token) => {
    const key = String(token).trim();
    const v = context[key];
    return v !== undefined && v !== null ? String(v) : '';
  });
}

function getExerciseId(exercise: unknown): string | null {
  if (!exercise || typeof exercise !== 'object') return null;
  const id = (exercise as Record<string, unknown>).id;
  return typeof id === 'string' && id.trim().length > 0 ? id : null;
}

function getExerciseVersion(exercise: unknown): number {
  if (!exercise || typeof exercise !== 'object') return 1;
  const version = (exercise as Record<string, unknown>).version;
  return typeof version === 'number' && Number.isFinite(version) ? version : 1;
}

function getExerciseParameters(exercise: unknown): Record<string, unknown> {
  if (!exercise || typeof exercise !== 'object') return {};
  const parameters = (exercise as Record<string, unknown>).parameters;
  return isRecord(parameters) ? { ...parameters } : {};
}

function hasSolvedState(state: StoredExerciseState | undefined): boolean {
  return state?.solved === true;
}

function hasGivenUpState(state: StoredExerciseState | undefined): boolean {
  return state?.givenUp === true;
}

function getCurrentInstance(moduleState: SkillModuleState): StoredExerciseInstance | null {
  return moduleState.exercises[moduleState.exercises.length - 1] ?? null;
}

function applyStoredParameters(
  exercise: unknown,
  parameters: Record<string, unknown>,
): unknown {
  if (!isRecord(exercise)) {
    return exercise;
  }

  return {
    ...exercise,
    ...parameters,
    parameters: { ...parameters },
  };
}

function buildAttemptsFromEvents(instance: StoredExerciseInstance): ExerciseAttempt<string>[] {
  const attempts: ExerciseAttempt<string>[] = [];

  instance.events.forEach((event) => {
    if (!isRecord(event.action)) {
      return;
    }

    if (event.action.type !== 'input') {
      return;
    }

    const input = event.action.input;
    if (typeof input !== 'string') {
      return;
    }

    const solved = hasSolvedState(event.resultingState);
    attempts.push({
      index: attempts.length,
      input,
      normalizedInput: normalizeSql(input),
      status: solved ? 'correct' : 'incorrect',
      feedback: solved
        ? 'Great job! That answer is correct.'
        : 'Not quite there yet. Check the requirements and try again.',
      timestamp: event.timestamp,
    });
  });

  return attempts;
}

export interface SkillExerciseOption {
  id: string;
  label: string;
}

export interface SkillExerciseModuleLike {
  generate?: (helpers: ExerciseHelpers, context?: { previousExercise?: unknown | null }) => any;
  validate?: (input: string, exerciseState: any, result: unknown) => boolean;
  validateInput?: (args: ValidateInputArgs<any, string, unknown>) => ValidationResult;
  validateOutput?: (exercise: any, result: unknown) => ValidationResult;
  verifyOutput?: (exercise: any, output: unknown, database?: unknown) => VerificationResult;
  getSolution?: (exercise: any) => PracticeSolutionLike;
  getDescription?: (exercise: any) => string | null | undefined;
  runDemo?: (args: { exercise: any; helpers: ExerciseHelpers }) => unknown;
  isExerciseValid?: (exercise: any) => boolean;
  listExercises?: () => ReadonlyArray<SkillExerciseOption>;
  getExerciseById?: (id: string) => any | null;
  solutionTemplate?: string;
  messages?: {
    correct?: string;
    incorrect?: string;
    invalid?: string;
  };
}

export type SkillExerciseProgress = ExerciseProgress<any, string, unknown, unknown>;

type Dispatch = (action: ExerciseAction<string, unknown>) => void;

type ValidationPreview = (input: string) => ValidationResult;

function defaultInvalidMessage(messages?: SkillExerciseModuleLike['messages']) {
  return messages?.invalid || 'Please enter a valid SQL SELECT query so we can check it.';
}

export function useSkillExerciseState(moduleId: string, moduleLike: SkillExerciseModuleLike | null) {
  const moduleState = useModuleState<SkillModuleState>(moduleId, 'skill');
  const startNewExercise = useLearningStore((state) => state.startNewExercise);
  const submitExerciseAction = useLearningStore((state) => state.submitExerciseAction);
  const setExerciseDraftInput = useLearningStore((state) => state.setExerciseDraftInput);

  const helpers = useMemo<ExerciseHelpers>(
    () => ({
      selectRandomly: <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)],
      randomInt: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
    }),
    [],
  );

  const exerciseConfig = useMemo<SimpleExerciseConfig<any, string, unknown, unknown>>(() => {
    const generateExercise = (
      exerciseHelpers: ExerciseHelpers,
      context?: { previousExercise?: unknown | null },
    ) => {
      if (moduleLike?.generate) {
        return moduleLike.generate(exerciseHelpers, context) || {};
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
      return normalizePracticeSolution(applyTemplate(moduleLike.solutionTemplate, exercise || {}));
    };

    const derive = ({ exercise, verification }: { exercise: any; verification?: VerificationResult }) => {
      const fromVerification = normalizePracticeSolution(verification?.solution);
      if (fromVerification) return fromVerification;

      if (moduleLike?.getSolution && exercise) {
        const generatedSolution = normalizePracticeSolution(moduleLike.getSolution(exercise));
        if (generatedSolution) {
          return generatedSolution;
        }
      }

      const expected = normalizePracticeSolution((exercise?.expectedQuery as PracticeSolutionLike) ?? null);
      if (expected) return expected;

      const templateSolution = solveFromTemplate(exercise);
      if (templateSolution) return templateSolution;

      return null;
    };

    return {
      helpers,
      normalizeInput: normalizeSql,
      generateExercise,
      validateInput,
      deriveSolution: derive,
      runDemo: moduleLike?.runDemo,
    };
  }, [helpers, moduleLike]);

  const reducer = useMemo(
    () => createSimpleExerciseReducer<any, string, unknown, unknown>(exerciseConfig),
    [exerciseConfig],
  );

  const validateInputFn = exerciseConfig.validateInput!;
  const deriveSolution = exerciseConfig.deriveSolution!;

  const [progress, setProgress] = useState<SkillExerciseProgress>(() => createInitialProgress());
  const progressRef = useRef(progress);
  const moduleStateRef = useRef(moduleState);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    moduleStateRef.current = moduleState;
  }, [moduleState]);

  const currentStoredInstance = useMemo(
    () => getCurrentInstance(moduleState),
    [moduleState],
  );

  const resolveStoredExercise = useCallback(
    (instance: StoredExerciseInstance): unknown => {
      if (!moduleLike?.getExerciseById) {
        return null;
      }

      const baseExercise = moduleLike.getExerciseById(instance.exerciseId);
      if (!baseExercise) {
        return null;
      }

      return applyStoredParameters(baseExercise, instance.parameters);
    },
    [moduleLike],
  );

  const dispatch: Dispatch = useCallback(
    (action) => {
      const prev = progressRef.current;
      const next = reducer(prev, action);
      if (next === prev) return;

      if (action.type === 'generate') {
        const nextExercise = next.exercise;
        const exerciseId = getExerciseId(nextExercise) ?? 'exercise';
        const version = getExerciseVersion(nextExercise);
        const parameters = getExerciseParameters(nextExercise);
        startNewExercise(moduleId, exerciseId, version, parameters);
      } else if (action.type === 'input') {
        const currentInstance = getCurrentInstance(moduleStateRef.current);
        if (currentInstance) {
          const solvedNow = next.status === 'correct';
          const solvedBefore =
            prev.status === 'correct' ||
            currentInstance.events.some((event) => hasSolvedState(event.resultingState));
          const storedAction: StoredExerciseAction = {
            type: 'input',
            input: action.input,
          };
          const storedResultingState: StoredExerciseState = solvedNow ? { solved: true } : {};
          submitExerciseAction(
            moduleId,
            storedAction,
            storedResultingState,
            solvedNow,
            solvedNow && !solvedBefore,
          );
        }
      }

      progressRef.current = next;
      setProgress(next);
    },
    [moduleId, reducer, startNewExercise, submitExerciseAction],
  );

  useEffect(() => {
    const instance = currentStoredInstance;
    if (!instance) {
      const current = progressRef.current;
      if (current.status === 'idle' && current.attempts.length === 0) {
        return;
      }
      const resetProgress = createInitialProgress<any, string, unknown, unknown>();
      progressRef.current = resetProgress;
      setProgress(resetProgress);
      return;
    }

    if (!moduleLike?.getExerciseById) {
      return;
    }

    const latestExercise = resolveStoredExercise(instance);
    if (!latestExercise) {
      dispatch({ type: 'generate' });
      return;
    }

    const staleByVersion = getExerciseVersion(latestExercise) !== instance.version;
    const staleByCustomValidator = moduleLike?.isExerciseValid
      ? !moduleLike.isExerciseValid(latestExercise)
      : false;

    if (staleByVersion || staleByCustomValidator) {
      dispatch({ type: 'generate' });
      return;
    }

    const attempts = buildAttemptsFromEvents(instance);
    const solved = instance.events.some((event) => hasSolvedState(event.resultingState));
    const givenUp = !solved && instance.events.some((event) => hasGivenUpState(event.resultingState));
    const status: ExerciseStatus = solved ? 'correct' : givenUp ? 'incorrect' : 'ready';

    const current = progressRef.current;
    const prevExerciseId = getExerciseId(current.exercise);
    const sameExercise =
      prevExerciseId === instance.exerciseId &&
      getExerciseVersion(current.exercise) === instance.version;
    const sameStatus = current.status === status;
    const sameAttempts = current.attempts.length === attempts.length;
    const sameGeneratedAt = current.generatedAt === instance.createdAt;

    if (sameExercise && sameStatus && sameAttempts && sameGeneratedAt) {
      return;
    }

    const nextProgress: SkillExerciseProgress = {
      ...createInitialProgress(),
      exercise: latestExercise,
      status,
      attempts,
      generatedAt: instance.createdAt,
      feedback: attempts[attempts.length - 1]?.feedback ?? null,
    };
    progressRef.current = nextProgress;
    setProgress(nextProgress);
  }, [currentStoredInstance, dispatch, moduleLike, resolveStoredExercise]);

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

  const derivedSolution = useMemo<PracticeSolution | null>(() => {
    return deriveSolution({ exercise: currentExercise, verification: progress.verification || undefined });
  }, [currentExercise, deriveSolution, progress.verification]);

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

  const recordGiveUp = useCallback(() => {
    const currentInstance = getCurrentInstance(moduleStateRef.current);
    if (!currentInstance) {
      return;
    }

    const alreadyGivenUp = currentInstance.events.some((event) => hasGivenUpState(event.resultingState));
    if (alreadyGivenUp) {
      return;
    }

    submitExerciseAction(moduleId, { type: 'give-up' }, { givenUp: true }, true, false);
    const current = progressRef.current;
    if (current.status === 'correct') {
      return;
    }
    const nextProgress: SkillExerciseProgress = {
      ...current,
      status: 'incorrect',
    };
    progressRef.current = nextProgress;
    setProgress(nextProgress);
  }, [moduleId, submitExerciseAction]);

  const persistDraftInput = useCallback(
    (draftInput: unknown) => {
      if (!currentStoredInstance) {
        return;
      }
      setExerciseDraftInput(moduleId, draftInput);
    },
    [currentStoredInstance, moduleId, setExerciseDraftInput],
  );

  const isGivenUp = useMemo(() => {
    const currentInstance = currentStoredInstance;
    if (!currentInstance) {
      return false;
    }

    const lastState = currentInstance.events[currentInstance.events.length - 1]?.resultingState;
    return hasGivenUpState(lastState) && !hasSolvedState(lastState);
  }, [currentStoredInstance]);

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
    recordAttempt,
    recordGiveUp,
    setDraftInput: persistDraftInput,
    draftInput: currentStoredInstance?.draftInput,
    isGivenUp,
    moduleLike,
  } as const;
}
