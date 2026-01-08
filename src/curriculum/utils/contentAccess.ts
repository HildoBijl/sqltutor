/**
 * Content access configuration - maps content IDs to their required tables and dataset sizes.
 */

import type { TableKey } from '@/mockData/tables';
import type { DatasetSize } from '@/mockData/types';

/**
 * Default tables when no content-specific config exists.
 */
const DEFAULT_TABLES: TableKey[] = ['employees'];

/**
 * Default dataset size for content.
 */
const DEFAULT_SIZE: DatasetSize = 'small';

/**
 * Tables required for each content ID (skill or concept).
 */
const contentTableAccess: Record<string, TableKey[]> = {
  default: ['employees'],
  playground: ['employees', 'departments', 'emp_data', 'transactions', 'accounts', 'products', 'expenses', 'quarterly_performance'],
  // Skills
  'choose-columns': ['departments', 'employees'],
  'filter-rows': ['departments', 'employees', 'emp_data'],
  'filter-rows-on-multiple-criteria': ['departments', 'employees', 'emp_data'],
  'sort-rows': ['departments', 'employees', 'emp_data'],
  'process-columns': ['departments', 'employees', 'emp_data'],
  'write-single-criterion-query': ['departments', 'employees', 'emp_data'],
  'write-multi-criterion-query': ['departments', 'employees', 'emp_data'],
  'write-look-up-query': ['departments', 'employees', 'emp_data'],
  'join-tables': ['departments', 'employees', 'emp_data'],
  'aggregate-columns': ['departments', 'employees', 'emp_data', 'quarterly_performance', 'expenses'],
  'use-filtered-aggregation': ['departments', 'employees', 'emp_data', 'quarterly_performance', 'expenses', 'transactions'],
  'use-dynamic-aggregation': ['departments', 'employees', 'emp_data', 'quarterly_performance', 'expenses', 'transactions'],
  'create-pivot-table': ['departments', 'employees', 'emp_data', 'quarterly_performance', 'expenses', 'transactions'],
  'write-multi-table-query': ['departments', 'employees', 'emp_data', 'accounts', 'transactions', 'quarterly_performance', 'expenses', 'products'],
  'write-multi-layered-query': ['departments', 'employees', 'emp_data', 'accounts', 'transactions', 'quarterly_performance', 'expenses', 'products'],
};

/**
 * Size overrides for specific content.
 */
const contentSizeOverrides: Record<string, DatasetSize> = {
  playground: 'full',
};

/**
 * Get the tables required for a given content ID.
 */
export function getContentTables(contentId?: string): TableKey[] {
  if (!contentId) return DEFAULT_TABLES;
  return contentTableAccess[contentId] ?? DEFAULT_TABLES;
}

/**
 * Get the dataset size for a given content ID.
 */
export function getContentSize(contentId?: string, override?: DatasetSize): DatasetSize {
  if (override) return override;
  if (contentId && contentSizeOverrides[contentId]) {
    return contentSizeOverrides[contentId];
  }
  return DEFAULT_SIZE;
}
