/**
 * Mock data module - provides table definitions and schema building utilities.
 *
 * Structure:
 * - tables/  : All table definitions with full and small row sets
 * - utils/   : CSV parsing and SQL helpers
 * - types.ts : Type definitions
 */

import { tableDefinitions, type TableKey } from './tables';
import { buildInsertStatement } from './utils';
import type { DatasetSize, SqlCell, TableDefinition, Attributes, AttributeType } from './types';

// Re-export types
export type { DatasetSize, SqlCell, TableDefinition, TableKey, Attributes, AttributeType };

// Re-export table definitions
export { tableDefinitions };

// Re-export utilities (for external use if needed)
export { parseCsv, buildRows, formatSqlValue, buildInsertStatement } from './utils';

/**
 * Options for building a database schema.
 */
interface BuildSchemaOptions {
  /** Table keys to include in the schema */
  tables: TableKey[];
  /** Dataset size to use ('full' or 'small') */
  size?: DatasetSize;
}

/**
 * Build SQL statements to create and populate tables.
 *
 * @param options - Tables to include and size to use
 * @returns SQL string with CREATE TABLE and INSERT statements
 */
export function buildSchema({ tables, size = 'small' }: BuildSchemaOptions): string {
  if (!tables || tables.length === 0) {
    return '';
  }

  const statements: string[] = [];
  const seen = new Set<string>();

  tables.forEach((tableKey) => {
    const definition = tableDefinitions[tableKey];
    if (!definition || seen.has(definition.name)) {
      return;
    }
    seen.add(definition.name);

    statements.push(definition.createStatement);
    const rows = definition.rows[size];
    if (rows.length > 0) {
      statements.push(buildInsertStatement(definition.name, rows));
    }
  });

  return statements.join('\n\n').trim();
}

/**
 * Extract column names from a CREATE TABLE statement.
 */
function extractColumns(createStatement: string): string[] {
  const body = createStatement.match(/\(([\s\S]+)\)/)?.[1];
  if (!body) return [];

  return body
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/,$/, ''))
    .filter((line) => line.length > 0)
    .filter((line) => !/^(primary|foreign|unique|constraint|check)\b/i.test(line))
    .map((line) => line.split(/\s+/)[0])
    .map((column) => column.replace(/^[`"[]?(.+?)[`"\]]?$/, '$1'))
    .filter(Boolean);
}

/**
 * Get a completion schema (table → columns mapping) for SQL autocompletion.
 *
 * @param tables - Table keys to include
 * @returns Object mapping table names to column name arrays
 */
export function getCompletionSchemaForTables(tables: TableKey[]): Record<string, string[]> {
  const schema: Record<string, string[]> = {};
  const seen = new Set<string>();

  tables.forEach((tableKey) => {
    const definition = tableDefinitions[tableKey];
    if (!definition || seen.has(definition.name)) return;

    const columns = extractColumns(definition.createStatement);
    if (columns.length === 0) return;

    schema[definition.name] = columns;
    seen.add(definition.name);
  });

  return schema;
}

/**
 * Get table names from a schema SQL string.
 */
export function getTableNames(schema: string): string[] {
  const matches = schema.match(/CREATE TABLE (\w+)/gi);
  if (!matches) return [];
  return matches.map((match) => match.replace(/CREATE TABLE /i, '').trim());
}
