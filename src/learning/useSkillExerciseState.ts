import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  createInitialProgress,
  createSimpleExerciseReducer,
  extractStorableState,
  rehydrateExerciseState,
  type ExerciseAction,
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
  type ExerciseInstanceId,
  type SkillModuleState,
  type StoredExerciseEvent,
  type StoredExerciseInstance,
  type StoredExerciseState,
} from '@/store';
import type { PracticeSolutionLike, PracticeSolution } from './types';
import { normalizePracticeSolution } from './utils/normalizePracticeSolution';

const normalizeSql = (value: string) =>
  value.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');

function applyTemplate(template: string, context: Record<string, unknown>): string {
  return template.replace(/{{(.*?)}}/g, (_match, token) => {
    const key = String(token).trim();
    const v = context[key];
    return v !== undefined && v !== null ? String(v) : '';
  });
}

function generateInstanceId(): ExerciseInstanceId {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getExerciseId(exercise: unknown): string | null {
  if (!exercise || typeof exercise !== 'object') return null;
  const id = (exercise as Record<string, unknown>).id;
  return typeof id === 'string' && id.trim().length > 0 ? id : null;
}

function getExerciseFingerprint(exercise: unknown): string {
  const seen = new WeakSet<object>();

  const serialize = (value: unknown): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) {
      return `[${value.map((item) => serialize(item)).join(',')}]`;
    }
    if (typeof value === 'object') {
      const objectValue = value as Record<string, unknown>;
      if (seen.has(objectValue)) {
        return '[Circular]';
      }
      seen.add(objectValue);
      const entries = Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, nested]) => `${JSON.stringify(key)}:${serialize(nested)}`);
      return `{${entries.join(',')}}`;
    }
    if (typeof value === 'string') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return serialize(exercise);
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
type SkillStoredExerciseState = StoredExerciseState<any | null, string>;

type Dispatch = (action: ExerciseAction<string, unknown>) => void;

type ValidationPreview = (input: string) => ValidationResult;

function defaultInvalidMessage(messages?: SkillExerciseModuleLike['messages']) {
  return messages?.invalid || 'Please enter a valid SQL SELECT query so we can check it.';
}

export function useSkillExerciseState(moduleId: string, moduleLike: SkillExerciseModuleLike | null) {
  const [moduleState, setModuleState] = useModuleState<SkillModuleState>(moduleId, 'skill');
  const queueModuleStateUpdate = useCallback(
    (updater: Parameters<typeof setModuleState>[0]) => {
      Promise.resolve().then(() => {
        setModuleState(updater);
      });
    },
    [setModuleState],
  );

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

  const resolveCurrentExercise = useCallback(
    (exercise: unknown) => {
      if (!moduleLike?.getExerciseById) {
        return exercise;
      }

      const exerciseId = getExerciseId(exercise);
      if (!exerciseId) {
        return null;
      }

      return moduleLike.getExerciseById(exerciseId);
    },
    [moduleLike],
  );

  const toPersistedExercise = useCallback(
    (exercise: unknown) => {
      if (!moduleLike?.getExerciseById) {
        return exercise;
      }

      const exerciseId = getExerciseId(exercise);
      if (!exerciseId) {
        return exercise;
      }

      return { id: exerciseId };
    },
    [moduleLike],
  );

  const appendEvent = useCallback(
    (instanceId: ExerciseInstanceId, action: ExerciseAction<string, unknown>, storedState: SkillStoredExerciseState) => {
      const timestamp = Date.now();
      const event: StoredExerciseEvent = {
        timestamp,
        action,
        resultingState: storedState,
      };

      queueModuleStateUpdate((prev) => {
        const existingIndex = prev.exercises.findIndex((exercise) => exercise.id === instanceId);
        const current = existingIndex >= 0 ? prev.exercises[existingIndex] : {
          id: instanceId,
          skillId: moduleId,
          createdAt: timestamp,
          finalStatus: storedState.status,
          events: [],
        };

        const updated: StoredExerciseInstance = {
          ...current,
          finalStatus: storedState.status === 'correct' ? 'correct' : storedState.status,
          completedAt: storedState.status === 'correct' ? timestamp : current.completedAt,
          events: [...current.events, event],
        };

        const exercises =
          existingIndex >= 0
            ? prev.exercises.map((exercise, index) => (index === existingIndex ? updated : exercise))
            : [...prev.exercises, updated];

        return {
          ...prev,
          exercises,
        };
      });
    },
    [moduleId, queueModuleStateUpdate],
  );

  const dispatch: Dispatch = useCallback(
    (action) => {
      setProgress((prev) => {
        const next = reducer(prev, action);
        if (next === prev) return prev;

        const extractedState = extractStorableState<any, string, unknown, unknown>(next);
        const storedState: SkillStoredExerciseState = {
          ...extractedState,
          exercise: toPersistedExercise(extractedState.exercise),
        };

        if (action.type === 'generate') {
          const instanceId = generateInstanceId();
          const timestamp = Date.now();
          const event: StoredExerciseEvent = {
            timestamp,
            action,
            resultingState: storedState,
          };
          const instance: StoredExerciseInstance = {
            id: instanceId,
            skillId: moduleId,
            createdAt: timestamp,
            finalStatus: storedState.status,
            completedAt: storedState.status === 'correct' ? timestamp : undefined,
            events: [event],
          };

          queueModuleStateUpdate((prevState) => ({
            ...prevState,
            exercises: [...prevState.exercises, instance],
          }));
        } else if (action.type !== 'hydrate') {
          const currentInstance = moduleState.exercises[moduleState.exercises.length - 1];
          if (!currentInstance) {
            // No active instance - start a new one implicitly
            const fallbackId = generateInstanceId();
            appendEvent(fallbackId, action, storedState);
          } else {
            appendEvent(currentInstance.id, action, storedState);
          }
        }

        return next;
      });
    },
    [appendEvent, moduleId, moduleState.exercises, queueModuleStateUpdate, reducer, toPersistedExercise],
  );

  useEffect(() => {
    const instance = moduleState.exercises[moduleState.exercises.length - 1];
    if (!instance) {
      setProgress((prev) => (prev.status === 'idle' && prev.attempts.length === 0 ? prev : createInitialProgress()));
      return;
    }

    if (instance.events.length === 0) {
      setProgress(createInitialProgress());
      return;
    }

    const lastEvent = instance.events[instance.events.length - 1];
    const storedExercise = lastEvent.resultingState.exercise;
    const latestExercise = resolveCurrentExercise(storedExercise);

    if (latestExercise && moduleLike?.isExerciseValid && !moduleLike.isExerciseValid(latestExercise)) {
      dispatch({ type: 'generate' });
      return;
    }

    const resolvedState = {
      ...lastEvent.resultingState,
      exercise: latestExercise,
    };

    setProgress((prev) => {
      if (
        prev.generatedAt === resolvedState.generatedAt &&
        prev.status === resolvedState.status &&
        prev.attempts.length === resolvedState.attempts.length &&
        getExerciseFingerprint(prev.exercise) === getExerciseFingerprint(resolvedState.exercise)
      ) {
        return prev;
      }
      return rehydrateExerciseState(resolvedState, exerciseConfig);
    });
  }, [moduleState.exercises, dispatch, exerciseConfig, moduleLike, resolveCurrentExercise]);

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
    moduleLike,
  } as const;
}
