/**
 * Main grading function for comparing query results.
 */

import type { QueryResult } from '@/components/sql/sqljs/types';

import type { ComparisonResult, CompareOptions } from './types';
import { DEFAULT_OPTIONS } from './types';
import { SUCCESS_MESSAGE } from './messages';
import { normalizeColumnName } from './tableManipulation';
import {
  compareColumns,
  compareRowCount,
  compareRows,
  validateInputs,
  type GradingContext,
} from './gradingSupport';

/**
 * Compare two query results and provide grading feedback.
 *
 * @param actual - The user's query result
 * @param expected - The expected (model solution) query result
 * @param options - Comparison options
 * @returns Comparison result with match status and feedback
 */
export function compareQueryResults(
  actual: QueryResult | undefined,
  expected: QueryResult | undefined,
  options: CompareOptions = {},
): ComparisonResult {
  // Merge options with defaults
  const { requireEqualColumnOrder, requireEqualColumnNames, ignoreRowOrder, caseSensitive } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Validate inputs
  const inputError = validateInputs(actual, expected);
  if (inputError) return inputError;

  // At this point, both actual and expected are defined
  const validActual = actual!;
  const validExpected = expected!;

  // Build grading context
  const ctx: GradingContext = {
    actual: validActual,
    expected: validExpected,
    actualColumnNames: validActual.columns.map((col) => normalizeColumnName(col, caseSensitive)),
    expectedColumnNames: validExpected.columns.map((col) => normalizeColumnName(col, caseSensitive)),
    actualRowCount: validActual.values.length,
    expectedRowCount: validExpected.values.length,
    actualColumnCount: validActual.columns.length,
    expectedColumnCount: validExpected.columns.length,
    ignoreColumnOrder: !requireEqualColumnOrder,
    ignoreColumnNames: !requireEqualColumnNames,
    ignoreRowOrder,
    caseSensitive,
  };

  // Compare columns
  const { error: columnError, columnMapping } = compareColumns(ctx);
  if (columnError) return columnError;

  // Compare row counts
  const rowCountError = compareRowCount(ctx);
  if (rowCountError) return rowCountError;

  // Compare row values
  const rowError = compareRows(ctx, columnMapping);
  if (rowError) return rowError;

  // Success
  return {
    match: true,
    feedback: SUCCESS_MESSAGE,
  };
}
