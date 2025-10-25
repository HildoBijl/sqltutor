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
      feedback: `Expected ${expected.columns.length} columns but got ${actual.columns.length}.`,
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
      const parts = [];
      if (missingCols.length > 0) {
        parts.push(`Missing: ${missingCols.join(', ')}`);
      }
      if (extraCols.length > 0) {
        parts.push(`Extra: ${extraCols.join(', ')}`);
      }

      return {
        match: false,
        feedback: `Column mismatch. ${parts.join(' ')}`.trim(),
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
          feedback: `Column order mismatch at position ${index + 1}. Expected '${expected.columns[index]}' but got '${actual.columns[index]}'.`,
          details: {
            expectedRows: expectedRowCount,
            actualRows: actualRowCount,
          },
        };
      }
    }
  }

  if (expectedRowCount !== actualRowCount) {
    return {
      match: false,
      feedback: `Expected ${expectedRowCount} rows but got ${actualRowCount}.`,
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
      feedback: `Row data mismatch. ${differences.length} row(s) don't match the expected results.`,
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

