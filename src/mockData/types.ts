export type DatasetSize = 'small' | 'medium' | 'large';
export type DatabaseRole = 'grading' | 'display' | 'theory';

export type SqlCell = string | number | null | boolean;

export interface TableVariant {
  createStatement?: string;
  rows?: ReadonlyArray<SqlCell[]>;
  rowLimits?: Partial<Record<DatasetSize, number>>;
}

export interface TableDefinition {
  name: string;
  createStatement: string;
  rows: ReadonlyArray<SqlCell[]>;
  rowLimits?: Partial<Record<DatasetSize, number>>;
  roleOverrides?: Partial<Record<DatabaseRole, TableVariant>>;
}
