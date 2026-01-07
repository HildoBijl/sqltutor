import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ExecutionResult as SqlExecutionResult } from '@/curriculum/types';
import type { SkillComponentState } from '@/store';
import { useDatabase } from '@/hooks/useDatabase';
import {
  useSkillExerciseState,
  type SkillExerciseModuleLike,
  type SkillExerciseProgress,
} from '../useSkillExerciseState';
import type { PracticeFeedback } from '../components/SkillPractice';
import type { SkillExercise, QueryResultSet, PracticeSolution, PracticeSolutionLike } from '../types';
import { normalizePracticeSolution } from '../utils/normalizePracticeSolution';

const normalizeForHistory = (value: string) =>
  value.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');

interface UseSkillExerciseControllerParams {
  skillId: string;
  skillModule: SkillExerciseModuleLike | null;
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
    unavailableMessage?: string;
    solution: PracticeSolution | null;
    hasGivenUp: boolean;
    exerciseCompleted: boolean;
    queryResult: ReadonlyArray<QueryResultSet> | null;
    queryError: Error | null;
    description: string;
    tableNames: string[];
    completionSchema: Record<string, string[]>;
    canSubmit: boolean;
    canGiveUp: boolean;
    hasExecutedQuery: boolean;
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
    autoComplete: (options?: { insertIntoEditor?: boolean }) => Promise<void> | void;
    nextExercise: () => void;
    dismissFeedback: () => void;
  };
}

