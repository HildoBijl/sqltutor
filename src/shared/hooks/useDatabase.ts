import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDatabaseContext } from '@/shared/providers/DatabaseProvider';
import {
  buildSchema,
  getTablesForSchema,
  resolveDatasetSize,
  resolveSkillTables,
  type DatabaseRole,
  type DatasetSize,
  type SchemaKey,
  type TableKey,
} from '@/features/database/schemas';

export interface QueryResult {
  columns: string[];
  values: any[][];
}

interface DatabaseOptions {
  role: DatabaseRole;
  skillId?: string;
  schema?: SchemaKey;
  tables?: TableKey[];
  size?: DatasetSize;
  cacheKey?: string;
  resetOnSchemaChange?: boolean;
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
}

export function useDatabase(options: DatabaseOptions): UseDatabaseReturn {
  const {
    role,
    skillId,
    schema,
    tables,
    size,
    cacheKey,
    resetOnSchemaChange = true,
    persistent = false,
  } = options;

  const { databases: contextDatabases, getDatabase, resetDatabase: resetContextDatabase, isReady: contextReady } = useDatabaseContext();
  console.log(contextDatabases)

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

  const resolvedSize = useMemo(() => resolveDatasetSize(role, skillId, size), [role, skillId, size]);

  const resolvedTables = useMemo(() => {
    const sourceTables: TableKey[] | undefined = tables?.length
      ? tables
      : schema
        ? getTablesForSchema(schema)
        : resolveSkillTables(role, skillId);

    const baseTables = (sourceTables && sourceTables.length > 0 ? sourceTables : ['employees']) as TableKey[];
    const deduped = Array.from(new Set(baseTables));
    return deduped as TableKey[];
  }, [tables, schema, role, skillId]);

  const resolvedSchema = useMemo(() => {
    return buildSchema({ tables: resolvedTables, size: resolvedSize, role });
  }, [resolvedTables, resolvedSize, role]);

  const contextKey = useMemo(() => {
    const base = cacheKey ?? `${role}:${skillId ?? 'global'}`;
    const tablesSignature = resolvedTables.join('|');
    return `${base}:size=${resolvedSize}:tables=${tablesSignature}`;
  }, [cacheKey, role, skillId, resolvedTables, resolvedSize]);

  // Update database when schema changes, provider DB instance changes, or context is ready
  useEffect(() => {
    if (!contextReady || !resolvedSchema) return;

    const schemaChanged = currentSchema !== resolvedSchema;
    const providerEntry = contextDatabases[contextKey];
    const providerDb = providerEntry?.instance ?? null;
    const shouldResetForSchema = resetOnSchemaChange && schemaChanged;

    if (shouldResetForSchema && providerDb) {
      // Only reset early if there is an existing provider DB to close
      resetContextDatabase(contextKey);
      setDatabase(null);
      return;
    }

    // If provider has no DB for this context, create it
    if (!providerDb) {
      const db = getDatabase(contextKey, resolvedSchema, {
        persistent,
        role,
        skillId,
        size: resolvedSize,
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
    role,
    skillId,
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
  }, [database, contextKey]);

  // Reset current database
  const resetDatabase = useCallback(() => {
    resetContextDatabase(contextKey);
    // Clear local ref so effect reinitializes a new DB instance
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
  };
}

// Convenience hooks for specific contexts
export function usePlaygroundDatabase(schema: SchemaKey = 'full') {
  return useDatabase({
    role: 'display',
    skillId: 'playground',
    schema,
    persistent: true,
    resetOnSchemaChange: true,
  });
}

export function useConceptDatabase(schema: SchemaKey = 'core') {
  return useDatabase({
    role: 'theory',
    schema,
    resetOnSchemaChange: true,
  });
}

// Small, sample-friendly database for theory examples across all tables.
export function useTheorySampleDatabase(schema: SchemaKey = 'full') {
  return useDatabase({
    role: 'theory',
    schema,
    resetOnSchemaChange: true,
  });
}
