/**
 * Main grading function for comparing query results.
 */

import type { QueryResult } from '@/curriculum/utils/types';

import type { ComparisonResult, CompareOptions } from './types';
import { DEFAULT_OPTIONS } from './types';
import {
  EMPTY_RESULT_MESSAGE,
  TOO_MANY_COLUMNS_MESSAGE,
  TOO_FEW_COLUMNS_MESSAGE,
  TOO_MANY_ROWS_MESSAGE,
  TOO_FEW_ROWS_MESSAGE,
  COLUMN_ORDER_MESSAGE,
  ROW_VALUE_MISMATCH_MESSAGE,
  SUCCESS_MESSAGE,
} from './messages';
import {
  normalizeColumn,
  normalizeRow,
  mapNormalizedToOriginal,
  buildColumnSignatures,
} from './tableManipulation';
import {
  formatQuotedList,
  formatDifferenceSample,
  formatSampleDifferences,
  getColumnNameMismatchFeedback,
} from './formatting';

/**
 * Internal context for grading operations.
 */
interface GradingContext {
  actual: QueryResult;
  expected: QueryResult;
  actualCols: string[];
  expectedCols: string[];
  actualRowCount: number;
  expectedRowCount: number;
  actualColumnCount: number;
  expectedColumnCount: number;
  ignoreColumnOrder: boolean;
  ignoreColumnNames: boolean;
  ignoreRowOrder: boolean;
  caseSensitive: boolean;
}

/**
 * Result from column comparison, including the column mapping if successful.
 */
