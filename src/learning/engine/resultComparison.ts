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

const formatList = (items: string[], limit = 6): string => {
  if (items.length <= limit) return items.join(', ');
  const shown = items.slice(0, limit);
  return `${shown.join(', ')} (and ${items.length - limit} more)`;
};

const formatSampleDifferences = (differences: string[], limit = 2): string => {
  if (differences.length === 0) return '';
  const samples = differences.slice(0, limit);
  const label = samples.length === 1 ? 'Example' : 'Examples';
  return ` ${label}: ${samples.join('; ')}`;
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
      feedback: 'Requirement failed: query must return a result set. No result set was returned.',
    };
  }

  const expectedRowCount = expected.values.length;
  const actualRowCount = actual.values.length;
  const expectedColumnCount = expected.columns.length;
  const actualColumnCount = actual.columns.length;

  if (expectedColumnCount !== actualColumnCount) {
    const columnDirection = actualColumnCount < expectedColumnCount ? 'too few' : 'too many';
    return {
      match: false,
      feedback: `Requirement failed: number of columns. Expected ${expectedColumnCount} columns, got ${actualColumnCount} (${columnDirection}).`,
      details: {
        expectedRows: expectedRowCount,
        actualRows: actualRowCount,
      },
    };
  }

  const expectedCols = expected.columns.map((col) => normalizeColumn(col, caseSensitive));
  const actualCols = actual.columns.map((col) => normalizeColumn(col, caseSensitive));

  const identityMapping = expected.columns.map((_, idx) => idx);
  let columnMapping = identityMapping;

  if (!ignoreColumnNames) {
    if (ignoreColumnOrder) {
      const missingCols = expectedCols.filter((col) => !actualCols.includes(col));
      const extraCols = actualCols.filter((col) => !expectedCols.includes(col));

      if (missingCols.length > 0 || extraCols.length > 0) {
        const missingOriginal = mapNormalizedToOriginal(missingCols, expectedCols, expected.columns);
        const extraOriginal = mapNormalizedToOriginal(extraCols, actualCols, actual.columns);
        let feedbackMessage = 'Requirement failed: column names. The result set has unexpected column names.';
        if (missingOriginal.length === 1 && extraOriginal.length === 1) {
          feedbackMessage = `Requirement failed: column name. Expected "${missingOriginal[0]}", got "${extraOriginal[0]}".`;
        } else if (missingOriginal.length === extraOriginal.length && missingOriginal.length > 0) {
          feedbackMessage = `Requirement failed: column names. Expected: ${formatList(
            missingOriginal,
          )}. Got: ${formatList(extraOriginal)}.`;
        } else if (missingOriginal.length > 0 && extraOriginal.length > 0) {
          feedbackMessage = `Requirement failed: column names. Missing: ${formatList(
            missingOriginal,
          )}. Extra: ${formatList(extraOriginal)}.`;
        } else if (missingOriginal.length > 0) {
          feedbackMessage = `Requirement failed: column names. Missing: ${formatList(missingOriginal)}.`;
        } else if (extraOriginal.length > 0) {
          feedbackMessage = `Requirement failed: column names. Extra: ${formatList(extraOriginal)}.`;
        }
        return {
          match: false,
          feedback: feedbackMessage,
          details: {
            expectedRows: expectedRowCount,
            actualRows: actualRowCount,
            columnMismatch: [...missingOriginal, ...extraOriginal],
          },
        };
      }

      columnMapping = expectedCols.map((col) => actualCols.indexOf(col));
    } else {
      const missingCols = expectedCols.filter((col) => !actualCols.includes(col));
      const extraCols = actualCols.filter((col) => !expectedCols.includes(col));
      if (missingCols.length > 0 || extraCols.length > 0) {
        const missingOriginal = mapNormalizedToOriginal(missingCols, expectedCols, expected.columns);
        const extraOriginal = mapNormalizedToOriginal(extraCols, actualCols, actual.columns);
        let feedbackMessage = 'Requirement failed: column names. The result set has unexpected column names.';
        if (missingOriginal.length === 1 && extraOriginal.length === 1) {
          feedbackMessage = `Requirement failed: column name. Expected "${missingOriginal[0]}", got "${extraOriginal[0]}".`;
        } else if (missingOriginal.length === extraOriginal.length && missingOriginal.length > 0) {
          feedbackMessage = `Requirement failed: column names. Expected: ${formatList(
            missingOriginal,
          )}. Got: ${formatList(extraOriginal)}.`;
        } else if (missingOriginal.length > 0 && extraOriginal.length > 0) {
          feedbackMessage = `Requirement failed: column names. Missing: ${formatList(
            missingOriginal,
          )}. Extra: ${formatList(extraOriginal)}.`;
        } else if (missingOriginal.length > 0) {
          feedbackMessage = `Requirement failed: column names. Missing: ${formatList(missingOriginal)}.`;
        } else if (extraOriginal.length > 0) {
          feedbackMessage = `Requirement failed: column names. Extra: ${formatList(extraOriginal)}.`;
        }
        return {
          match: false,
          feedback: feedbackMessage,
          details: {
            expectedRows: expectedRowCount,
            actualRows: actualRowCount,
            columnMismatch: [...missingOriginal, ...extraOriginal],
          },
        };
      }
      for (let index = 0; index < expectedCols.length; index += 1) {
        if (expectedCols[index] !== actualCols[index]) {
          const expectedOrder = formatList(expected.columns);
          const actualOrder = formatList(actual.columns);
          return {
            match: false,
            feedback: `Requirement failed: column order. Expected: ${expectedOrder}. Got: ${actualOrder}.`,
            details: {
              expectedRows: expectedRowCount,
              actualRows: actualRowCount,
            },
          };
        }
      }
    }
  } else {
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
        const missingColumnLabels = columnMapping
          .map((index, idx) => (index === -1 ? expected.columns[idx] ?? `column ${idx + 1}` : null))
          .filter((label): label is string => Boolean(label));
        const missingColumnsSummary = missingColumnLabels.length
          ? ` Missing expected column data for: ${formatList(missingColumnLabels)}.`
          : '';
        return {
          match: false,
          feedback: `Requirement failed: column values. The result set does not match the expected columns.${missingColumnsSummary}`,
          details: {
            expectedRows: expectedRowCount,
            actualRows: actualRowCount,
          },
        };
      }
    } else {
      for (let index = 0; index < expectedSignatures.length; index += 1) {
        if (expectedSignatures[index] !== actualSignatures[index]) {
          const expectedLabel = expected.columns[index];
          const actualLabel = actual.columns[index];
          const expectedLabelText = expectedLabel ? ` Expected column ${index + 1}: ${expectedLabel}.` : '';
          const actualLabelText = actualLabel ? ` Got: ${actualLabel}.` : '';
          return {
            match: false,
            feedback: `Requirement failed: column values. Column ${index + 1} does not match expected values.${expectedLabelText}${actualLabelText}`,
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
    const rowDirection = actualRowCount < expectedRowCount ? 'too few' : 'too many';
    const rowCountFeedback = `Requirement failed: number of rows. Expected ${expectedRowCount} rows, got ${actualRowCount} (${rowDirection}).`;
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

  const differences: string[] = [];
  for (let index = 0; index < expectedRows.length && differences.length < 3; index += 1) {
    if (expectedRows[index] !== actualRows[index]) {
      differences.push(`Row ${index + 1}: expected (${expectedRows[index]}) but got (${actualRows[index]})`);
    }
  }

  if (differences.length > 0) {
    return {
      match: false,
      feedback: `Requirement failed: row values. Some rows differ from the expected data.${formatSampleDifferences(differences)}`,
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
