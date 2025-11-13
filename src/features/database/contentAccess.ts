import type { DatabaseRole, DatasetSize, TableKey } from './types';

type RoleSpecificTables = Partial<Record<DatabaseRole, TableKey[]>>;
type ContentTableConfig = TableKey[] | RoleSpecificTables;

const DEFAULT_ROLE_TABLES: Record<DatabaseRole, TableKey[]> = {
  display: ['companies'],
  grading: ['companies'],
  theory: ['companies'],
};

const DEFAULT_ROLE_SIZES: Record<DatabaseRole, DatasetSize> = {
  display: 'medium',
  grading: 'large',
  theory: 'small',
};

const TABLE_ACCESS_FULL: TableKey[] = ['companies', 'positions', 'employees', 'projects', 'employee_projects'];

const contentTableAccess: Record<string, ContentTableConfig> = {
  default: ['companies'],
  playground: TABLE_ACCESS_FULL,
  // Skills
  'filter-rows': ['companies'],
  'filter-rows-on-multiple-criteria': ['companies'],
  'choose-columns': ['companies'],
  'create-processed-columns': ['companies'],
  'sort-rows': ['companies'],
  'write-single-criterion-query': ['companies'],
  'write-multi-criterion-query': ['companies'],
  'aggregate-columns': ['companies'],
  'use-filtered-aggregation': ['companies'],
  'use-dynamic-aggregation': ['companies'],
  'create-pivot-table': ['companies'],
  'join-tables': ['companies', 'positions'],
  'write-multi-table-query': TABLE_ACCESS_FULL,
  'write-multi-layered-query': TABLE_ACCESS_FULL,
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