interface ColumnComparisonResult {
  error?: ComparisonResult;
  columnMapping: number[];
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate that both query results are present and non-empty.
 */
function validateInputs(
  actual: QueryResult | undefined,
  expected: QueryResult | undefined,
): ComparisonResult | null {
  if (!expected || !actual) {
    return {
      match: false,
      feedback: EMPTY_RESULT_MESSAGE,
    };
  }
  return null;
}

// ============================================================================
// Column Comparison
// ============================================================================

/**
 * Compare columns when column names must match.
 */
function compareColumnsWithNames(ctx: GradingContext): ColumnComparisonResult {
  const { actual, expected, actualCols, expectedCols, ignoreColumnOrder, caseSensitive } = ctx;
  const identityMapping = expected.columns.map((_, idx) => idx);

  // Check for missing or extra columns
  const missingCols = expectedCols.filter((col) => !actualCols.includes(col));
  const extraCols = actualCols.filter((col) => !expectedCols.includes(col));

  if (missingCols.length > 0 || extraCols.length > 0) {
    const missingOriginal = mapNormalizedToOriginal(missingCols, expectedCols, expected.columns);
    const extraOriginal = mapNormalizedToOriginal(extraCols, actualCols, actual.columns);
    const feedbackMessage = getColumnNameMismatchFeedback(missingOriginal, extraOriginal);
    return {
      error: {
        match: false,
        feedback: feedbackMessage ?? TOO_MANY_COLUMNS_MESSAGE,
        details: {
          expectedRows: ctx.expectedRowCount,
          actualRows: ctx.actualRowCount,
          columnMismatch: [...missingOriginal, ...extraOriginal],
        },
      },
      columnMapping: identityMapping,
    };
  }

  // Check column count
  if (ctx.expectedColumnCount !== ctx.actualColumnCount) {
    return {
      error: {
        match: false,
        feedback:
          ctx.actualColumnCount > ctx.expectedColumnCount
            ? TOO_MANY_COLUMNS_MESSAGE
            : TOO_FEW_COLUMNS_MESSAGE,
        details: {
          expectedRows: ctx.expectedRowCount,
          actualRows: ctx.actualRowCount,
        },
      },
      columnMapping: identityMapping,
    };
  }

  // Determine column mapping
  if (ignoreColumnOrder) {
    const columnMapping = expectedCols.map((col) => actualCols.indexOf(col));
    return { columnMapping };
  }

  // Check column order when required
  for (let index = 0; index < expectedCols.length; index += 1) {
    if (expectedCols[index] !== actualCols[index]) {
      return {
        error: {
          match: false,
          feedback: COLUMN_ORDER_MESSAGE,
          details: {
            expectedRows: ctx.expectedRowCount,
            actualRows: ctx.actualRowCount,
          },
        },
        columnMapping: identityMapping,
      };
    }
  }

  return { columnMapping: identityMapping };
}

/**
 * Compare columns by their content signatures (when ignoring column names).
 */
function compareColumnsByContent(ctx: GradingContext): ColumnComparisonResult {
  const { actual, expected, ignoreColumnOrder, ignoreRowOrder, caseSensitive } = ctx;
  const identityMapping = expected.columns.map((_, idx) => idx);

  // Check column count first
  if (ctx.expectedColumnCount !== ctx.actualColumnCount) {
    return {
      error: {
        match: false,
        feedback:
          ctx.actualColumnCount > ctx.expectedColumnCount
            ? TOO_MANY_COLUMNS_MESSAGE
            : TOO_FEW_COLUMNS_MESSAGE,
        details: {
          expectedRows: ctx.expectedRowCount,
          actualRows: ctx.actualRowCount,
        },
      },
      columnMapping: identityMapping,
    };
  }

  // Early row count check for content-based matching
  if (ctx.expectedRowCount !== ctx.actualRowCount) {
    return {
      error: {
        match: false,
        feedback:
          ctx.actualRowCount > ctx.expectedRowCount ? TOO_MANY_ROWS_MESSAGE : TOO_FEW_ROWS_MESSAGE,
        details: {
          expectedRows: ctx.expectedRowCount,
          actualRows: ctx.actualRowCount,
        },
      },
      columnMapping: identityMapping,
    };
  }

  // Build column signatures for content-based matching
  const expectedSignatures = buildColumnSignatures(expected.values, caseSensitive, ignoreRowOrder);
  const actualSignatures = buildColumnSignatures(actual.values, caseSensitive, ignoreRowOrder);

  if (ignoreColumnOrder) {
    // Match columns by their content
    const usedActualColumns = new Set<number>();
    const columnMapping = expectedSignatures.map((signature) => {
      const matchIndex = actualSignatures.findIndex(
        (candidate, idx) => !usedActualColumns.has(idx) && candidate === signature,
      );
      if (matchIndex !== -1) {
        usedActualColumns.add(matchIndex);
      }
      return matchIndex;
    });

    if (columnMapping.some((index) => index === -1)) {
      const unmatchedActualColumns = actual.columns.filter(
        (_, idx) => !usedActualColumns.has(idx),
      );
      const columnHint = unmatchedActualColumns.length
        ? ` Check the values in ${formatQuotedList(unmatchedActualColumns)}.`
        : ' Check the values in your columns.';
      return {
        error: {
          match: false,
          feedback: `There seem to be incorrect values in one or more columns.${columnHint}`,
          details: {
            expectedRows: ctx.expectedRowCount,
            actualRows: ctx.actualRowCount,
          },
        },
        columnMapping: identityMapping,
      };
    }

    return { columnMapping };
  }

  // Check columns in order
  for (let index = 0; index < expectedSignatures.length; index += 1) {
    if (expectedSignatures[index] !== actualSignatures[index]) {
      const actualLabel = actual.columns[index];
      const columnLabel = actualLabel ? ` "${actualLabel}"` : '';
      return {
        error: {
          match: false,
          feedback: `There seem to be incorrect values in the column${columnLabel}. Check the values from this column.`,
          details: {
            expectedRows: ctx.expectedRowCount,
            actualRows: ctx.actualRowCount,
          },
        },
        columnMapping: identityMapping,
      };
    }
  }

  return { columnMapping: identityMapping };
}

/**
 * Compare columns based on comparison options.
 * Returns column mapping if successful, or an error result.
 */
function compareColumns(ctx: GradingContext): ColumnComparisonResult {
  if (!ctx.ignoreColumnNames) {
    return compareColumnsWithNames(ctx);
  }
  return compareColumnsByContent(ctx);
}

// ============================================================================
// Row Comparison
// ============================================================================

/**
 * Check if row counts match.
 */
function compareRowCounts(ctx: GradingContext): ComparisonResult | null {
  if (ctx.expectedRowCount !== ctx.actualRowCount) {
    return {
      match: false,
      feedback:
        ctx.actualRowCount > ctx.expectedRowCount ? TOO_MANY_ROWS_MESSAGE : TOO_FEW_ROWS_MESSAGE,
      details: {
        expectedRows: ctx.expectedRowCount,
        actualRows: ctx.actualRowCount,
      },
    };
  }
  return null;
}

/**
 * Compare row values after column mapping has been established.
 */
function compareRows(
  ctx: GradingContext,
  columnMapping: number[],
): ComparisonResult | null {
  const { actual, expected, ignoreColumnOrder, ignoreRowOrder, caseSensitive } = ctx;
  const identityMapping = expected.columns.map((_, idx) => idx);

  // Normalize rows for comparison
  const expectedRows = expected.values.map((row) =>
    normalizeRow(row, ignoreColumnOrder ? columnMapping : identityMapping, caseSensitive),
  );

  const actualRows = actual.values.map((row) =>
    normalizeRow(
      row,
      actual.columns.map((_, idx) => idx),
      caseSensitive,
    ),
  );

  // Sort if row order doesn't matter
  if (ignoreRowOrder) {
    expectedRows.sort();
    actualRows.sort();
  }

  // Find differences
  const differences: Array<{ index: number; row: string }> = [];
  for (let index = 0; index < expectedRows.length && differences.length < 3; index += 1) {
    if (expectedRows[index] !== actualRows[index]) {
      differences.push({ index, row: actualRows[index] });
    }
  }

  if (differences.length > 0) {
    return {
      match: false,
      feedback: `${ROW_VALUE_MISMATCH_MESSAGE}${formatSampleDifferences(differences, !ignoreRowOrder)}`,
      details: {
        expectedRows: ctx.expectedRowCount,
        actualRows: ctx.actualRowCount,
        sampleDifferences: differences.map((sample) =>
          formatDifferenceSample(sample, !ignoreRowOrder),
        ),
      },
    };
  }

  return null;
}

// ============================================================================
// Main Grading Function
// ============================================================================

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
    actualCols: validActual.columns.map((col) => normalizeColumn(col, caseSensitive)),
    expectedCols: validExpected.columns.map((col) => normalizeColumn(col, caseSensitive)),
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
  const columnResult = compareColumns(ctx);
  if (columnResult.error) return columnResult.error;

  // Compare row counts
  const rowCountError = compareRowCounts(ctx);
  if (rowCountError) return rowCountError;

  // Compare row values
  const rowError = compareRows(ctx, columnResult.columnMapping);
  if (rowError) return rowError;

  // Success
  return {
    match: true,
    feedback: SUCCESS_MESSAGE,
    details: {
      expectedRows: ctx.expectedRowCount,
      actualRows: ctx.actualRowCount,
    },
  };
}
