import type { QueryResult } from '@/components/sql/sqljs/types';

import type { ComparisonResult } from './types';
import {
  EMPTY_RESULT_MESSAGE,
  SUCCESS_MESSAGE,
  TOO_MANY_COLUMNS_MESSAGE,
  TOO_FEW_COLUMNS_MESSAGE,
  TOO_MANY_ROWS_MESSAGE,
  TOO_FEW_ROWS_MESSAGE,
  COLUMN_ORDER_MESSAGE,
  getColumnNameMismatchFeedback,
  INCORRECT_VALUES_IN_COLUMNS_MESSAGE,
  INCORRECT_VALUES_IN_COLUMN_MESSAGE,
  ROW_VALUE_MISMATCH_FEEDBACK,
} from './messages';
import {
  normalizeRow,
  mapNormalizedToOriginal,
  buildColumnSignatures,
} from './tableManipulation';
import {
  formatQuotedList,
  formatSampleDifferences,
} from './formatting';

/**
 * Internal context for grading operations.
 */
export interface GradingContext {
  actual: QueryResult;
  expected: QueryResult;
  actualColumnNames: string[];
  expectedColumnNames: string[];
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

/**
 * Validate that both query results are present, or allow both empty (match).
 */
export function validateInputs(
  actual: QueryResult | undefined,
  expected: QueryResult | undefined,
): ComparisonResult | null {
  if (!actual && !expected) {
    return { match: true, feedback: SUCCESS_MESSAGE };
  }
  if (!expected || !actual) {
    return {
      match: false,
      feedback: EMPTY_RESULT_MESSAGE,
    };
  }
  return null;
}

/**
 * Compare columns based on comparison options.
 * Returns column mapping if successful, or an error result.
 */
export function compareColumns(ctx: GradingContext): ColumnComparisonResult {
  if (!ctx.ignoreColumnNames) {
    return compareColumnsWithNames(ctx);
  }
  return compareColumnsByContent(ctx);
}

/**
 * Compare columns when column names must match.
 */
function compareColumnsWithNames(ctx: GradingContext): ColumnComparisonResult {
  const {
    actual,
    expected,
    actualColumnNames,
    expectedColumnNames,
    ignoreColumnOrder,
  } = ctx;
  const identityMapping = expected.columns.map((_, idx) => idx);

  // Check for missing or extra columns
  const missingColumnNames = expectedColumnNames.filter((col) => !actualColumnNames.includes(col));
  const extraColumnNames = actualColumnNames.filter((col) => !expectedColumnNames.includes(col));

  if (missingColumnNames.length > 0 || extraColumnNames.length > 0) {
    const missingOriginal = mapNormalizedToOriginal(
      missingColumnNames,
      expectedColumnNames,
      expected.columns,
    );
    const extraOriginal = mapNormalizedToOriginal(
      extraColumnNames,
      actualColumnNames,
      actual.columns,
    );
    const feedbackMessage = getColumnNameMismatchFeedback(
      missingOriginal,
      extraOriginal,
      formatQuotedList(missingOriginal),
    );
    return {
      error: {
        match: false,
        feedback: feedbackMessage ?? TOO_MANY_COLUMNS_MESSAGE,
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
      },
      columnMapping: identityMapping,
    };
  }

  // Determine column mapping
  if (ignoreColumnOrder) {
    const columnMapping = expectedColumnNames.map((col) => actualColumnNames.indexOf(col));
    return { columnMapping };
  }

  // Check column order when required
  for (let index = 0; index < expectedColumnNames.length; index += 1) {
    if (expectedColumnNames[index] !== actualColumnNames[index]) {
      return {
        error: {
          match: false,
          feedback: COLUMN_ORDER_MESSAGE,
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
      },
      columnMapping: identityMapping,
    };
  }

  // Early row count check for content-based matching
  const rowCountError = compareRowCount(ctx);
  if (rowCountError) {
    return {
      error: rowCountError,
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
      const unmatchedActualColumnNames = actual.columns.filter((_, idx) => !usedActualColumns.has(idx));
      return {
        error: {
          match: false,
          feedback: INCORRECT_VALUES_IN_COLUMNS_MESSAGE(
            unmatchedActualColumnNames.length
              ? formatQuotedList(unmatchedActualColumnNames)
              : undefined,
          ),
        },
        columnMapping: identityMapping,
      };
    }

    return { columnMapping };
  }

  // Check columns in order
  for (let index = 0; index < expectedSignatures.length; index += 1) {
    if (expectedSignatures[index] !== actualSignatures[index]) {
      return {
        error: {
          match: false,
          feedback: INCORRECT_VALUES_IN_COLUMN_MESSAGE(actual.columns[index]),
        },
        columnMapping: identityMapping,
      };
    }
  }

  return { columnMapping: identityMapping };
}

/**
 * Check if row counts match.
 */
export function compareRowCount(ctx: GradingContext): ComparisonResult | null {
  if (ctx.expectedRowCount !== ctx.actualRowCount) {
    return {
      match: false,
      feedback:
        ctx.actualRowCount > ctx.expectedRowCount ? TOO_MANY_ROWS_MESSAGE : TOO_FEW_ROWS_MESSAGE,
    };
  }
  return null;
}

/**
 * Compare row values after column mapping has been established.
 */
export function compareRows(
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
      feedback: ROW_VALUE_MISMATCH_FEEDBACK(formatSampleDifferences(differences, !ignoreRowOrder)),
    };
  }

  return null;
}
