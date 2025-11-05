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
} from './exerciseEngine';
import {
  useComponentState,
  type ExerciseInstanceId,
  type SkillComponentState,
  type StoredExerciseEvent,
  type StoredExerciseInstance,
  type StoredExerciseState,
} from '@/store';

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

export interface SkillExerciseModuleLike {
  generate?: (helpers: ExerciseHelpers) => any;
  validate?: (input: string, exerciseState: any, result: unknown) => boolean;
  validateInput?: (args: ValidateInputArgs<any, string, unknown>) => ValidationResult;
  validateOutput?: (exercise: any, result: unknown) => ValidationResult;
  verifyOutput?: (exercise: any, output: unknown, database?: unknown) => VerificationResult;
  getSolution?: (exercise: any) => string | null | undefined;
  runDemo?: (args: { exercise: any; helpers: ExerciseHelpers }) => unknown;
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

export function useSkillExerciseState(componentId: string, moduleLike: SkillExerciseModuleLike | null) {
  const [componentState, setComponentState] = useComponentState<SkillComponentState>(componentId, 'skill');
  const queueComponentStateUpdate = useCallback(
    (updater: Parameters<typeof setComponentState>[0]) => {
      Promise.resolve().then(() => {
        setComponentState(updater);
      });
    },
    [setComponentState],
  );

  const helpers = useMemo<ExerciseHelpers>(
    () => ({
      selectRandomly: <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)],
      randomInt: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
    }),
    [],
  );

  const exerciseConfig = useMemo<SimpleExerciseConfig<any, string, unknown, unknown>>(() => {
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

  useEffect(() => {
    if (componentState.currentInstanceId) return;
    const instances = Object.values(componentState.instances || {});
    if (instances.length === 0) return;

    let latest: StoredExerciseInstance | undefined;
    for (const instance of instances) {
      if (!latest || instance.createdAt > latest.createdAt) {
        latest = instance;
      }
    }
    if (latest) {
      setComponentState({ currentInstanceId: latest.id });
    }
  }, [componentState.currentInstanceId, componentState.instances, setComponentState]);

  useEffect(() => {
    const instanceId = componentState.currentInstanceId;
    if (!instanceId) {
      setProgress((prev) => (prev.status === 'idle' && prev.attempts.length === 0 ? prev : createInitialProgress()));
      return;
    }

    const instance = componentState.instances[instanceId];
    if (!instance || instance.events.length === 0) {
      setProgress(createInitialProgress());
      return;
    }

    const lastEvent = instance.events[instance.events.length - 1];
    setProgress((prev) => {
      if (
        prev.generatedAt === lastEvent.resultingState.generatedAt &&
        prev.status === lastEvent.resultingState.status &&
        prev.attempts.length === lastEvent.resultingState.attempts.length
      ) {
        return prev;
      }
      return rehydrateExerciseState(lastEvent.resultingState, exerciseConfig);
    });
  }, [componentState.currentInstanceId, componentState.instances, exerciseConfig]);

  const appendEvent = useCallback(
    (instanceId: ExerciseInstanceId, action: ExerciseAction<string, unknown>, storedState: SkillStoredExerciseState) => {
      const timestamp = Date.now();
      const event: StoredExerciseEvent = {
        timestamp,
        action,
        resultingState: storedState,
      };

      queueComponentStateUpdate((prev) => {
        const current = prev.instances[instanceId] ?? {
          id: instanceId,
          skillId: componentId,
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

        return {
          ...prev,
          instances: {
            ...prev.instances,
            [instanceId]: updated,
          },
        };
      });
    },
    [componentId, queueComponentStateUpdate],
  );

  const dispatch: Dispatch = useCallback(
    (action) => {
      setProgress((prev) => {
        const next = reducer(prev, action);
        if (next === prev) return prev;

        const storedState = extractStorableState<any, string, unknown, unknown>(next);

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
            skillId: componentId,
            createdAt: timestamp,
            finalStatus: storedState.status,
            completedAt: storedState.status === 'correct' ? timestamp : undefined,
            events: [event],
          };

          queueComponentStateUpdate((prevState) => ({
            ...prevState,
            currentInstanceId: instanceId,
            instances: {
              ...prevState.instances,
              [instanceId]: instance,
            },
          }));
        } else if (action.type !== 'hydrate') {
          const currentInstanceId = componentState.currentInstanceId;
          if (!currentInstanceId) {
            // No active instance - start a new one implicitly
            const fallbackId = generateInstanceId();
            queueComponentStateUpdate((prevState) => ({
              ...prevState,
              currentInstanceId: fallbackId,
            }));
            appendEvent(fallbackId, action, storedState);
          } else {
            appendEvent(currentInstanceId, action, storedState);
          }
        }

        return next;
      });
    },
    [appendEvent, componentId, componentState.currentInstanceId, queueComponentStateUpdate, reducer],
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
