import type { QueryResult } from '@/features/content/types';

export interface ComparisonResult {
  match: boolean;
  feedback: string;
  details?: {
    expectedRows: number;
    actualRows: number;
    columnMismatch?: string[];
    sampleDifferences?: string[];
  };
}

interface CompareOptions {
  ignoreColumnOrder?: boolean;
  ignoreRowOrder?: boolean;
  caseSensitive?: boolean;
}

const DEFAULT_OPTIONS: Required<CompareOptions> = {
  ignoreColumnOrder: false,
  ignoreRowOrder: true,
  caseSensitive: false,
};

const normalizeValue = (value: unknown, caseSensitive: boolean): string => {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number' && Number.isFinite(value)) {
    // Normalize numeric precision to avoid insignificant float diffs
    return value.toString();
  }
  const str = String(value);
  return caseSensitive ? str : str.toLowerCase();
};

const normalizeColumn = (column: string, caseSensitive: boolean): string =>
  caseSensitive ? column : column.toLowerCase();

const normalizeRow = (
  row: unknown[],
  mapping: number[],
  caseSensitive: boolean,
): string => mapping.map((idx) => normalizeValue(row[idx], caseSensitive)).join('|');

export function compareQueryResults(
  expected: QueryResult | undefined,
  actual: QueryResult | undefined,
  options: CompareOptions = {},
): ComparisonResult {
  const { ignoreColumnOrder, ignoreRowOrder, caseSensitive } = { ...DEFAULT_OPTIONS, ...options };

  if (!expected || !actual) {
    return {
      match: false,
      feedback: 'Query did not return valid results.',
    };
  }

  const expectedRowCount = expected.values.length;
  const actualRowCount = actual.values.length;

  if (expected.columns.length !== actual.columns.length) {
    return {
      match: false,
      feedback: 'Your query returned a different number of columns than expected.',
      details: {
        expectedRows: expectedRowCount,
        actualRows: actualRowCount,
      },
    };
  }

  const expectedCols = expected.columns.map((col) => normalizeColumn(col, caseSensitive));
  const actualCols = actual.columns.map((col) => normalizeColumn(col, caseSensitive));

  if (ignoreColumnOrder) {
    const missingCols = expectedCols.filter((col) => !actualCols.includes(col));
    const extraCols = actualCols.filter((col) => !expectedCols.includes(col));

    if (missingCols.length > 0 || extraCols.length > 0) {
      let feedbackMessage = 'Your query did not return the expected set of columns.';
      if (missingCols.length > 0 && extraCols.length === 0) {
        feedbackMessage = 'Some expected columns are missing from your results.';
      } else if (missingCols.length === 0 && extraCols.length > 0) {
        feedbackMessage = 'Your results include columns that should not be there.';
      }
      return {
        match: false,
        feedback: feedbackMessage,
        details: {
          expectedRows: expectedRowCount,
          actualRows: actualRowCount,
          columnMismatch: [...missingCols, ...extraCols],
        },
      };
    }
  } else {
    for (let index = 0; index < expectedCols.length; index += 1) {
      if (expectedCols[index] !== actualCols[index]) {
        return {
          match: false,
          feedback: 'Your columns are not in the expected order.',
          details: {
            expectedRows: expectedRowCount,
            actualRows: actualRowCount,
          },
        };
      }
    }
  }

  if (expectedRowCount !== actualRowCount) {
    const rowCountFeedback =
      actualRowCount < expectedRowCount
        ? 'Your query returned fewer rows than expected.'
        : 'Your results include rows that should not be there.';
    return {
      match: false,
      feedback: rowCountFeedback,
      details: {
        expectedRows: expectedRowCount,
        actualRows: actualRowCount,
      },
    };
  }

  const columnMapping = expectedCols.map((col) => actualCols.indexOf(col));

  const expectedRows = expected.values.map((row) =>
    normalizeRow(row, ignoreColumnOrder ? columnMapping : columnMapping.map((_, idx) => idx), caseSensitive),
  );

  const actualRows = actual.values.map((row) =>
    normalizeRow(row, actual.columns.map((_, idx) => idx), caseSensitive),
  );

  if (ignoreRowOrder) {
    expectedRows.sort();
    actualRows.sort();
  }

  const differences: string[] = [];
  for (let index = 0; index < expectedRows.length && differences.length < 3; index += 1) {
    if (expectedRows[index] !== actualRows[index]) {
      differences.push(`Row ${index + 1}: expected (${expectedRows[index]}) but got (${actualRows[index]})`);
    }
  }

  if (differences.length > 0) {
    return {
      match: false,
      feedback: 'Some rows in your result set differ from the expected data.',
      details: {
        expectedRows: expectedRowCount,
        actualRows: actualRowCount,
        sampleDifferences: differences,
      },
    };
  }

  return {
    match: true,
    feedback: 'Perfect! Your query returned the correct results.',
    details: {
      expectedRows: expectedRowCount,
      actualRows: actualRowCount,
    },
  };
}
