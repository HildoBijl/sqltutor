import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import initSqlJs from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

interface SQLJSContextType {
  SQLJS: any | null;
  error: Error | null;
  isLoading: boolean;
}

const SQLJSContext = createContext<SQLJSContextType>({
  SQLJS: null,
  error: null,
  isLoading: true,
});

export function useSQLJSContext() {
  return useContext(SQLJSContext);
}

interface SQLJSProviderProps {
  children: ReactNode;
}

export function SQLJSProvider({ children }: SQLJSProviderProps) {
  const [SQLJS, setSQLJS] = useState<any | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSQL = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const SQLJSInstance = await initSqlJs({
          locateFile: (file: string) => (
            file === 'sql-wasm.wasm' ? sqlWasmUrl : `/sqljs/${file}`
          ),
        });

        setSQLJS(SQLJSInstance);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize SQL.js');
        setError(error);
        console.error('SQL.js initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSQL();
  }, []);

  return (
    <SQLJSContext.Provider
      value={{
        SQLJS,
        error,
        isLoading,
      }}
    >
      {children}
    </SQLJSContext.Provider>
  );
}

// Hook to use SQLJS
export function useSQLJS() {
  const { SQLJS } = useSQLJSContext();
  return SQLJS;
}

// Hook to check if SQLJS is ready
export function useSQLJSReady() {
  const { SQLJS, isLoading, error } = useSQLJSContext();
  return {
    isReady: !!SQLJS && !isLoading && !error,
    isLoading,
    error,
  };
}

// Hook for SQLJS error state
export function useSQLJSError() {
  return useSQLJSContext().error;
}
