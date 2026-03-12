/**
 * Module access configuration - maps module IDs to their required tables and dataset sizes.
 */

import type { TableKey } from '@/mockData/tables';
import type { DatasetSize } from '@/mockData/types';

/**
 * List of all tables that exist.
 */
const ALL_TABLES: TableKey[] = ['employees', 'departments', 'contracts', 'allocations', 'accounts', 'products', 'transactions', 'expenses', 'quarterly_performance'];

/**
 * Default dataset size for modules.
 */
const DEFAULT_SIZE: DatasetSize = 'small';

/**
 * Tables required for each module ID (skill or concept).
 * Use `undefined` for skills that don't use tables (e.g., RA skills).
 */
const moduleTableAccess: Record<string, TableKey[] | undefined> = {
  playground: ALL_TABLES,

  // SQL Skills
  'choose-columns': ['departments', 'employees'],
  'filter-rows': ['departments', 'employees', 'contracts'],
  'write-single-criterion-query': ['departments', 'employees', 'contracts'],

  'filter-rows-on-multiple-criteria': ['departments', 'employees', 'contracts'],
  'sort-rows': ['departments', 'employees', 'contracts'],
  'process-columns': ['departments', 'employees', 'contracts'],
  'write-multi-criterion-query': ['departments', 'employees', 'contracts'],

  'write-look-up-query': ['departments', 'employees', 'contracts'],
  'join-tables': ['departments', 'employees', 'contracts'],
  'write-multi-table-query': ['departments', 'employees', 'allocations', 'contracts', 'accounts', 'transactions', 'products'],

  'aggregate-columns': ['departments', 'employees', 'contracts', 'quarterly_performance', 'expenses'],
  'use-filtered-aggregation': ['departments', 'employees', 'contracts', 'quarterly_performance', 'expenses', 'transactions'],
  'write-multi-layered-query': ['departments', 'employees', 'contracts', 'allocations', 'accounts', 'transactions', 'quarterly_performance', 'expenses', 'products'],
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
  if (!moduleId) return undefined;
  return moduleTableAccess[moduleId];
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
