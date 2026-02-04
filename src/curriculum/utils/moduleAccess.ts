/**
 * Module access configuration - maps module IDs to their required tables and dataset sizes.
 */

import type { TableKey } from '@/mockData/tables';
import type { DatasetSize } from '@/mockData/types';

/**
 * Default tables when no module-specific config exists.
 */
const DEFAULT_TABLES: TableKey[] = ['employees'];

/**
 * Default dataset size for modules.
 */
const DEFAULT_SIZE: DatasetSize = 'small';

/**
 * Tables required for each module ID (skill or concept).
 * Use `undefined` for skills that don't use tables (e.g., RA skills).
 */
const moduleTableAccess: Record<string, TableKey[] | undefined> = {
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
 * Size overrides for specific modules.
 */
const moduleSizeOverrides: Record<string, DatasetSize> = {
  playground: 'full',
};

/**
 * Get the tables required for a given module ID.
 * Returns `undefined` for skills that don't use tables.
 */
export function getModuleTables(moduleId?: string): TableKey[] | undefined {
  if (!moduleId) return DEFAULT_TABLES;
  // Check if moduleId is explicitly defined (including undefined values)
  if (moduleId in moduleTableAccess) {
    return moduleTableAccess[moduleId];
  }
  return DEFAULT_TABLES;
}

/**
 * Get the dataset size for a given module ID.
 */
export function getModuleSize(moduleId?: string, override?: DatasetSize): DatasetSize {
  if (override) return override;
  if (moduleId && moduleSizeOverrides[moduleId]) {
    return moduleSizeOverrides[moduleId];
  }
  return DEFAULT_SIZE;
}
