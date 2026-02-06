/**
 * Functions for formatting feedback output.
 */

import { TOO_MANY_COLUMNS_MESSAGE } from './messages';

/**
 * Format a list of items with a limit.
 */
export const formatList = (items: string[], limit = 6): string => {
  if (items.length <= limit) return items.join(', ');
  const shown = items.slice(0, limit);
  return `${shown.join(', ')} (and ${items.length - limit} more)`;
};

/**
 * Format a list of items as quoted strings.
 */
export const formatQuotedList = (items: string[], limit = 6): string =>
  formatList(
    items.map((item) => `"${item}"`),
    limit,
  );

/**
 * Format a row sample for display.
 */
export const formatRowSample = (row: string): string =>
  `(${row.split('|').join(', ')})`;

/**
 * Format a single difference sample.
 */
export const formatDifferenceSample = (
  sample: { index: number; row: string },
  includeIndex: boolean,
): string =>
  includeIndex
    ? `row ${sample.index + 1}: ${formatRowSample(sample.row)}`
    : formatRowSample(sample.row);

/**
 * Format multiple difference samples for display in feedback.
 */
export const formatSampleDifferences = (
  differences: Array<{ index: number; row: string }>,
  includeIndex: boolean,
  limit = 2,
): string => {
  if (differences.length === 0) return '';
  const samples = differences.slice(0, limit);
  const label = samples.length === 1 ? 'Example' : 'Examples';
  const rendered = samples.map((sample) =>
    formatDifferenceSample(sample, includeIndex),
  );
  return ` ${label}: ${rendered.join('; ')}`;
};

/**
 * Generate feedback for column name mismatches.
 */
export const getColumnNameMismatchFeedback = (
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
