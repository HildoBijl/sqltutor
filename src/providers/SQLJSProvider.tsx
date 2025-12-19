import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import initSqlJs from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

interface SQLJSContextType {
  SQLJS: any | null;
  error: Error | null;
  isLoading: boolean;
  isReady: boolean;
}

const SQLJSContext = createContext<SQLJSContextType>({
  SQLJS: null,
  error: null,
  isLoading: true,
  isReady: false,
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
        isReady: !!SQLJS && !isLoading && !error,
      }}
    >
      {children}
    </SQLJSContext.Provider>
  );
}

export function useSQLJS() {
  return useSQLJSContext().SQLJS;
}

export function useSQLJSLoading() {
  return useSQLJSContext().isLoading;
}

export function useSQLJSReady() {
  return useSQLJSContext().isReady;
}

export function useSQLJSError() {
  return useSQLJSContext().error;
}
