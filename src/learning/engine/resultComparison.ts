import type { QueryResult } from '@/curriculum/utils/types';

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

export interface CompareOptions {
  requireEqualColumnOrder?: boolean;
  requireEqualColumnNames?: boolean;
  ignoreRowOrder?: boolean;
  caseSensitive?: boolean;
}

const DEFAULT_OPTIONS: Required<CompareOptions> = {
  requireEqualColumnOrder: false,
  requireEqualColumnNames: false,
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

const mapNormalizedToOriginal = (
  normalized: string[],
  sourceNormalized: string[],
  sourceOriginal: string[],
): string[] => {
  const used = new Set<number>();
  return normalized.map((name) => {
    const index = sourceNormalized.findIndex((candidate, idx) => candidate === name && !used.has(idx));
    if (index === -1) {
      return name;
    }
    used.add(index);
    return sourceOriginal[index] ?? name;
  });
};

const EMPTY_RESULT_MESSAGE =
  'Your output seems to be empty. Some records were expected here, so something has gone wrong.';
const TOO_MANY_COLUMNS_MESSAGE =
  'Your output seems to have more columns than was expected. Did you accidentally select too many columns?';
const TOO_FEW_COLUMNS_MESSAGE =
  'Your output seems to have fewer columns than was expected. Check that you have included all required attributes.';
const TOO_MANY_ROWS_MESSAGE =
  'You seem to have more rows than expected. Did you set up your filters well enough?';
const TOO_FEW_ROWS_MESSAGE =
  'You seem to have fewer rows than expected. Check that you included all required entries.';
const COLUMN_ORDER_MESSAGE =
  "It seems like you didn't give the columns in the required order. Please check the column order.";
const ROW_VALUE_MISMATCH_MESSAGE =
  'There seem to be rows which do not match the expected values.';

const formatList = (items: string[], limit = 6): string => {
  if (items.length <= limit) return items.join(', ');
  const shown = items.slice(0, limit);
  return `${shown.join(', ')} (and ${items.length - limit} more)`;
};

const formatQuotedList = (items: string[], limit = 6): string =>
  formatList(items.map((item) => `"${item}"`), limit);

const formatRowSample = (row: string): string => `(${row.split('|').join(', ')})`;

const formatDifferenceSample = (
  sample: { index: number; row: string },
  includeIndex: boolean,
): string =>
  includeIndex
    ? `row ${sample.index + 1}: ${formatRowSample(sample.row)}`
    : formatRowSample(sample.row);

const formatSampleDifferences = (
  differences: Array<{ index: number; row: string }>,
  includeIndex: boolean,
  limit = 2,
): string => {
  if (differences.length === 0) return '';
  const samples = differences.slice(0, limit);
  const label = samples.length === 1 ? 'Example' : 'Examples';
  const rendered = samples.map((sample) => formatDifferenceSample(sample, includeIndex));
  return ` ${label}: ${rendered.join('; ')}`;
};

const getColumnNameMismatchFeedback = (
  missing: string[],
  extra: string[],
): string | null => {
  if (missing.length === 0 && extra.length === 0) {
    return null;
  }

  if (missing.length === 1) {
    const missingName = missing[0];
    if (extra.length === 1) {
      return `Your output seems to be missing a column. I expected there to be one named "${missingName}". I did see "${extra[0]}" though, so check spelling.`;
    }
    return `Your output seems to be missing a column. I expected there to be one named "${missingName}".`;
  }

  if (missing.length > 1) {
    return `Your output seems to be missing some columns. Check that you have ${formatQuotedList(
      missing,
    )} in your result.`;
  }

  return TOO_MANY_COLUMNS_MESSAGE;
};

const buildColumnSignatures = (
  rows: unknown[][],
  caseSensitive: boolean,
  ignoreRowOrder: boolean,
): string[] => {
  const columnCount = rows[0]?.length ?? 0;
  const columns: string[][] = Array.from({ length: columnCount }, () => []);

  for (const row of rows) {
    for (let index = 0; index < columnCount; index += 1) {
      columns[index].push(normalizeValue(row[index], caseSensitive));
    }
  }

  return columns.map((values) => {
    const orderedValues = ignoreRowOrder ? [...values].sort() : values;
    return orderedValues.join('|');
  });
};

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
  const { requireEqualColumnOrder, requireEqualColumnNames, ignoreRowOrder, caseSensitive } =
    {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  const ignoreColumnOrder = !requireEqualColumnOrder;
  const ignoreColumnNames = !requireEqualColumnNames;

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

  const expectedRows = expected.values.map((row) =>
    normalizeRow(row, ignoreColumnOrder ? columnMapping : identityMapping, caseSensitive),
  );

  const actualRows = actual.values.map((row) =>
    normalizeRow(row, actual.columns.map((_, idx) => idx), caseSensitive),
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

  return {
    match: true,
    feedback: 'Perfect! Your query returned the correct results.',
    details: {
      expectedRows: expectedRowCount,
      actualRows: actualRowCount,
    },
  };
}