export function useSkillExerciseController({
  skillId,
  skillModule,
  requiredCount,
  componentState,
  setComponentState,
}: UseSkillExerciseControllerParams): SkillExerciseControllerState {
  const {
    executeQuery: executeDisplayQuery,
    queryResult,
    queryError,
    isReady: displayDbReady,
    isExecuting,
    tableNames,
    completionSchema,
    resetDatabase: resetDisplayDatabase,
    clearQueryState,
  } = useDatabase({
    role: 'display',
    skillId,
    resetOnSchemaChange: true,
  });

  const {
    database: gradingDatabase,
    executeQuery: executeGradingQuery,
    isReady: gradingDbReady,
    resetDatabase: resetGradingDatabase,
  } = useDatabase({
    role: 'grading',
    skillId,
    resetOnSchemaChange: true,
  });

  const dbReady = displayDbReady && gradingDbReady;

  const {
    progress: exerciseProgress,
    status: exerciseStatus,
    currentExercise,
    dispatch: exerciseDispatch,
    solution: exerciseSolution,
    recordAttempt,
  } = useSkillExerciseState(skillId, skillModule);

  const [query, setQuery] = useState('');
  const [feedback, setFeedbackState] = useState<PracticeFeedback | null>(null);
  const [feedbackSubmissionKey, setFeedbackSubmissionKey] = useState<string | null>(null);
  const [feedbackHidden, setFeedbackHidden] = useState(false);
  const [hasGivenUp, setHasGivenUp] = useState(false);
  const [showGiveUpDialog, setShowGiveUpDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [hasExecutedQuery, setHasExecutedQuery] = useState(false);
  const [hasSubmittedAttempt, setHasSubmittedAttempt] = useState(false);
  const [revealedSolution, setRevealedSolution] = useState<PracticeSolution | null>(null);

  const updateFeedback = useCallback(
    (nextFeedback: PracticeFeedback | null, metadata?: { normalizedQuery?: string | null }) => {
      setFeedbackState(nextFeedback);

      if (nextFeedback && (nextFeedback.type === 'error' || nextFeedback.type === 'warning')) {
        setFeedbackSubmissionKey(metadata?.normalizedQuery ?? null);
        setFeedbackHidden(false);
      } else {
        setFeedbackSubmissionKey(null);
        setFeedbackHidden(false);
      }
    },
    [],
  );

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
    setRevealedSolution(null);
    updateFeedback(null);
    setHasExecutedQuery(false);
    setHasSubmittedAttempt(false);
  }, [currentExercise, setHasExecutedQuery, setHasSubmittedAttempt, setRevealedSolution, updateFeedback]);

  useEffect(() => {
    return () => {
      resetDisplayDatabase();
      resetGradingDatabase();
    };
  }, [resetDisplayDatabase, resetGradingDatabase]);

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
        updateFeedback(null);
        setHasExecutedQuery(false);
        clearQueryState();
        return;
      }

      try {
        await executeDisplayQuery(liveQuery);
        setHasExecutedQuery(true);
      } catch (error) {
        console.debug('Live query execution failed:', error);
      }
    },
    [clearQueryState, dbReady, exerciseCompleted, currentExercise, executeDisplayQuery, updateFeedback],
  );

  const handleExecute = useCallback(
    async (override?: string) => {
      const rawQuery = override ?? query;
      const effectiveQuery = rawQuery.trim();
      if (!currentExercise || !effectiveQuery) return;
      setHasSubmittedAttempt(true);
      setHasExecutedQuery(true);

      if (hasGivenUp) {
        updateFeedback(null);
        return;
      }

      if (exerciseCompleted) {
        updateFeedback({ message: 'Already completed. Click Next Exercise to continue.', type: 'info' });
        return;
      }

      if (!dbReady) {
        updateFeedback({ message: 'Database is still loading. Please try again in a moment.', type: 'info' });
        return;
      }

      const normalized = normalizeForHistory(effectiveQuery);
      const previousAttempt = exerciseProgress.attempts.find(
        (attempt) => attempt.normalizedInput === normalized,
      );
      if (previousAttempt) {
        exerciseDispatch({ type: 'input', input: effectiveQuery, result: null });
        updateFeedback(
          {
            message: previousAttempt.feedback || 'You already tried this exact query.',
            type:
              previousAttempt.status === 'correct'
                ? 'success'
                : previousAttempt.status === 'invalid'
                  ? 'warning'
                  : previousAttempt.status === 'incorrect'
                    ? 'error'
                    : 'info',
          },
          { normalizedQuery: normalized },
        );
        return;
      }

      const supportsOutputValidation =
        typeof skillModule?.validateOutput === 'function' && typeof skillModule?.verifyOutput === 'function';

      if (!supportsOutputValidation) {
        console.warn('Skill module missing verifyOutput/validateOutput implementation:', skillId);
        updateFeedback(
          {
            message:
              'This exercise cannot be verified yet because it lacks result validation. Please try another exercise.',
            type: 'warning',
          },
          { normalizedQuery: normalized },
        );
        return;
      }

      try {
        let execution: SqlExecutionResult;
        try {
          const output = await executeDisplayQuery(effectiveQuery);
          execution = { success: true, output };
        } catch (error: any) {
          const err = error instanceof Error ? error : new Error(String(error));
          execution = { success: false, error: err };
        }

        const validation = skillModule!.validateOutput!(currentExercise, execution);

        if (!validation.ok) {
          recordAttempt({ input: effectiveQuery, result: execution.output ?? null, validation });
          updateFeedback(
            {
              message: validation.message || 'Query result has invalid structure.',
              type: 'warning',
            },
            { normalizedQuery: normalized },
          );
          return;
        }

        if (!gradingDatabase) {
          updateFeedback(
            {
              message: 'Database is not ready for verification. Please try again in a moment.',
              type: 'warning',
            },
            { normalizedQuery: normalized },
          );
          return;
        }

        let gradingExecution: SqlExecutionResult;
        try {
          const gradingOutput = await executeGradingQuery(effectiveQuery);
          gradingExecution = { success: true, output: gradingOutput };
        } catch (error: any) {
          const err = error instanceof Error ? error : new Error(String(error));
          gradingExecution = { success: false, error: err };
        }

        if (!gradingExecution.success || !gradingExecution.output) {
          updateFeedback(
            {
              message:
                gradingExecution.error?.message ??
                'Unable to verify results because the grading database query failed.',
              type: 'error',
            },
            { normalizedQuery: normalized },
          );
          return;
        }

        const verification = skillModule!.verifyOutput!(
          currentExercise,
          gradingExecution.output,
          gradingDatabase,
        );

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
            updateFeedback({
              message:
                verification.message ||
                `Excellent! Exercise completed successfully! (${progressDisplay}/${requiredCount})`,
              type: 'success',
            });
          }
        } else {
          updateFeedback(
            {
              message: verification.message || 'Not quite right. Check your query and try again!',
              type: 'error',
            },
            { normalizedQuery: normalized },
          );
        }
      } catch (error: any) {
        updateFeedback(
          {
            message: 'Query error: ' + (error?.message || 'Unknown error'),
            type: 'warning',
          },
          { normalizedQuery: normalized },
        );
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
      executeDisplayQuery,
      recordAttempt,
      componentState.numSolved,
      requiredCount,
      queueComponentStateUpdate,
      hasGivenUp,
      updateFeedback,
      executeGradingQuery,
      gradingDatabase,
    ],
  );

  const handleAutoComplete = useCallback(async (options?: { insertIntoEditor?: boolean }) => {
    if (!currentExercise) return;

    let solution = exerciseSolution;

    if (!solution && typeof skillModule?.getSolution === 'function') {
      solution = normalizePracticeSolution(skillModule.getSolution(currentExercise) ?? null);
    }

    if (!solution && (currentExercise as Record<string, unknown>).expectedQuery) {
      solution = normalizePracticeSolution(
        (currentExercise as Record<string, unknown>).expectedQuery as PracticeSolutionLike,
      );
    }

    if (!solution && skillModule?.solutionTemplate) {
      const templated = skillModule.solutionTemplate.replace(/{{(.*?)}}/g, (_m, token) => {
        const key = String(token).trim();
        const value = (currentExercise as Record<string, unknown>)[key];
        return value !== undefined && value !== null ? String(value) : '';
      });
      solution = normalizePracticeSolution(templated);
    }

    if (!solution) {
      updateFeedback({ message: 'No auto-solution available for this exercise.', type: 'info' });
      return;
    }

    const shouldInsertIntoEditor = options?.insertIntoEditor ?? true;

    if (shouldInsertIntoEditor) {
      setQuery(solution.query);
    }
    setRevealedSolution(solution);
  }, [currentExercise, exerciseSolution, setQuery, setRevealedSolution, skillModule, updateFeedback]);

  const handleNewExercise = useCallback(() => {
    if (!exerciseCompleted && !hasGivenUp) {
      updateFeedback({ message: 'Finish the current exercise before moving on.', type: 'info' });
      return;
    }
    exerciseDispatch({ type: 'generate' });
    setQuery('');
    updateFeedback(null);
    setHasGivenUp(false);
    setHasExecutedQuery(false);
    setHasSubmittedAttempt(false);
    setRevealedSolution(null);
  }, [exerciseCompleted, exerciseDispatch, hasGivenUp, setRevealedSolution, updateFeedback]);

  const openGiveUpDialog = useCallback(() => {
    setShowGiveUpDialog(true);
  }, []);

  const closeGiveUpDialog = useCallback(() => {
    setShowGiveUpDialog(false);
  }, []);

  const handleGiveUpConfirm = useCallback(() => {
    setShowGiveUpDialog(false);
    setHasGivenUp(true);
    updateFeedback(null);
    void handleAutoComplete({ insertIntoEditor: false });
  }, [handleAutoComplete, updateFeedback]);

  const handleSetQuery = useCallback(
    (value: string) => {
      setQuery(value);

      if (!feedback) {
        setFeedbackHidden(false);
        return;
      }

      if (feedbackSubmissionKey && (feedback.type === 'error' || feedback.type === 'warning')) {
        const normalizedValue = normalizeForHistory(value);

        if (!normalizedValue) {
          setFeedbackHidden(true);
          updateFeedback(null);
          clearQueryState();
          return;
        }

        setFeedbackHidden(normalizedValue !== feedbackSubmissionKey);
      } else {
        setFeedbackHidden(false);
      }
    },
    [clearQueryState, feedback, feedbackSubmissionKey, setFeedbackHidden, setQuery, updateFeedback],
  );

  const practiceExerciseTitle = useMemo(
    () => ((componentState.numSolved || 0) >= requiredCount ? 'Practice Exercise' : 'Exercise'),
    [componentState.numSolved, requiredCount],
  );

  const practiceUnavailableMessage = skillModule
    ? null
    : 'Practice exercises are not available yet. Explore the data while we prepare new challenges.';

  const normalizedExercise = currentExercise
    ? (currentExercise as SkillExercise)
    : null;

  const exerciseDescription = useMemo(() => {
    if (!normalizedExercise) {
      return '';
    }
    if (typeof skillModule?.getDescription === 'function') {
      const value = skillModule.getDescription(normalizedExercise);
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
    }
    const fallback = normalizedExercise.description;
    if (typeof fallback === 'string' && fallback.trim().length > 0) {
      return fallback;
    }
    // Handle older/stale exercise shapes that may not carry a description.
    const prompt = (normalizedExercise as Record<string, unknown>).prompt;
    if (typeof prompt === 'string' && prompt.trim().length > 0) {
      return prompt;
    }
    return 'Practice exercise';
  }, [normalizedExercise, skillModule]);

  useEffect(() => {
    const description = exerciseDescription?.trim() ?? '';
    if ((normalizedExercise || exerciseProgress.exercise) && !description) {
      exerciseDispatch({ type: 'generate' });
    }
  }, [exerciseDescription, normalizedExercise, exerciseProgress.exercise, exerciseDispatch]);

  const normalizedResults = queryResult as ReadonlyArray<QueryResultSet> | null;

  const canSubmit =
    Boolean(normalizedExercise) &&
    Boolean(query.trim()) &&
    !isExecuting &&
    dbReady &&
    !queryError;

  const canGiveUp = Boolean(normalizedExercise) && !isExecuting && hasSubmittedAttempt;

  return {
    practice: {
      title: practiceExerciseTitle,
      query,
      feedback: feedbackHidden ? null : feedback,
      currentExercise: normalizedExercise,
      unavailableMessage: practiceUnavailableMessage ?? undefined,
      solution: revealedSolution ?? exerciseSolution ?? null,
      hasGivenUp,
      exerciseCompleted,
      queryResult: normalizedResults,
      queryError,
      description: exerciseDescription,
      tableNames,
      completionSchema,
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
      setQuery: handleSetQuery,
      submit: handleExecute,
      liveExecute: handleLiveExecute,
      autoComplete: handleAutoComplete,
      nextExercise: handleNewExercise,
      dismissFeedback: () => updateFeedback(null),
    },
  };
}

export type { SkillExerciseControllerState };
