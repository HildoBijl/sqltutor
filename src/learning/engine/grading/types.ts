/**
 * Types and interfaces for query result grading.
 */

export interface ComparisonResult {
  match: boolean;
  feedback: string;
}

export interface CompareOptions {
  requireEqualColumnOrder?: boolean;
  requireEqualColumnNames?: boolean;
  ignoreRowOrder?: boolean;
  caseSensitive?: boolean;
}

export const DEFAULT_OPTIONS: Required<CompareOptions> = {
  requireEqualColumnOrder: false,
  requireEqualColumnNames: false,
  ignoreRowOrder: true,
  caseSensitive: false,
};
