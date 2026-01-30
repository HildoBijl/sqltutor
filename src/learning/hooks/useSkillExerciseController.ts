import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ExecutionResult as SqlExecutionResult } from '@/curriculum/utils/types';
import { useAppStore, type SkillComponentState } from '@/learning/store';
import { useDatabase } from '@/learning/databases';
import type { DatasetSize } from '@/mockData';
import {
  useSkillExerciseState,
  type SkillExerciseOption,
  type SkillExerciseModuleLike,
  type SkillExerciseProgress,
} from '../useSkillExerciseState';
import type { PracticeFeedback } from '../components/SkillPractice';
import type { SkillExercise, QueryResultSet, PracticeSolution, PracticeSolutionLike } from '../types';
import { normalizePracticeSolution } from '../utils/normalizePracticeSolution';

const normalizeForHistory = (value: string) =>
  value.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');

const normalizeExerciseLabel = (value: string) => value.replace(/\s+/g, ' ').trim();

const SMALL_DATASET_WARNING =
  'You are using the small data set. This data set is meant to get a quick intuition of the data, but it does not support all exercises. Consider using the full data set to get the full real-life experience.';

const hasResultRows = (results?: ReadonlyArray<QueryResultSet> | null) =>
  Boolean(results?.some((result) => (result?.values?.length ?? 0) > 0));

const isResultEmpty = (results?: ReadonlyArray<QueryResultSet> | null) => !hasResultRows(results);

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
    datasetSize: DatasetSize;
    datasetWarning: string | null;
    exerciseOptions: SkillExerciseOption[];
    selectedExerciseId: string | null;
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
    setDatasetSize: (size: DatasetSize) => void;
    selectExercise: (exerciseId: string) => void;
  };
}

