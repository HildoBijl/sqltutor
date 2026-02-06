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
  const { requireEqualColumnOrder, requireEqualColumnNames, ignoreRowOrder, caseSensitive } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  const ignoreColumnOrder = !requireEqualColumnOrder;
  const ignoreColumnNames = !requireEqualColumnNames;

  // Validate inputs
  if (!expected || !actual) {
    return {
      match: false,
      feedback: EMPTY_RESULT_MESSAGE,
    };
  }

  const expectedRowCount = expected.values.length;
  const actualRowCount = actual.values.length;
  const expectedColumnCount = expected.columns.length;
  const actualColumnCount = actual.columns.length;

  const expectedCols = expected.columns.map((col) => normalizeColumn(col, caseSensitive));
  const actualCols = actual.columns.map((col) => normalizeColumn(col, caseSensitive));

  const identityMapping = expected.columns.map((_, idx) => idx);
  let columnMapping = identityMapping;

  // Column comparison
  if (!ignoreColumnNames) {
    const missingCols = expectedCols.filter((col) => !actualCols.includes(col));
    const extraCols = actualCols.filter((col) => !expectedCols.includes(col));
    if (missingCols.length > 0 || extraCols.length > 0) {
      const missingOriginal = mapNormalizedToOriginal(missingCols, expectedCols, expected.columns);
      const extraOriginal = mapNormalizedToOriginal(extraCols, actualCols, actual.columns);
      const feedbackMessage = getColumnNameMismatchFeedback(missingOriginal, extraOriginal);
      return {
        match: false,
        feedback: feedbackMessage ?? TOO_MANY_COLUMNS_MESSAGE,
        details: {
          expectedRows: expectedRowCount,
          actualRows: actualRowCount,
          columnMismatch: [...missingOriginal, ...extraOriginal],
        },
      };
    }

    if (expectedColumnCount !== actualColumnCount) {
      const columnCountMessage =
        actualColumnCount > expectedColumnCount ? TOO_MANY_COLUMNS_MESSAGE : TOO_FEW_COLUMNS_MESSAGE;
      return {
        match: false,
        feedback: columnCountMessage,
        details: {
          expectedRows: expectedRowCount,
          actualRows: actualRowCount,
        },
      };
    }

    if (ignoreColumnOrder) {
      columnMapping = expectedCols.map((col) => actualCols.indexOf(col));
    } else {
      for (let index = 0; index < expectedCols.length; index += 1) {
        if (expectedCols[index] !== actualCols[index]) {
          return {
            match: false,
            feedback: COLUMN_ORDER_MESSAGE,
            details: {
              expectedRows: expectedRowCount,
              actualRows: actualRowCount,
            },
          };
        }
      }
    }
  } else {
    if (expectedColumnCount !== actualColumnCount) {
      const columnCountMessage =
        actualColumnCount > expectedColumnCount ? TOO_MANY_COLUMNS_MESSAGE : TOO_FEW_COLUMNS_MESSAGE;
      return {
        match: false,
        feedback: columnCountMessage,
        details: {
          expectedRows: expectedRowCount,
          actualRows: actualRowCount,
        },
      };
    }

    if (expectedRowCount !== actualRowCount) {
      const rowCountMessage =
        actualRowCount > expectedRowCount ? TOO_MANY_ROWS_MESSAGE : TOO_FEW_ROWS_MESSAGE;
      return {
        match: false,
        feedback: rowCountMessage,
        details: {
          expectedRows: expectedRowCount,
          actualRows: actualRowCount,
        },
      };
    }

    const expectedSignatures = buildColumnSignatures(expected.values, caseSensitive, ignoreRowOrder);
    const actualSignatures = buildColumnSignatures(actual.values, caseSensitive, ignoreRowOrder);

    if (ignoreColumnOrder) {
      const usedActualColumns = new Set<number>();
      columnMapping = expectedSignatures.map((signature) => {
        const matchIndex = actualSignatures.findIndex(
          (candidate, idx) => !usedActualColumns.has(idx) && candidate === signature,
        );
        if (matchIndex !== -1) {
          usedActualColumns.add(matchIndex);
        }
        return matchIndex;
      });

      if (columnMapping.some((index) => index === -1)) {
        const unmatchedActualColumns = actual.columns.filter((_, idx) => !usedActualColumns.has(idx));
        const columnHint = unmatchedActualColumns.length
          ? ` Check the values in ${formatQuotedList(unmatchedActualColumns)}.`
          : ' Check the values in your columns.';
        return {
          match: false,
          feedback: `There seem to be incorrect values in one or more columns.${columnHint}`,
          details: {
            expectedRows: expectedRowCount,
            actualRows: actualRowCount,
          },
        };
      }
    } else {
      for (let index = 0; index < expectedSignatures.length; index += 1) {
        if (expectedSignatures[index] !== actualSignatures[index]) {
          const actualLabel = actual.columns[index];
          const columnLabel = actualLabel ? ` "${actualLabel}"` : '';
          return {
            match: false,
            feedback: `There seem to be incorrect values in the column${columnLabel}. Check the values from this column.`,
            details: {
              expectedRows: expectedRowCount,
              actualRows: actualRowCount,
            },
          };
        }
      }
    }
  }

  // Row count check
  if (expectedRowCount !== actualRowCount) {
    const rowCountFeedback =
      actualRowCount > expectedRowCount ? TOO_MANY_ROWS_MESSAGE : TOO_FEW_ROWS_MESSAGE;
    return {
      match: false,
      feedback: rowCountFeedback,
      details: {
        expectedRows: expectedRowCount,
        actualRows: actualRowCount,
      },
    };
  }

  // Row value comparison
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

  if (ignoreRowOrder) {
    expectedRows.sort();
    actualRows.sort();
  }

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
        expectedRows: expectedRowCount,
        actualRows: actualRowCount,
        sampleDifferences: differences.map((sample) =>
          formatDifferenceSample(sample, !ignoreRowOrder),
        ),
      },
    };
  }

  // Success
  return {
    match: true,
    feedback: SUCCESS_MESSAGE,
    details: {
      expectedRows: expectedRowCount,
      actualRows: actualRowCount,
    },
  };
}
