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
 * Use `undefined` for skills that don't use tables (e.g., RA skills).
 */
const contentTableAccess: Record<string, TableKey[] | undefined> = {
  default: ['employees'],
  playground: ['employees', 'departments', 'emp_data', 'transactions', 'accounts', 'products', 'expenses', 'quarterly_performance'],

  // SQL Skills
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

  // RA Skills (no database tables)
  'ra-choose-columns': undefined,
  'ra-filter-rows': undefined,
  'ra-set-up-single-relation-query': undefined,
  'ra-set-up-multi-condition-query': undefined,
  'ra-join-relations': undefined,
  'ra-set-up-multi-relation-query': undefined,
  'ra-set-up-multi-step-query': undefined,
  'ra-set-up-universal-condition-query': undefined,
};

/**
 * Size overrides for specific content.
 */
const contentSizeOverrides: Record<string, DatasetSize> = {
  playground: 'full',
};

/**
 * Get the tables required for a given content ID.
 * Returns `undefined` for skills that don't use tables.
 */
export function getContentTables(contentId?: string): TableKey[] | undefined {
  if (!contentId) return DEFAULT_TABLES;
  // Check if contentId is explicitly defined (including undefined values)
  if (contentId in contentTableAccess) {
    return contentTableAccess[contentId];
  }
  return DEFAULT_TABLES;
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
