import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';

import { useSQLJS } from './SQLJSProvider';
import type { DatabaseRole, DatasetSize } from '@/features/database/schemas';

interface ManagedDatabase {
  instance: any | null;
  persistent: boolean;
  createdAt: number | null;
  role?: DatabaseRole;
  skillId?: string;
  size?: DatasetSize;
}

type DatabaseState = Record<string, ManagedDatabase | null>;

interface GetDatabaseOptions {
  persistent?: boolean;
  role?: DatabaseRole;
  skillId?: string;
  size?: DatasetSize;
}

interface DatabaseContextValue {
  databases: DatabaseState;
  getDatabase: (key: string, schema: string, options?: GetDatabaseOptions) => any | null;
  resetDatabase: (key: string) => void;
  resetAllDatabases: () => void;
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export function useDatabaseContext() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider');
  }
  return context;
}

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const SQLJS = useSQLJS();
  const [databases, setDatabases] = useState<DatabaseState>({});
  const databasesRef = useRef<DatabaseState>({});

  const [isReady, setIsReady] = useState(false);

  // Initialize readiness when SQLJS is available
  useEffect(() => {
    setIsReady(!!SQLJS);
  }, [SQLJS]);

  // Create a database with the given schema and context-specific setup
  const createDatabase = useCallback((schema: string) => {
    if (!SQLJS) return null;

    try {
      const db = new SQLJS.Database();
      console.log(schema)
      db.run(schema);
      return db;
    } catch (error) {
      console.error('Failed to create database instance:', error);
      return null;
    }
  }, [SQLJS]);

  const updateDatabases = useCallback((updater: (prev: DatabaseState) => DatabaseState) => {
    setDatabases((prev) => {
      const next = updater(prev);
      databasesRef.current = next;
      return next;
    });
  }, []);

  // Get or create a database for the given context key and schema
  const getDatabase = useCallback((key: string, schema: string, options?: GetDatabaseOptions) => {
    const existing = databasesRef.current[key];
    if (existing?.instance) {
      return existing.instance;
    }

    const newInstance = createDatabase(schema);
    const entry: ManagedDatabase | null = newInstance
      ? {
          instance: newInstance,
          persistent: options?.persistent ?? false,
          role: options?.role,
          skillId: options?.skillId,
          size: options?.size,
          createdAt: Date.now(),
        }
      : null;

    updateDatabases((prev) => ({
      ...prev,
      [key]: entry,
    }));

    return newInstance;
  }, [createDatabase, updateDatabases]);

  // Reset a specific database context
  const resetDatabase = useCallback((key: string) => {
    const entry = databasesRef.current[key];
    if (entry?.instance && typeof entry.instance.close === 'function') {
      try {
        entry.instance.close();
      } catch (error) {
        console.warn(`Error closing database "${key}":`, error);
      }
    }

    updateDatabases((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, [updateDatabases]);

  // Reset all databases
  const resetAllDatabases = useCallback(() => {
    Object.entries(databasesRef.current).forEach(([key, entry]) => {
      if (entry?.instance && typeof entry.instance.close === 'function') {
        try {
          entry.instance.close();
        } catch (error) {
          console.warn(`Error closing database "${key}":`, error);
        }
      }
    });

    databasesRef.current = {};
    setDatabases({});
  }, []);

  // Reset only transient (non-persistent) databases
  const resetTransientDatabases = useCallback(() => {
    const next: DatabaseState = { ...databasesRef.current };
    Object.entries(databasesRef.current).forEach(([key, entry]) => {
      if (!entry) {
        delete next[key];
        return;
      }
      if (entry.persistent) {
        return;
      }

      if (entry.instance && typeof entry.instance.close === 'function') {
        try {
          entry.instance.close();
        } catch (error) {
          console.warn(`Error closing transient database "${key}":`, error);
        }
      }
      delete next[key];
    });

    databasesRef.current = next;
    setDatabases(next);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Keep persistent databases alive; cleanup transient DBs only
      resetTransientDatabases();
    };
  }, [resetTransientDatabases]);

  // Auto-cleanup: drop transient databases older than 30 minutes
  useEffect(() => {
    const CHECK_INTERVAL_MS = 60_000; // 1 minute
    const MAX_AGE_MS = 30 * 60_000; // 30 minutes

    const interval = setInterval(() => {
      const now = Date.now();
      const keysToRemove: string[] = [];

      Object.entries(databasesRef.current).forEach(([key, entry]) => {
        if (!entry || entry.persistent) return;
        if (!entry.createdAt) return;
        if (now - entry.createdAt <= MAX_AGE_MS) return;

        if (entry.instance && typeof entry.instance.close === 'function') {
          try {
            entry.instance.close();
          } catch (error) {
            console.warn(`Error closing stale database "${key}":`, error);
          }
        }
        keysToRemove.push(key);
      });

      if (keysToRemove.length === 0) {
        return;
      }

      updateDatabases((prev) => {
        const next = { ...prev };
        keysToRemove.forEach((key) => {
          delete next[key];
        });
        return next;
      });
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [updateDatabases]);

  // Cleanup on tab visibility change (keep playground persistent)
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        resetTransientDatabases();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [resetTransientDatabases]);

  const value: DatabaseContextValue = {
    databases,
    getDatabase,
    resetDatabase,
    resetAllDatabases,
    isReady,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}
