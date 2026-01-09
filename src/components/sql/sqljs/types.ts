/**
 * Generic SQL.js types.
 */

/** Result from executing a SQL query */
export interface QueryResult {
  columns: string[];
  values: any[][];
}

/** Options for getting/creating a database */
export interface GetDatabaseOptions {
  /** Whether the database should persist across page navigations */
  persistent?: boolean;
  /** Optional metadata to store with the database */
  metadata?: Record<string, unknown>;
}

/** Managed database instance with metadata */
export interface ManagedDatabase {
  instance: any | null;
  persistent: boolean;
  createdAt: number | null;
  metadata?: Record<string, unknown>;
}
