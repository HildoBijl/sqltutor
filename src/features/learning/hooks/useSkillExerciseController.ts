import { useCallback, useEffect, useMemo, useState } from 'react';

import type { SchemaKey } from '@/features/database/schemas';
import type { ExecutionResult as SqlExecutionResult } from '@/features/content/types';
import type { SkillComponentState } from '@/store';
import { useDatabase } from '@/shared/hooks/useDatabase';
import {
  useSkillExerciseState,
  type SkillExerciseModuleLike,
  type SkillExerciseProgress,
} from '../useSkillExerciseState';
import type { PracticeFeedback } from '../components/SkillPractice';
import type { SkillExercise, QueryResultSet } from '../types';

const normalizeForHistory = (value: string) =>
  value.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');

interface UseSkillExerciseControllerParams {
  skillId: string;
  skillModule: SkillExerciseModuleLike | null;
  schema: SchemaKey;
  requiredCount: number;
  componentState: SkillComponentState;
  setComponentState: (
    updater:
      | Partial<SkillComponentState>
      | SkillComponentState
      | ((prev: SkillComponentState) => Partial<SkillComponentState> | SkillComponentState)
  ) => void;
}

interface SkillExerciseControllerState {
  practice: {
    title: string;
    query: string;
    feedback: PracticeFeedback | null;
    currentExercise: SkillExercise | null;
    solution: string | null;
    hasGivenUp: boolean;
    exerciseCompleted: boolean;
    queryResult: ReadonlyArray<QueryResultSet> | null;
    queryError: Error | null;
    tableNames: string[];
    canSubmit: boolean;
    canGiveUp: boolean;
  };
  status: {
    dbReady: boolean;
    isExecuting: boolean;
  };
  progress: {
    value: SkillExerciseProgress;
    requiredCount: number;
  };
  dialogs: {
    giveUp: {
      open: boolean;
      openDialog: () => void;
      closeDialog: () => void;
      confirmGiveUp: () => void;
    };
    completion: {
      open: boolean;
      close: () => void;
      show: () => void;
    };
  };
  actions: {
    setQuery: (value: string) => void;
    submit: (override?: string) => Promise<void> | void;
    liveExecute: (query: string) => Promise<void> | void;
    autoComplete: () => Promise<void> | void;
    nextExercise: () => void;
    dismissFeedback: () => void;
  };
}

