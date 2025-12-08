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
  'choose-columns': ['employees', 'emp_data'],
  'filter-rows': ['transactions'],
  'filter-rows-on-multiple-criteria': ['transactions', 'expenses'],
  'sort-rows': ['employees', 'emp_data', 'departments'],
  'process-columns': ['employees', 'emp_data', 'departments'],
  'write-single-criterion-query': ['transactions'],
  'write-multi-criterion-query': ['employees', 'emp_data', 'departments'],
  'write-look-up-query': ['transactions', 'employees', 'accounts'],
  'join-tables': ['transactions', 'accounts', 'products'],
  'aggregate-columns': ['quarterly_performance', 'expenses'],
  'use-filtered-aggregation': ['transactions', 'expenses'],
  'use-dynamic-aggregation': ['transactions', 'expenses', 'quarterly_performance'],
  'create-pivot-table': ['emp_data', 'departments'],
  'write-multi-table-query': ['transactions', 'accounts', 'products'],
  'write-multi-layered-query': ['transactions', 'accounts', 'products', 'expenses'],
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
