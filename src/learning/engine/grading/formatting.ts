/**
 * Functions for formatting feedback output.
 */

import {
  DIFFERENCE_EXAMPLE_LABEL,
  ROW_DIFFERENCE_LABEL,
} from './messages';

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
    ? `${ROW_DIFFERENCE_LABEL(sample.index)}: ${formatRowSample(sample.row)}`
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
  const label = DIFFERENCE_EXAMPLE_LABEL(samples.length);
  const rendered = samples.map((sample) =>
    formatDifferenceSample(sample, includeIndex),
  );
  return ` ${label}: ${rendered.join('; ')}`;
};
