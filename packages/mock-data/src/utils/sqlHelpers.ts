/**
 * SQL statement generation utilities.
 */

import type { SqlCell } from '../types';

/**
 * Format a value for use in a SQL statement.
 */
export function formatSqlValue(value: SqlCell): string {
  if (value === null || (typeof value === 'number' && !Number.isFinite(value))) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * Build an INSERT statement for multiple rows.
 */
export function buildInsertStatement(table: string, rows: SqlCell[][]): string {
  if (rows.length === 0) return '';
  const values = rows
    .map((row) => `(${row.map(formatSqlValue).join(', ')})`)
    .join(',\n    ');

  return `INSERT INTO ${table} VALUES\n    ${values};`;
}
