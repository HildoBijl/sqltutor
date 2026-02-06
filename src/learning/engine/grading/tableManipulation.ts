/**
 * Functions for manipulating and normalizing table data.
 */

/**
 * Normalize a cell value to a string for comparison.
 */
export const normalizeValue = (value: unknown, caseSensitive: boolean): string => {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number' && Number.isFinite(value)) {
    // Normalize numeric precision to avoid insignificant float diffs
    return value.toString();
  }
  const str = String(value);
  return caseSensitive ? str : str.toLowerCase();
};

/**
 * Normalize a column name for comparison.
 */
export const normalizeColumn = (column: string, caseSensitive: boolean): string =>
  caseSensitive ? column : column.toLowerCase();

/**
 * Map normalized column names back to their original names.
 */
export const mapNormalizedToOriginal = (
  normalized: string[],
  sourceNormalized: string[],
  sourceOriginal: string[],
): string[] => {
  const used = new Set<number>();
  return normalized.map((name) => {
    const index = sourceNormalized.findIndex(
      (candidate, idx) => candidate === name && !used.has(idx),
    );
    if (index === -1) {
      return name;
    }
    used.add(index);
    return sourceOriginal[index] ?? name;
  });
};

/**
 * Build column signatures for matching columns by their content.
 * Each signature represents all values in a column as a single string.
 */
export const buildColumnSignatures = (
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

/**
 * Normalize a row to a string for comparison.
 */
export const normalizeRow = (
  row: unknown[],
  mapping: number[],
  caseSensitive: boolean,
): string => mapping.map((idx) => normalizeValue(row[idx], caseSensitive)).join('|');
