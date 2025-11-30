import type { DatabaseRole, DatasetSize, TableKey } from './types';

type RoleSpecificTables = Partial<Record<DatabaseRole, TableKey[]>>;
type ContentTableConfig = TableKey[] | RoleSpecificTables;

const ALL_TABLES: TableKey[] = [
  'employees',
  'departments',
  'emp_data',
  'clock_in_out',
  'accounts',
  'transactions',
  'products',
  'expenses',
  'quarterly_performance',
];

const DEFAULT_ROLE_TABLES: Record<DatabaseRole, TableKey[]> = {
  display: ALL_TABLES,
  grading: ALL_TABLES,
  theory: ['employees', 'departments', 'emp_data'],
};

const DEFAULT_ROLE_SIZES: Record<DatabaseRole, DatasetSize> = {
  display: 'medium',
  grading: 'large',
  theory: 'small',
};

const contentTableAccess: Record<string, ContentTableConfig> = {
  default: ALL_TABLES,
  playground: ALL_TABLES,
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
