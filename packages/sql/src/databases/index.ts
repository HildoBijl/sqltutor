/**
 * SQL-Valley specific database hooks.
 *
 * These hooks know about content, skills, tables, and sizes.
 * They wrap the generic SQL.js functionality for SQL Valley's needs.
 */

export {
  useDatabase,
  usePlaygroundDatabase,
  useTheorySampleDatabase,
} from './useDatabase';

// Re-export QueryResult type for convenience
export type { QueryResult } from '../sqljs';
