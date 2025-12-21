import type { DatasetSize } from './types';

export const DEFAULT_ROW_LIMITS: Record<DatasetSize, number> = {
  // Keep theory datasets tiny for easy examples; display/grading remain unlimited.
  small: 10,
  medium: Number.POSITIVE_INFINITY,
  large: Number.POSITIVE_INFINITY,
};

export const THEORY_ROW_LIMITS: Partial<Record<DatasetSize, number>> = {
  small: Number.POSITIVE_INFINITY,
};
