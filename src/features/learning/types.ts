import type { ReactElement } from 'react';

export interface TabConfig {
  key: string;
  label: string;
  icon?: ReactElement | string;
  disabled?: boolean;
}

export interface SkillExercise {
  description?: string;
  expectedQuery?: string;
  [key: string]: unknown;
}

export interface QueryResultSet {
  columns: string[];
  values: unknown[][];
}

export interface PracticeStateSnapshot {
  query: string;
  hasExecutedQuery: boolean;
}

export interface PracticeSolution {
  query: string;
  explanation?: string | null;
}

export type PracticeSolutionLike = PracticeSolution | string | null | undefined;
