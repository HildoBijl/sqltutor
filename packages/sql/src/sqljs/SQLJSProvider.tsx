/**
 * SQL.js WASM loader provider.
 * Initializes SQL.js and provides the instance to child components.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import initSqlJs, { type SqlJsStatic } from 'sql.js';

declare const SQLJS_WASM_BASE64: string;

function decodeWasmBinary(encodedBinary: string): ArrayBuffer {
  const binary = atob(encodedBinary);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return buffer;
}

interface SQLJSContextType {
  SQLJS: SqlJsStatic | null;
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
  const [SQLJS, setSQLJS] = useState<SqlJsStatic | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSQL = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const SQLJSInstance = await initSqlJs({
          wasmBinary: decodeWasmBinary(SQLJS_WASM_BASE64),
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
