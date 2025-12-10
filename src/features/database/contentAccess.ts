import type { DatabaseRole, DatasetSize, TableKey } from './types';

type RoleSpecificTables = Partial<Record<DatabaseRole, TableKey[]>>;
type ContentTableConfig = TableKey[] | RoleSpecificTables;

const DEFAULT_ROLE_TABLES: Record<DatabaseRole, TableKey[]> = {
  display: ['employees'],
  grading: ['employees'],
  theory: ['employees'],
};

const DEFAULT_ROLE_SIZES: Record<DatabaseRole, DatasetSize> = {
  display: 'medium',
  grading: 'large',
  theory: 'small',
};

const contentTableAccess: Record<string, ContentTableConfig> = {
  default: ['employees'],
  playground: ['employees', 'departments', 'emp_data', 'transactions', 'accounts', 'products', 'expenses', 'quarterly_performance'],
  // Skills
  'choose-columns': ['departments', 'employees'],
  'filter-rows': ['departments', 'employees', 'emp_data', 'transactions'],
  'filter-rows-on-multiple-criteria': ['departments', 'employees', 'emp_data', 'transactions', 'expenses'],
  'sort-rows': ['departments', 'employees', 'emp_data'],
  'process-columns': ['departments', 'employees', 'emp_data'],
  'write-single-criterion-query': ['departments', 'employees', 'emp_data', 'transactions'],
  'write-multi-criterion-query': ['departments', 'employees', 'emp_data'],
  'write-look-up-query': ['departments', 'employees', 'emp_data', 'accounts', 'transactions'],
  'join-tables': ['departments', 'employees', 'emp_data', 'accounts', 'transactions', 'products'],
  'aggregate-columns': ['departments', 'employees', 'emp_data', 'quarterly_performance', 'expenses'],
  'use-filtered-aggregation': ['departments', 'employees', 'emp_data', 'quarterly_performance', 'expenses', 'transactions'],
  'use-dynamic-aggregation': ['departments', 'employees', 'emp_data', 'quarterly_performance', 'expenses', 'transactions'],
  'create-pivot-table': ['departments', 'employees', 'emp_data', 'quarterly_performance', 'expenses', 'transactions'],
  'write-multi-table-query': ['departments', 'employees', 'emp_data', 'accounts', 'transactions', 'quarterly_performance', 'expenses', 'products'],
  'write-multi-layered-query': ['departments', 'employees', 'emp_data', 'accounts', 'transactions', 'quarterly_performance', 'expenses', 'products'],
};

const contentSizeOverrides: Record<string, Partial<Record<DatabaseRole, DatasetSize>>> = {
  playground: {
    display: 'medium',
    grading: 'large',
  },
};

function getTablesConfig(role: DatabaseRole, contentId?: string): TableKey[] | undefined {
  if (!contentId) return undefined;
  const config = contentTableAccess[contentId];
  if (!config) return undefined;
  if (Array.isArray(config)) {
    return config;
  }
  return config[role];
}

export function resolveContentTables(role: DatabaseRole, contentId?: string): TableKey[] {
  return getTablesConfig(role, contentId) ?? DEFAULT_ROLE_TABLES[role];
}

export function resolveContentSize(role: DatabaseRole, contentId?: string, override?: DatasetSize): DatasetSize {
  if (override) return override;
  if (contentId) {
    const size = contentSizeOverrides[contentId]?.[role];
    if (size) return size;
  }
  return DEFAULT_ROLE_SIZES[role];
}
