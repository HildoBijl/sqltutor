import { useState, useCallback, useEffect } from 'react';
import { useDatabaseContext, DatabaseContextType } from '@/shared/providers/DatabaseProvider';
import { schemas } from '@/features/database/schemas';

interface QueryResult {
  columns: string[];
  values: any[][];
}

interface DatabaseOptions {
  context: DatabaseContextType;
  schema?: keyof typeof schemas;
  resetOnSchemaChange?: boolean;
  persistent?: boolean; // Only applies to playground context
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
}

export function useDatabase(options: DatabaseOptions): UseDatabaseReturn {
  const {
    context,
    schema,
    resetOnSchemaChange = true,
    persistent = false
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

  // Determine which schema to use
  const resolvedSchema = schema ? schemas[schema] : schemas.companies;

  // Update database when schema changes, provider DB instance changes, or context is ready
  useEffect(() => {
    if (!contextReady || !resolvedSchema) return;

    const schemaChanged = currentSchema !== resolvedSchema;
    const providerDb = contextDatabases[context];
    const shouldResetForSchema = resetOnSchemaChange && schemaChanged;

    if (shouldResetForSchema && contextDatabases[context]) {
      // Only reset early if there is an existing provider DB to close
      resetContextDatabase(context);
      setDatabase(null);
      return;
    }

    // If provider has no DB for this context, create it
    if (!providerDb) {
      const db = getDatabase(context, resolvedSchema);
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
    context,
    persistent,
    resetOnSchemaChange,
    getDatabase,
    resetContextDatabase,
    contextDatabases,
    database,
  ]);

  // Execute query function
  const executeQuery = useCallback(async (query: string): Promise<QueryResult[]> => {
    if (!database) {
      throw new Error(`Database not ready for ${context} context`);
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
          // sql.js sometimes throws objects; best-effort stringify
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
  }, [database, context]);

  // Reset current database
  const resetDatabase = useCallback(() => {
    resetContextDatabase(context);
    // Clear local ref so effect reinitializes a new DB instance
    setDatabase(null);
    clearQueryState();
    setError(null);
  }, [context, resetContextDatabase, clearQueryState]);

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
  };
}

// Convenience hooks for specific contexts
export function usePlaygroundDatabase(schema: keyof typeof schemas = 'companiesAndPositions') {
  return useDatabase({
    context: 'playground',
    schema,
    persistent: true,
    resetOnSchemaChange: true,
  });
}

export function useConceptDatabase(schema: keyof typeof schemas = 'companies') {
  return useDatabase({
    context: 'concept',
    schema,
    resetOnSchemaChange: true,
    persistent: false,
  });
}
