import employeeCsv from '../../../data/csv/employee.csv?raw';
import companyCsv from '../../../data/csv/company.csv?raw';
import worksCsv from '../../../data/csv/works.csv?raw';
import managesCsv from '../../../data/csv/manages.csv?raw';

import type { DatasetSize, DatabaseRole, TableKey } from './types';
import { resolveContentTables, resolveContentSize } from './contentAccess';

export type { DatasetSize, DatabaseRole, TableKey } from './types';

type SqlCell = string | number | null | boolean;

interface TableVariant {
  createStatement?: string;
  rows?: ReadonlyArray<SqlCell[]>;
  rowLimits?: Partial<Record<DatasetSize, number>>;
}

interface TableDefinition {
  name: string;
  createStatement: string;
  rows: ReadonlyArray<SqlCell[]>;
  rowLimits?: Partial<Record<DatasetSize, number>>;
  roleOverrides?: Partial<Record<DatabaseRole, TableVariant>>;
}

const DEFAULT_ROW_LIMITS: Record<DatasetSize, number> = {
  // Keep theory datasets tiny for easy examples; display/grading remain unlimited.
  small: 10,
  medium: Number.POSITIVE_INFINITY,
  large: Number.POSITIVE_INFINITY,
};

function parseCsv(raw: string): Record<string, string>[] {
  if (!raw) return [];
  const lines = raw
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => c.trim());
    const entry: Record<string, string> = {};
    headers.forEach((header, index) => {
      entry[header] = cells[index] ?? '';
    });
    return entry;
  });
}

