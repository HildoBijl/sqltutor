import type { ReactNode } from 'react';

export interface TabConfig {
  key: string;
  label: string;
  icon?: ReactNode;
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
