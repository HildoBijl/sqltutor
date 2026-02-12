/**
 * Grading module for comparing query results.
 */

// Types
export type { ComparisonResult, CompareOptions } from './types';
export { DEFAULT_OPTIONS } from './types';

// Main grading function
export { compareQueryResults } from './grading';

// Re-export utilities that may be useful externally
export { formatQuotedList, formatList } from './formatting';
