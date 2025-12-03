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
  playground: ['employee','company','works','manages'],
  // Skills
  'choose-columns': ['employee','company','works','manages'],
  'filter-rows': ['employee','company','works','manages'],
  'filter-rows-on-multiple-criteria': ['employee','company','works','manages'],
  'sort-rows': ['employee','company','works','manages'],
  'process-columns': ['employee','company','works','manages'],
  'write-single-criterion-query': ['employee','company','works','manages'],
  'write-multi-criterion-query': ['employee','company','works','manages'],
  'write-look-up-query': ['employee','company','works','manages'],
  'join-tables': ['employee','company','works','manages'],
  'aggregate-columns': ['employee','company','works','manages'],
  'use-filtered-aggregation': ['employee','company','works','manages'],
  'use-dynamic-aggregation': ['employee','company','works','manages'],
  'create-pivot-table': ['employee','company','works','manages'],
  'write-multi-table-query': ['employee','company','works','manages'],
  'write-multi-layered-query': ['employee','company','works','manages'],
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
