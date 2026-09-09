import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ModuleContextProvider } from '@sqlvalley/exercise-engine';
import { useDatabase } from '../../databases';
import type { DatasetSize, TableKey } from '@sqlvalley/mock-data';

import {
  normalizeSqlInput,
  validateSqlExecution,
  verifySqlExecution,
  type CompareOptions,
  type SqlExecutionResult,
  type SqlQueryResult,
} from '@sqlvalley/sql-grading';
import type { SimpleSQLCheckResult } from '../SimpleSQLExercise/types';
import type { SqlModuleContext } from './context';

const SMALL_DATASET_WARNING =
  'You are using the small data set. This data set is meant to get a quick intuition of the data, but it does not support all exercises. Consider using the full data set to get the full real-life experience.';

interface SqlModuleProviderProps {
  skillId: string;
  tables: TableKey[];
  datasetSize: DatasetSize;
  setDatasetSize: (size: DatasetSize) => void;
  children: ReactNode;
}

/**
 * The shared per-skill SQL environment: display + grading databases and the live
 * query runtime, provided to the exercises as their moduleContext. Persists across
 * exercise variants so the databases are not rebuilt on every "next".
 */
export function SqlModuleProvider({
  skillId, tables, datasetSize, setDatasetSize, children,
}: SqlModuleProviderProps) {
  const displayDatabase = useDatabase({
    tables, size: datasetSize, cacheKey: `${skillId}:display`, resetOnSchemaChange: true,
  });
  const gradingDatabase = useDatabase({
    tables, size: 'full', cacheKey: `${skillId}:grading`, resetOnSchemaChange: true,
  });
  const [hasExecutedQuery, setHasExecutedQuery] = useState(false);
  const [datasetWarning, setDatasetWarning] = useState<string | null>(null);
  const [pendingDatasetRefresh, setPendingDatasetRefresh] = useState(false);
  const lastExecutedQueryRef = useRef('');
  const latestQueryKeyRef = useRef('');
  const datasetSizeRef = useRef<DatasetSize>(datasetSize);

  const dbReady = displayDatabase.isReady && gradingDatabase.isReady;

  const evaluateSmallDatasetWarning = useCallback(async (
    query: string,
    displayOutput: ReadonlyArray<SqlQueryResult> | null | undefined,
    fullOutput?: ReadonlyArray<SqlQueryResult> | null,
  ) => {
    const queryKey = normalizeSqlInput(query);
    if (!queryKey || datasetSizeRef.current !== 'small' || hasRows(displayOutput)) {
      setDatasetWarning(null);
      return;
    }
    let resolvedFullOutput = fullOutput;
    if (!resolvedFullOutput) {
      try {
        resolvedFullOutput = await gradingDatabase.executeQuery(query);
      } catch {
        setDatasetWarning(null);
        return;
      }
    }
    if (latestQueryKeyRef.current !== queryKey || datasetSizeRef.current !== 'small') return;
    setDatasetWarning(hasRows(resolvedFullOutput) ? SMALL_DATASET_WARNING : null);
  }, [gradingDatabase.executeQuery]);

  const executeLiveQuery = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    latestQueryKeyRef.current = normalizeSqlInput(query);
    setDatasetWarning(null);
    if (!trimmedQuery) {
      lastExecutedQueryRef.current = '';
      setHasExecutedQuery(false);
      displayDatabase.clearQueryState();
      return;
    }
    lastExecutedQueryRef.current = trimmedQuery;
    try {
      const output = await displayDatabase.executeQuery(trimmedQuery);
      setHasExecutedQuery(true);
      await evaluateSmallDatasetWarning(trimmedQuery, output);
    } catch {
      setHasExecutedQuery(false);
    }
  }, [displayDatabase.clearQueryState, displayDatabase.executeQuery, evaluateSmallDatasetWarning]);

  const grade = useCallback(async (
    rawInput: string,
    solution: string,
    comparisonOptions?: CompareOptions,
  ): Promise<SimpleSQLCheckResult> => {
    const query = rawInput.trim();
    lastExecutedQueryRef.current = query;
    latestQueryKeyRef.current = normalizeSqlInput(query);
    setHasExecutedQuery(true);

    let displayExecution: SqlExecutionResult<SqlQueryResult[]>;
    try {
      displayExecution = { success: true, output: await displayDatabase.executeQuery(query) };
    } catch (error) {
      displayExecution = { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }

    const displayOutput = displayExecution.output ?? null;
    let gradingExecution: SqlExecutionResult<SqlQueryResult[]> | null = null;
    let validation = validateSqlExecution(displayExecution);
    if (!validation.ok && datasetSizeRef.current === 'small' &&
      displayExecution.success && !hasRows(displayOutput)) {
      gradingExecution = await executeForGrading(query, gradingDatabase.executeQuery);
      if (gradingExecution.success) validation = validateSqlExecution(gradingExecution);
    }
    if (!validation.ok) {
      await evaluateSmallDatasetWarning(query, displayOutput, gradingExecution?.output ?? null);
      return { correct: false, feedback: validation.message ?? 'Query result has invalid structure.', feedbackType: 'warning' };
    }
    if (!gradingDatabase.database) {
      return { correct: false, feedback: 'Database is not ready for verification. Please try again in a moment.', feedbackType: 'warning' };
    }

    gradingExecution ??= await executeForGrading(query, gradingDatabase.executeQuery);
    if (!gradingExecution.success || !gradingExecution.output) {
      return { correct: false, feedback: gradingExecution.error?.message ?? 'Unable to verify results because the grading database query failed.', feedbackType: 'error' };
    }

    await evaluateSmallDatasetWarning(query, displayOutput, gradingExecution.output);
    const verification = verifySqlExecution({
      output: gradingExecution.output,
      solution,
      database: gradingDatabase.database,
      comparisonOptions,
    });
    return { correct: verification.correct, feedback: verification.message, feedbackType: verification.correct ? 'success' : 'error' };
  }, [displayDatabase.executeQuery, evaluateSmallDatasetWarning, gradingDatabase.database, gradingDatabase.executeQuery]);

  useEffect(() => {
    datasetSizeRef.current = datasetSize;
    setDatasetWarning(null);
    setHasExecutedQuery(false);
    displayDatabase.clearQueryState();
    setPendingDatasetRefresh(true);
  }, [datasetSize, displayDatabase.clearQueryState]);

  useEffect(() => {
    if (!pendingDatasetRefresh || !displayDatabase.isReady) return;
    const query = lastExecutedQueryRef.current.trim();
    if (!query) {
      setPendingDatasetRefresh(false);
      return;
    }
    let active = true;
    displayDatabase.executeQuery(query)
      .then((output) => {
        if (!active) return;
        setHasExecutedQuery(true);
        void evaluateSmallDatasetWarning(query, output);
      })
      .catch(() => {
        if (!active) return;
        setHasExecutedQuery(false);
        setDatasetWarning(null);
      })
      .finally(() => {
        if (active) setPendingDatasetRefresh(false);
      });
    return () => { active = false; };
  }, [displayDatabase.executeQuery, displayDatabase.isReady, evaluateSmallDatasetWarning, pendingDatasetRefresh]);

  const value = useMemo<SqlModuleContext>(() => ({
    ready: dbReady,
    tableNames: displayDatabase.tableNames,
    completionSchema: displayDatabase.completionSchema,
    queryResult: displayDatabase.queryResult,
    queryError: displayDatabase.queryError,
    hasExecutedQuery,
    datasetSize,
    datasetWarning,
    executeLiveQuery,
    setDatasetSize,
    grade,
  }), [
    dbReady,
    displayDatabase.tableNames,
    displayDatabase.completionSchema,
    displayDatabase.queryResult,
    displayDatabase.queryError,
    hasExecutedQuery,
    datasetSize,
    datasetWarning,
    executeLiveQuery,
    setDatasetSize,
    grade,
  ]);

  return <ModuleContextProvider value={value}>{children}</ModuleContextProvider>;
}

async function executeForGrading(
  query: string,
  executeQuery: (query: string) => Promise<SqlQueryResult[]>,
): Promise<SqlExecutionResult<SqlQueryResult[]>> {
  try {
    return { success: true, output: await executeQuery(query) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

function hasRows(results?: ReadonlyArray<SqlQueryResult> | null): boolean {
  return Boolean(results?.some((result) => result.values.length > 0));
}
