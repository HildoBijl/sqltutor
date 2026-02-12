/**
 * SQL-Valley specific database hook.
 * Knows about content, tables, and sizes - wraps the generic SQL.js functionality.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDatabaseContext, type QueryResult } from '@/components/sql/sqljs';
import { buildSchema, getCompletionSchemaForTables, type DatasetSize, type TableKey } from '@/mockData';
import { getModuleTables, getModuleSize } from '@/curriculum/utils/moduleAccess';

interface DatabaseOptions {
  /** Module ID (skill or concept) to determine tables and size */
  moduleId?: string;
  /** Override tables (ignores contentId for table resolution) */
  tables?: TableKey[];
  /** Override dataset size */
  size?: DatasetSize;
  /** Custom cache key for the database instance */
  cacheKey?: string;
  /** Whether to reset the database when schema changes */
  resetOnSchemaChange?: boolean;
  /** Whether to persist the database across page navigations */
  persistent?: boolean;
}

interface UseDatabaseReturn {
  database: any | null;
  executeQuery: (query: string) => Promise<QueryResult[]>;
  resetDatabase: () => void;
  clearQueryState: () => void;
  isReady: boolean;
  isExecuting: boolean;
  error: string | null;
  queryResult: QueryResult[] | null;
  queryError: Error | null;
  tableNames: string[];
  completionSchema: Record<string, string[]>;
}

export function useDatabase(options: DatabaseOptions = {}): UseDatabaseReturn {
  const {
    moduleId,
    tables,
    size,
    cacheKey,
    resetOnSchemaChange = true,
    persistent = false,
  } = options;

  const { databases: contextDatabases, getDatabase, resetDatabase: resetContextDatabase, isReady: contextReady } = useDatabaseContext();

  const [currentSchema, setCurrentSchema] = useState<string>('');
  const [database, setDatabase] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult[] | null>(null);
  const [queryError, setQueryError] = useState<Error | null>(null);
  const [tableNames, setTableNames] = useState<string[]>([]);

  const clearQueryState = useCallback(() => {
    setQueryResult(null);
    setQueryError(null);
  }, []);

  // Resolve the dataset size
  const resolvedSize = useMemo(
    () => size ?? getModuleSize(moduleId),
    [size, moduleId],
  );

  // Resolve the tables to include
  const resolvedTables = useMemo(() => {
    if (tables?.length) {
      return Array.from(new Set(tables)) as TableKey[];
    }
    const moduleTables = getModuleTables(moduleId);
    return Array.from(new Set(moduleTables)) as TableKey[];
  }, [tables, moduleId]);

  // Build the schema SQL
  const resolvedSchema = useMemo(
    () => buildSchema({ tables: resolvedTables, size: resolvedSize }),
    [resolvedTables, resolvedSize],
  );

  // Build completion schema for SQL editor
  const completionSchema = useMemo(
    () => getCompletionSchemaForTables(resolvedTables),
    [resolvedTables],
  );

  // Generate a unique key for this database instance
  const contextKey = useMemo(() => {
    if (cacheKey) return cacheKey;
    const tablesSignature = resolvedTables.join('|');
    return `${moduleId ?? 'default'}:size=${resolvedSize}:tables=${tablesSignature}`;
  }, [cacheKey, moduleId, resolvedTables, resolvedSize]);

  // Update database when schema changes, provider DB instance changes, or context is ready
  useEffect(() => {
    if (!contextReady || !resolvedSchema) return;

    const schemaChanged = currentSchema !== resolvedSchema;
    const providerEntry = contextDatabases[contextKey];
    const providerDb = providerEntry?.instance ?? null;
    const shouldResetForSchema = resetOnSchemaChange && schemaChanged;

    if (shouldResetForSchema && providerDb) {
      resetContextDatabase(contextKey);
      setDatabase(null);
      return;
    }

    // If provider has no DB for this context, create it
    if (!providerDb) {
      const db = getDatabase(contextKey, resolvedSchema, {
        persistent,
        metadata: { moduleId, size: resolvedSize },
      });
      setDatabase(db);
      setCurrentSchema(resolvedSchema);
      setError(null);
      if (db) {
        try {
          const tables = db.exec(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
          );
          if (tables[0]) {
            setTableNames(tables[0].values.map((row: any[]) => row[0]));
          } else {
            setTableNames([]);
          }
        } catch (err) {
          console.warn('Could not fetch table names:', err);
          setTableNames([]);
        }
      }
      return;
    }

    // If provider DB exists but local ref differs, sync it and refresh table names
    if (providerDb && (database !== providerDb || schemaChanged)) {
      setDatabase(providerDb);
      setCurrentSchema(resolvedSchema);
      setError(null);
      try {
        const tables = providerDb.exec(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
        );
        if (tables[0]) {
          setTableNames(tables[0].values.map((row: any[]) => row[0]));
        } else {
          setTableNames([]);
        }
      } catch (err) {
        console.warn('Could not fetch table names:', err);
        setTableNames([]);
      }
    }
  }, [
    contextReady,
    resolvedSchema,
    currentSchema,
    contextKey,
    persistent,
    moduleId,
    resolvedSize,
    resetOnSchemaChange,
    getDatabase,
    resetContextDatabase,
    contextDatabases,
    database,
  ]);

  // Execute query function
  const executeQuery = useCallback(async (query: string): Promise<QueryResult[]> => {
    if (!database) {
      throw new Error(`Database not ready for ${contextKey}`);
    }

    setIsExecuting(true);
    setQueryError(null);

    try {
      const result = database.exec(query);
      setQueryResult(result);
      return result;
    } catch (err) {
      const message = ((): string => {
        if (err instanceof Error) return err.message;
        if (typeof err === 'string') return err;
        try {
          return (err as any)?.message ?? JSON.stringify(err);
        } catch {
          return 'Query execution failed';
        }
      })();
      const error = new Error(message || 'Query execution failed');
      setQueryResult(null);
      setQueryError(error);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [database, contextKey]);

  // Reset current database
  const resetDatabase = useCallback(() => {
    resetContextDatabase(contextKey);
    setDatabase(null);
    clearQueryState();
    setError(null);
  }, [contextKey, resetContextDatabase, clearQueryState]);

  return {
    database,
    executeQuery,
    resetDatabase,
    clearQueryState,
    isReady: contextReady && !!database,
    isExecuting,
    error,
    queryResult,
    queryError,
    tableNames,
    completionSchema,
  };
}

/** Playground database - full dataset, persistent */
export function usePlaygroundDatabase() {
  return useDatabase({
    moduleId: 'playground',
    size: 'full',
    persistent: true,
    resetOnSchemaChange: true,
  });
}

/** Concept pages - small dataset */
export function useConceptDatabase() {
  return useDatabase({
    size: 'small',
    resetOnSchemaChange: true,
  });
}

/** Skill practice - module-specific tables (full dataset) */
export function useSkillDatabase(skillId: string) {
  return useDatabase({
    moduleId: skillId,
    size: 'full',
    resetOnSchemaChange: true,
  });
}

/** Theory examples - all tables with small dataset */
export function useTheorySampleDatabase() {
  return useDatabase({
    moduleId: 'playground',
    size: 'small',
    resetOnSchemaChange: true,
  });
}