function numberOrNull(value: string | undefined): number | null {
  if (!value) return null;
  const normalized = value.replace(/[^0-9.-]/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

// function booleanOrNull(value: string | undefined): boolean | null {
//   if (!value) return null;
//   const normalized = value.trim().toLowerCase();
//   if (normalized === 'true') return true;
//   if (normalized === 'false') return false;
//   return null;
// }

function stringOrNull(value: string | undefined): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed.length === 0 ? null : trimmed;
}

// function idOrNull(value: string | undefined): number | string | null {
//   const trimmed = (value ?? '').trim();
//   if (!trimmed) return null;
//   const numeric = Number(trimmed);
//   return Number.isFinite(numeric) ? numeric : trimmed;
// }

const employeeRecords = parseCsv(employeeCsv);
const companyRecords = parseCsv(companyCsv);
const worksRecords = parseCsv(worksCsv);
const managesRecords = parseCsv(managesCsv);

const employeeRows: SqlCell[][] = employeeRecords.map((row) => [
  stringOrNull(row.person_name),
  stringOrNull(row.street),
  stringOrNull(row.city),
]);

const companyRows: SqlCell[][] = companyRecords.map((row) => [
  stringOrNull(row.company_name),
  stringOrNull(row.city),
]);

const worksRows: SqlCell[][] = worksRecords.map((row) => [
  stringOrNull(row.person_name),
  stringOrNull(row.company_name),
  numberOrNull(row.salary),
]);

const managesRows: SqlCell[][] = managesRecords.map((row) => [
  stringOrNull(row.person_name),
  stringOrNull(row.manager_name),
]);

const tableDefinitions: Record<TableKey, TableDefinition> = {
  employee: {
    name: 'employee',
    createStatement: `
  CREATE TABLE employee (
    person_name TEXT PRIMARY KEY,
    street TEXT,
    city TEXT
  );`.trim(),
    rows: employeeRows,
  },
  company: {
    name: 'company',
    createStatement: `
  CREATE TABLE company (
    company_name TEXT PRIMARY KEY,
    city TEXT
  );`.trim(),
    rows: companyRows,
  },
  works: {
    name: 'works',
    createStatement: `
  CREATE TABLE works (
    person_name TEXT PRIMARY KEY,
    company_name TEXT,
    salary REAL,
    FOREIGN KEY (company_name) REFERENCES company(company_name)
  );`.trim(),
    rows: worksRows,
  },
  manages: {
    name: 'manages',
    createStatement: `
  CREATE TABLE manages (
    person_name TEXT PRIMARY KEY,
    manage_name TEXT
  );`.trim(),
    rows: managesRows,
  },
};

function formatSqlValue(value: SqlCell): string {
  if (value === null || (typeof value === 'number' && !Number.isFinite(value))) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildInsertStatement(table: string, rows: SqlCell[][]): string {
  if (rows.length === 0) return '';
  const values = rows
    .map((row) => `(${row.map(formatSqlValue).join(', ')})`)
    .join(',\n    ');

  return `INSERT INTO ${table} VALUES\n    ${values};`;
}

function resolveDefinitionForRole(definition: TableDefinition, role?: DatabaseRole): TableDefinition {
  if (!role || !definition.roleOverrides?.[role]) {
    return definition;
  }
  const override = definition.roleOverrides[role]!;
  return {
    name: definition.name,
    createStatement: override.createStatement ?? definition.createStatement,
    rows: override.rows ?? definition.rows,
    rowLimits: override.rowLimits ?? definition.rowLimits,
  };
}

function getRowsForSize(definition: TableDefinition, size?: DatasetSize): SqlCell[][] {
  const rows = Array.isArray(definition.rows) ? definition.rows : Array.from(definition.rows);
  if (!size) return rows.map((row) => [...row]);
  const limit = definition.rowLimits?.[size] ?? DEFAULT_ROW_LIMITS[size];
  if (!Number.isFinite(limit)) {
    return rows.map((row) => [...row]);
  }
  return rows.slice(0, limit).map((row) => [...row]);
}

interface BuildSchemaOptions {
  tables: TableKey[];
  size?: DatasetSize;
  role?: DatabaseRole;
}

export function buildSchema({ tables, size, role }: BuildSchemaOptions): string {
  if (!tables || tables.length === 0) {
    return '';
  }

  const statements: string[] = [];
  const seen = new Set<string>();

  tables.forEach((tableKey) => {
    const sourceDefinition = tableDefinitions[tableKey];
    if (!sourceDefinition) return;
    const definition = resolveDefinitionForRole(sourceDefinition, role);
    if (!definition || seen.has(definition.name)) {
      return;
    }
    seen.add(definition.name);

    statements.push(definition.createStatement);
    const rows = getRowsForSize(definition, size);
    if (rows.length > 0) {
      statements.push(buildInsertStatement(definition.name, rows));
    }
  });

  return statements.join('\n\n').trim();
}

const schemaTableGroups: Record<string, TableKey[]> = {
  core: ['employee', 'company', 'works', 'manages'],
  commerce: ['employee', 'company', 'works', 'manages'],
  finance: ['employee', 'company', 'works', 'manages'],
  full: ['employee', 'company', 'works', 'manages'],
};

export const schemas = Object.entries(schemaTableGroups).reduce<Record<string, string>>(
  (acc, [key, tables]) => {
    acc[key] = buildSchema({ tables, size: 'medium' });
    return acc;
  },
  {},
);

export type SchemaKey = keyof typeof schemas;

export function getTablesForSchema(schemaKey: SchemaKey): TableKey[] {
  return schemaTableGroups[schemaKey] ?? schemaTableGroups.core;
}

export function getTableNames(schema: string): string[] {
  const matches = schema.match(/CREATE TABLE (\w+)/gi);
  if (!matches) return [];
  return matches.map((match) => match.replace(/CREATE TABLE /i, '').trim());
}

export function getSchemaDescription(schemaKey: SchemaKey): string {
  const descriptions: Record<SchemaKey, string> = {
    core: 'Employee records and department assignments',
    commerce: 'Accounts, products, and transactions',
    finance: 'Expenses and quarterly performance',
    full: 'Combined operational data set',
  };

  return descriptions[schemaKey] ?? 'Database schema';
}

export function resolveDatasetSize(role: DatabaseRole, skillId?: string, override?: DatasetSize): DatasetSize {
  return resolveContentSize(role, skillId, override);
}

export function resolveSkillTables(role: DatabaseRole, skillId?: string): TableKey[] {
  return resolveContentTables(role, skillId);
}