export function useSkillExerciseController({
  skillId,
  skillModule,
  requiredCount,
  componentState,
  setComponentState,
}: UseSkillExerciseControllerParams): SkillExerciseControllerState {
  const selectedDatasetSize = useAppStore((state) => state.practiceDatasetSize);
  const setPracticeDatasetSize = useAppStore((state) => state.setPracticeDatasetSize);
  // Display database (user-selected dataset for showing results to user)
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
    contentId: skillId,
    size: selectedDatasetSize,
    resetOnSchemaChange: true,
  });

  // Grading database (full dataset for verification)
  const {
    database: gradingDatabase,
    executeQuery: executeGradingQuery,
    isReady: gradingDbReady,
    resetDatabase: resetGradingDatabase,
  } = useDatabase({
    contentId: skillId,
    size: 'full',
    cacheKey: `${skillId}:grading`,
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
  const [datasetWarning, setDatasetWarning] = useState<{ message: string; queryKey: string } | null>(null);
  const [pendingDatasetRefresh, setPendingDatasetRefresh] = useState(false);
  const latestQueryKeyRef = useRef('');
  const datasetSizeRef = useRef<DatasetSize>(selectedDatasetSize);
  const lastExecutedQueryRef = useRef('');
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
    const normalizedQuery = normalizeForHistory(query);
    latestQueryKeyRef.current = normalizedQuery;

    if (datasetWarning && datasetWarning.queryKey !== normalizedQuery) {
      setDatasetWarning(null);
    }
  }, [datasetWarning, query]);

  useEffect(() => {
    datasetSizeRef.current = selectedDatasetSize;
    setDatasetWarning(null);
    setHasExecutedQuery(false);
    clearQueryState();
    setPendingDatasetRefresh(true);
  }, [selectedDatasetSize, clearQueryState]);

  useEffect(() => {
    setHasGivenUp(false);
    setRevealedSolution(null);
    updateFeedback(null);
    setHasExecutedQuery(false);
    setDatasetWarning(null);
    setPendingDatasetRefresh(false);
    lastExecutedQueryRef.current = '';
  }, [currentExercise, setHasExecutedQuery, setRevealedSolution, updateFeedback]);

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

  const handleDatasetSizeChange = useCallback(
    (size: DatasetSize) => {
      if (size === selectedDatasetSize) return;
      setPracticeDatasetSize(size);
    },
    [selectedDatasetSize, setPracticeDatasetSize],
   );

  const evaluateSmallDatasetWarning = useCallback(
    async (
      executedQuery: string,
      displayOutput: ReadonlyArray<QueryResultSet> | null | undefined,
      fullOutput?: ReadonlyArray<QueryResultSet> | null,
    ) => {
      const normalizedQuery = normalizeForHistory(executedQuery);
      if (!normalizedQuery) {
        setDatasetWarning(null);
        return;
      }

      if (selectedDatasetSize !== 'small') {
        setDatasetWarning(null);
        return;
      }

      if (!isResultEmpty(displayOutput)) {
        setDatasetWarning(null);
        return;
      }

      let resolvedFullOutput = fullOutput;
      if (!resolvedFullOutput) {
        if (!gradingDatabase) {
          setDatasetWarning(null);
          return;
        }
        try {
          resolvedFullOutput = await executeGradingQuery(executedQuery);
        } catch (error) {
          setDatasetWarning(null);
          return;
        }
      }

      if (latestQueryKeyRef.current !== normalizedQuery) {
        return;
      }

      if (datasetSizeRef.current !== 'small') {
        return;
      }

      if (isResultEmpty(resolvedFullOutput)) {
        setDatasetWarning(null);
        return;
      }

      setDatasetWarning({ message: SMALL_DATASET_WARNING, queryKey: normalizedQuery });
    },
    [executeGradingQuery, gradingDatabase, selectedDatasetSize],
  );

  useEffect(() => {
    if (!pendingDatasetRefresh || !displayDbReady) return;
    const queryToRun = lastExecutedQueryRef.current.trim();
    if (!queryToRun) {
      setPendingDatasetRefresh(false);
      return;
    }

    let isActive = true;

    executeDisplayQuery(queryToRun)
      .then((output) => {
        if (!isActive) return;
        setHasExecutedQuery(true);
        void evaluateSmallDatasetWarning(queryToRun, output);
      })
      .catch(() => {
        if (!isActive) return;
        setHasExecutedQuery(false);
        setDatasetWarning(null);
      })
      .finally(() => {
        if (!isActive) return;
        setPendingDatasetRefresh(false);
      });

    return () => {
      isActive = false;
    };
  }, [displayDbReady, executeDisplayQuery, evaluateSmallDatasetWarning, pendingDatasetRefresh]);

  const handleLiveExecute = useCallback(
    async (liveQuery: string) => {
      if (!dbReady || exerciseCompleted || !currentExercise) return;

      if (!liveQuery.trim()) {
        updateFeedback(null);
        setHasExecutedQuery(false);
        clearQueryState();
        setDatasetWarning(null);
        lastExecutedQueryRef.current = '';
        return;
      }

      try {
        lastExecutedQueryRef.current = liveQuery;
        const output = await executeDisplayQuery(liveQuery);
        setHasExecutedQuery(true);
        void evaluateSmallDatasetWarning(liveQuery, output);
      } catch (error) {
        console.debug('Live query execution failed:', error);
        setDatasetWarning(null);
      }
    },
    [
      clearQueryState,
      dbReady,
      exerciseCompleted,
      currentExercise,
      executeDisplayQuery,
      updateFeedback,
      evaluateSmallDatasetWarning,
    ],
  );

  const handleExecute = useCallback(
    async (override?: string) => {
      const rawQuery = override ?? query;
      const effectiveQuery = rawQuery.trim();
      if (!currentExercise || !effectiveQuery) return;
      lastExecutedQueryRef.current = effectiveQuery;
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

        const displayOutput = execution.success ? (execution.output ?? null) : null;
        let validation = skillModule!.validateOutput!(currentExercise, execution);
        let gradingExecution: SqlExecutionResult | null = null;
        const shouldTryFullValidation =
          selectedDatasetSize === 'small' && execution.success && isResultEmpty(displayOutput);

        if (!validation.ok && shouldTryFullValidation) {
          if (!gradingDatabase) {
            updateFeedback(
              {
                message: 'Database is not ready for verification. Please try again in a moment.',
                type: 'warning',
              },
              { normalizedQuery: normalized },
            );
            void evaluateSmallDatasetWarning(effectiveQuery, displayOutput);
            return;
          }

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
            setDatasetWarning(null);
            return;
          }

          validation = skillModule!.validateOutput!(currentExercise, gradingExecution);
        }

        if (!validation.ok) {
          recordAttempt({ input: effectiveQuery, result: execution.output ?? null, validation });
          updateFeedback(
            {
              message: validation.message || 'Query result has invalid structure.',
              type: 'warning',
            },
            { normalizedQuery: normalized },
          );
          if (execution.success) {
            void evaluateSmallDatasetWarning(
              effectiveQuery,
              displayOutput,
              gradingExecution?.output ?? null,
            );
          } else {
            setDatasetWarning(null);
          }
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
          if (execution.success) {
            void evaluateSmallDatasetWarning(
              effectiveQuery,
              displayOutput,
              gradingExecution?.output ?? null,
            );
          } else {
            setDatasetWarning(null);
          }
          return;
        }

        if (!gradingExecution) {
          try {
            const gradingOutput = await executeGradingQuery(effectiveQuery);
            gradingExecution = { success: true, output: gradingOutput };
          } catch (error: any) {
            const err = error instanceof Error ? error : new Error(String(error));
            gradingExecution = { success: false, error: err };
          }
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
          setDatasetWarning(null);
          return;
        }

        void evaluateSmallDatasetWarning(effectiveQuery, displayOutput, gradingExecution.output ?? null);

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
        setDatasetWarning(null);
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
      evaluateSmallDatasetWarning,
      selectedDatasetSize,
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

  const exerciseOptions = useMemo<SkillExerciseOption[]>(() => {
    if (!skillModule?.listExercises || !skillModule?.getExerciseById) return [];
    const options = skillModule.listExercises() ?? [];
    return options.map((option, index) => {
      const baseLabel = normalizeExerciseLabel(option.label || option.id);
      const label = baseLabel ? `${index + 1}. ${baseLabel}` : `Exercise ${index + 1}`;
      return { id: option.id, label };
    });
  }, [skillModule]);

  const selectedExerciseId = useMemo(() => {
    if (!normalizedExercise) return null;
    const id = (normalizedExercise as Record<string, unknown>).id;
    return typeof id === 'string' ? id : null;
  }, [normalizedExercise]);

  const handleSelectExercise = useCallback(
    (exerciseId: string) => {
      if (!skillModule?.getExerciseById) return;
      if (!exerciseId || exerciseId === selectedExerciseId) return;
      const selectedExercise = skillModule.getExerciseById(exerciseId);
      if (!selectedExercise) {
        updateFeedback({ message: 'Selected exercise is not available.', type: 'warning' });
        return;
      }
      exerciseDispatch({ type: 'generate', exercise: selectedExercise });
      setQuery('');
      updateFeedback(null);
      setHasGivenUp(false);
      setHasExecutedQuery(false);
      setRevealedSolution(null);
    },
    [
      exerciseDispatch,
      selectedExerciseId,
      setHasExecutedQuery,
      setHasGivenUp,
      setQuery,
      setRevealedSolution,
      skillModule,
      updateFeedback,
    ],
  );

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

  const canGiveUp = Boolean(normalizedExercise) && !isExecuting;

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
      datasetSize: selectedDatasetSize,
      datasetWarning: datasetWarning?.message ?? null,
      exerciseOptions,
      selectedExerciseId,
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
      setDatasetSize: handleDatasetSizeChange,
      selectExercise: handleSelectExercise,
    },
  };
}

export type { SkillExerciseControllerState };