export function useSkillExerciseController({
  skillId,
  skillModule,
  schema,
  requiredCount,
  componentState,
  setComponentState,
}: UseSkillExerciseControllerParams): SkillExerciseControllerState {
  const {
    database,
    executeQuery,
    queryResult,
    queryError,
    isReady: dbReady,
    isExecuting,
    tableNames,
    resetDatabase,
  } = useDatabase({
    context: 'exercise',
    schema,
    resetOnSchemaChange: true,
    persistent: false,
  });

  const {
    progress: exerciseProgress,
    status: exerciseStatus,
    currentExercise,
    dispatch: exerciseDispatch,
    solution: exerciseSolution,
    recordAttempt,
  } = useSkillExerciseState(skillId, skillModule);

  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);
  const [hasGivenUp, setHasGivenUp] = useState(false);
  const [showGiveUpDialog, setShowGiveUpDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [hasExecutedQuery, setHasExecutedQuery] = useState(false);

  const queueComponentStateUpdate = useCallback(
    (updater: Parameters<typeof setComponentState>[0]) => {
      Promise.resolve().then(() => {
        setComponentState(updater);
      });
    },
    [setComponentState],
  );

  const exerciseCompleted = exerciseStatus === 'correct';

  useEffect(() => {
    setHasGivenUp(false);
  }, [currentExercise]);

  useEffect(() => {
    return () => {
      resetDatabase();
    };
  }, [resetDatabase]);

  useEffect(() => {
    if (!dbReady || !skillModule) return;
    if (!exerciseProgress.exercise) {
      exerciseDispatch({ type: 'generate' });
    }
  }, [dbReady, skillModule, exerciseProgress.exercise, exerciseDispatch]);

  const handleLiveExecute = useCallback(
    async (liveQuery: string) => {
      if (!dbReady || exerciseCompleted || !currentExercise) return;

      if (!liveQuery.trim()) {
        setFeedback(null);
        setHasExecutedQuery(false);
        return;
      }

      try {
        await executeQuery(liveQuery);
        setHasExecutedQuery(true);
      } catch (error) {
        console.debug('Live query execution failed:', error);
      }
    },
    [dbReady, exerciseCompleted, currentExercise, executeQuery],
  );

  const handleExecute = useCallback(
    async (override?: string) => {
      const rawQuery = override ?? query;
      const effectiveQuery = rawQuery.trim();
      if (!currentExercise || !effectiveQuery) return;
      setHasExecutedQuery(true);

      if (hasGivenUp) {
        setFeedback({
          message: 'You chose to view the solution. Review it, then move on to the next exercise.',
          type: 'info',
        });
        return;
      }

      if (exerciseCompleted) {
        setFeedback({ message: 'Already completed. Click Next Exercise to continue.', type: 'info' });
        return;
      }

      if (!dbReady) {
        setFeedback({ message: 'Database is still loading. Please try again in a moment.', type: 'info' });
        return;
      }

      const normalized = normalizeForHistory(effectiveQuery);
      const previousAttempt = exerciseProgress.attempts.find(
        (attempt) => attempt.normalizedInput === normalized,
      );
      if (previousAttempt) {
        exerciseDispatch({ type: 'input', input: effectiveQuery, result: null });
        setFeedback({
          message: previousAttempt.feedback || 'You already tried this exact query.',
          type:
            previousAttempt.status === 'correct'
              ? 'success'
              : previousAttempt.status === 'invalid'
                ? 'warning'
                : previousAttempt.status === 'incorrect'
                  ? 'error'
                  : 'info',
        });
        return;
      }

      const supportsOutputValidation =
        typeof skillModule?.validateOutput === 'function' && typeof skillModule?.verifyOutput === 'function';

      if (!supportsOutputValidation) {
        console.warn('Skill module missing verifyOutput/validateOutput implementation:', skillId);
        setFeedback({
          message:
            'This exercise cannot be verified yet because it lacks result validation. Please try another exercise.',
          type: 'warning',
        });
        return;
      }

      try {
        let execution: SqlExecutionResult;
        try {
          const output = await executeQuery(effectiveQuery);
          execution = { success: true, output };
        } catch (error: any) {
          const err = error instanceof Error ? error : new Error(String(error));
          execution = { success: false, error: err };
        }

        const validation = skillModule!.validateOutput!(currentExercise, execution);

        if (!validation.ok) {
          recordAttempt({ input: effectiveQuery, result: execution.output ?? null, validation });
          setFeedback({
            message: validation.message || 'Query result has invalid structure.',
            type: 'warning',
          });
          return;
        }

        if (!database) {
          setFeedback({
            message: 'Database is not ready for verification. Please try again in a moment.',
            type: 'warning',
          });
          return;
        }

        const outputForVerification = execution.output ?? [];
        const verification = skillModule!.verifyOutput!(currentExercise, outputForVerification, database);

        recordAttempt({
          input: effectiveQuery,
          result: execution.output ?? null,
          validation,
          verification,
        });

        if (verification.correct) {
          const previousSolvedCount = componentState.numSolved || 0;
          const alreadyCounted = exerciseCompleted;
          const updatedSolvedCount = alreadyCounted ? previousSolvedCount : previousSolvedCount + 1;

          if (!alreadyCounted) {
            queueComponentStateUpdate((prev) => ({ ...prev, numSolved: updatedSolvedCount }));
          }

          const reachedMasteryNow =
            !alreadyCounted && updatedSolvedCount >= requiredCount && previousSolvedCount < requiredCount;

          if (reachedMasteryNow) {
            setShowCompletionDialog(true);
          } else {
            const progressDisplay = Math.min(updatedSolvedCount, requiredCount);
            setFeedback({
              message:
                verification.message ||
                `Excellent! Exercise completed successfully! (${progressDisplay}/${requiredCount})`,
              type: 'success',
            });
          }
        } else {
          setFeedback({
            message: verification.message || 'Not quite right. Check your query and try again!',
            type: 'error',
          });
        }
      } catch (error: any) {
        setFeedback({
          message: 'Query error: ' + (error?.message || 'Unknown error'),
          type: 'warning',
        });
      }
    },
    [
      query,
      currentExercise,
      exerciseCompleted,
      dbReady,
      exerciseProgress.attempts,
      exerciseDispatch,
      skillModule,
      skillId,
      executeQuery,
      recordAttempt,
      database,
      componentState.numSolved,
      requiredCount,
      queueComponentStateUpdate,
      hasGivenUp,
    ],
  );

  const handleAutoComplete = useCallback(async () => {
    if (!currentExercise) return;

    let solution = exerciseSolution;

    if (!solution && typeof skillModule?.getSolution === 'function') {
      solution = skillModule.getSolution(currentExercise) ?? undefined;
    }

    if (!solution && (currentExercise as Record<string, unknown>).expectedQuery) {
      solution = (currentExercise as Record<string, unknown>).expectedQuery as string;
    }

    if (!solution && skillModule?.solutionTemplate) {
      solution = skillModule.solutionTemplate.replace(/{{(.*?)}}/g, (_m, token) => {
        const key = String(token).trim();
        const value = (currentExercise as Record<string, unknown>)[key];
        return value !== undefined && value !== null ? String(value) : '';
      });
    }

    if (!solution) {
      setFeedback({ message: 'No auto-solution available for this exercise.', type: 'info' });
      return;
    }

    setQuery(solution);
  }, [currentExercise, exerciseSolution, skillModule]);

  const handleNewExercise = useCallback(() => {
    if (!exerciseCompleted && !hasGivenUp) {
      setFeedback({ message: 'Finish the current exercise before moving on.', type: 'info' });
      return;
    }
    exerciseDispatch({ type: 'generate' });
    setQuery('');
    setFeedback(null);
    setHasGivenUp(false);
    setHasExecutedQuery(false);
  }, [exerciseCompleted, exerciseDispatch, hasGivenUp]);

  const openGiveUpDialog = useCallback(() => {
    setShowGiveUpDialog(true);
  }, []);

  const closeGiveUpDialog = useCallback(() => {
    setShowGiveUpDialog(false);
  }, []);

  const handleGiveUpConfirm = useCallback(() => {
    setShowGiveUpDialog(false);
    setFeedback({
      message: 'Solution loaded. Take a moment to review it and explore the Theory page for more guidance.',
      type: 'info',
    });
    setHasGivenUp(true);
    void handleAutoComplete();
  }, [handleAutoComplete]);

  const practiceExerciseTitle = useMemo(
    () => ((componentState.numSolved || 0) >= requiredCount ? 'Practice Exercise' : 'Exercise'),
    [componentState.numSolved, requiredCount],
  );

  const normalizedExercise = currentExercise
    ? (currentExercise as SkillExercise)
    : null;

  const normalizedResults = queryResult as ReadonlyArray<QueryResultSet> | null;

  const canSubmit =
    Boolean(normalizedExercise) &&
    Boolean(query.trim()) &&
    !isExecuting &&
    dbReady &&
    !queryError;

  const canGiveUp = Boolean(normalizedExercise) && !isExecuting;

  return {
    practice: {
      title: practiceExerciseTitle,
      query,
      feedback,
      currentExercise: normalizedExercise,
      solution: exerciseSolution ?? null,
      hasGivenUp,
      exerciseCompleted,
      queryResult: normalizedResults,
      queryError,
      tableNames,
      canSubmit,
      canGiveUp,
      hasExecutedQuery,
    },
    status: {
      dbReady,
      isExecuting,
    },
    progress: {
      value: exerciseProgress,
      requiredCount,
    },
    dialogs: {
      giveUp: {
        open: showGiveUpDialog,
        openDialog: openGiveUpDialog,
        closeDialog: closeGiveUpDialog,
        confirmGiveUp: handleGiveUpConfirm,
      },
      completion: {
        open: showCompletionDialog,
        close: () => setShowCompletionDialog(false),
        show: () => setShowCompletionDialog(true),
      },
    },
    actions: {
      setQuery: (value: string) => setQuery(value),
      submit: handleExecute,
      liveExecute: handleLiveExecute,
      autoComplete: handleAutoComplete,
      nextExercise: handleNewExercise,
      dismissFeedback: () => setFeedback(null),
    },
  };
}

export type { SkillExerciseControllerState };
