import accountsCsv from '../../../data/csv/accounts.csv?raw';
import departmentsCsv from '../../../data/csv/departments.csv?raw';
import empDataCsv from '../../../data/csv/emp_data.csv?raw';
import empDeptCsv from '../../../data/csv/emp_dept.csv?raw';
import employeesCsv from '../../../data/csv/employees.csv?raw';
import productsCsv from '../../../data/csv/products.csv?raw';
import transactionsCsv from '../../../data/csv/transactions.csv?raw';

import theoryAccountsCsv from '../../../data/theory-sample/accounts.csv?raw';
import theoryDepartmentsCsv from '../../../data/theory-sample/departments.csv?raw';
import theoryEmpDataCsv from '../../../data/theory-sample/emp_data.csv?raw';
import theoryEmpDeptCsv from '../../../data/theory-sample/emp_dept.csv?raw';
import theoryEmployeesCsv from '../../../data/theory-sample/employees.csv?raw';
import theoryProductsCsv from '../../../data/theory-sample/products.csv?raw';
import theoryTransactionsCsv from '../../../data/theory-sample/transactions.csv?raw';
import theoryExpensesCsv from '../../../data/theory-sample/expenses.csv?raw';
import theoryQuarterlyPerformanceCsv from '../../../data/theory-sample/quarterly_performance.csv?raw';

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
  const source = raw.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let currentCell = '';
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      currentCell += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => header.trim());

  return rows
    .slice(1)
    .map((cells) => {
      const entry: Record<string, string> = {};
      headers.forEach((header, index) => {
        entry[header] = (cells[index] ?? '').trim();
      });
      return entry;
    })
    .filter((entry) => headers.some((header) => (entry[header] ?? '').trim().length > 0));
}

function numberOrNull(value: string | undefined): number | null {
  if (!value) return null;
  const normalized = value.replace(/[^0-9.-]/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function booleanOrNull(value: string | undefined): boolean | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return null;
}

function stringOrNull(value: string | undefined): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed.length === 0 ? null : trimmed;
}

function idOrNull(value: string | undefined): number | string | null {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return null;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : trimmed;
}

const employeesRecords = parseCsv(employeesCsv);
const empDataRecords = parseCsv(empDataCsv);
const empDeptRecords = parseCsv(empDeptCsv);
const departmentsRecords = parseCsv(departmentsCsv);
const accountsRecords = parseCsv(accountsCsv);
const productsRecords = parseCsv(productsCsv);
const transactionsRecords = parseCsv(transactionsCsv);
const theoryEmployeesRecords = parseCsv(theoryEmployeesCsv);
const theoryEmpDataRecords = parseCsv(theoryEmpDataCsv);
const theoryEmpDeptRecords = parseCsv(theoryEmpDeptCsv);
const theoryDepartmentsRecords = parseCsv(theoryDepartmentsCsv);
const theoryAccountsRecords = parseCsv(theoryAccountsCsv);
const theoryProductsRecords = parseCsv(theoryProductsCsv);
const theoryTransactionsRecords = parseCsv(theoryTransactionsCsv);
const theoryExpensesRecords = parseCsv(theoryExpensesCsv);
const theoryQuarterlyPerformanceRecords = parseCsv(theoryQuarterlyPerformanceCsv);

function buildEmployeeRows(records: Record<string, string>[]): SqlCell[][] {
  return records.map((row) => [
    idOrNull(row.e_id),
    stringOrNull(row.first_name),
    stringOrNull(row.last_name),
    stringOrNull(row.phone),
    stringOrNull(row.email),
    stringOrNull(row.address),
    stringOrNull(row.city),
    stringOrNull(row.hire_date),
    numberOrNull(row.current_salary),
  ]);
}

function buildEmpDataRows(records: Record<string, string>[]): SqlCell[][] {
  return records.map((row) => [
    idOrNull(row.e_id),
    stringOrNull(row.position),
    numberOrNull(row.salary),
    stringOrNull(row.start_date),
    stringOrNull(row.end_date),
    numberOrNull(row.perf_score),
    stringOrNull(row.status),
  ]);
}

function buildEmpDeptRows(records: Record<string, string>[]): SqlCell[][] {
  return records.map((row) => [idOrNull(row.e_id), idOrNull(row.d_id)]);
}

function buildDepartmentsRows(records: Record<string, string>[]): SqlCell[][] {
  return records.map((row) => [
    idOrNull(row.d_id),
    stringOrNull(row.d_name),
    idOrNull(row.manager_id),
    numberOrNull(row.budget),
    numberOrNull(row.nr_employees),
  ]);
}

function buildAccountsRows(records: Record<string, string>[]): SqlCell[][] {
  return records.map((row) => [
    stringOrNull(row.acct_id),
    stringOrNull(row.username),
    stringOrNull(row.phone),
    stringOrNull(row.email),
    booleanOrNull(row.verified),
    stringOrNull(row.full_name),
    stringOrNull(row.address),
    stringOrNull(row.city),
    stringOrNull(row.created_at),
    stringOrNull(row.last_login_at),
  ]);
}

function buildProductsRows(records: Record<string, string>[]): SqlCell[][] {
  return records.map((row) => [
    idOrNull(row.p_id),
    stringOrNull(row.name),
    stringOrNull(row.category),
    stringOrNull(row.owner_id ?? row.owned_by),
    numberOrNull(row.est_value),
    stringOrNull(row.status),
  ]);
}

function buildTransactionsRows(records: Record<string, string>[]): SqlCell[][] {
  return records.map((row) => [
    idOrNull(row.t_id),
    stringOrNull(row.vendor_id),
    stringOrNull(row.buyer_id),
    idOrNull(row.prod_id),
    stringOrNull(row.date_time),
    numberOrNull(row.amount ?? row.price),
    idOrNull(row.validated_by),
    stringOrNull(row.status),
  ]);
}

const employeesRows = buildEmployeeRows(employeesRecords);
const theoryEmployeesRows = buildEmployeeRows(theoryEmployeesRecords);

const empDataRows = buildEmpDataRows(empDataRecords);
const theoryEmpDataRows = buildEmpDataRows(theoryEmpDataRecords);

const empDeptRows = buildEmpDeptRows(empDeptRecords);
const theoryEmpDeptRows = buildEmpDeptRows(theoryEmpDeptRecords);

const departmentsRows = buildDepartmentsRows(departmentsRecords);
const theoryDepartmentsRows = buildDepartmentsRows(theoryDepartmentsRecords);

const accountsRows = buildAccountsRows(accountsRecords);
const theoryAccountsRows = buildAccountsRows(theoryAccountsRecords);

const productsRows = buildProductsRows(productsRecords);
const theoryProductsRows = buildProductsRows(theoryProductsRecords);

const transactionsRows = buildTransactionsRows(transactionsRecords);
const theoryTransactionsRows = buildTransactionsRows(theoryTransactionsRecords);

// Legacy sample data for exercises without CSVs yet
const expensesRows: SqlCell[][] = [
  [3001, 1800.0, departmentsRows[0]?.[0] ?? 1000, 'Team event', '2025-01-15', null, null],
  [3002, 12000.0, departmentsRows[1]?.[0] ?? 2000, 'teambuilding retreat', '2025-02-01', null, null],
  [3003, 4200.0, departmentsRows[2]?.[0] ?? 3000, 'Hardware purchase', '2025-02-10', null, null],
  [3004, 600.0, departmentsRows[3]?.[0] ?? 4000, 'Lorem ipsum supplies', '2024-12-01', null, null],
];

const theoryExpensesRows: SqlCell[][] = theoryExpensesRecords.map((row) => [
  idOrNull(row.exp_id),
  numberOrNull(row.amount),
  idOrNull(row.d_id),
  stringOrNull(row.description),
  stringOrNull(row.date),
  idOrNull(row.requested_by),
  idOrNull(row.approved_by),
]);

const quarterlyPerformanceRows: SqlCell[][] = [
  [1, 2023, 1200000.0, 400000.0, 2400, 0.08, '2024-01-10 10:00:00'],
  [2, 2023, 1400000.0, 450000.0, 2600, 0.1, '2024-04-10 10:00:00'],
  [3, 2023, 1350000.0, 430000.0, 2550, -0.02, '2024-07-10 10:00:00'],
  [4, 2023, 1500000.0, 470000.0, 2800, 0.05, '2024-10-10 10:00:00'],
  [1, 2024, 1600000.0, 500000.0, 3000, 0.03, '2025-01-10 10:00:00'],
];

const theoryQuarterlyPerformanceRows: SqlCell[][] = theoryQuarterlyPerformanceRecords.map((row) => [
  numberOrNull(row.quarter),
  numberOrNull(row.fiscal_year),
  numberOrNull(row.revenue),
  numberOrNull(row.operating_expenses),
  numberOrNull(row.total_transactions),
  numberOrNull(row.growth_rate),
  stringOrNull(row.updated_at),
]);

const THEORY_ROW_LIMITS: Partial<Record<DatasetSize, number>> = {
  small: Number.POSITIVE_INFINITY,
};

const tableDefinitions: Record<TableKey, TableDefinition> = {
  employees: {
    name: 'employees',
    createStatement: `
  CREATE TABLE employees (
    e_id INTEGER PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    hire_date DATE,
    current_salary REAL
  );`.trim(),
    rows: employeesRows,
    roleOverrides: {
      theory: {
        rows: theoryEmployeesRows,
        rowLimits: THEORY_ROW_LIMITS,
      },
    },
  },
  emp_data: {
    name: 'emp_data',
    createStatement: `
  CREATE TABLE emp_data (
    e_id INTEGER NOT NULL,
    position TEXT,
    salary REAL,
    start_date DATE,
    end_date DATE,
    perf_score INTEGER,
    status TEXT,
    FOREIGN KEY (e_id) REFERENCES employees(e_id)
  );`.trim(),
    rows: empDataRows,
    roleOverrides: {
      theory: {
        rows: theoryEmpDataRows,
        rowLimits: THEORY_ROW_LIMITS,
      },
    },
  },
  emp_dept: {
    name: 'emp_dept',
    createStatement: `
  CREATE TABLE emp_dept (
    e_id INTEGER NOT NULL,
    d_id INTEGER NOT NULL,
    PRIMARY KEY (e_id, d_id),
    FOREIGN KEY (e_id) REFERENCES employees(e_id),
    FOREIGN KEY (d_id) REFERENCES departments(d_id)
  );`.trim(),
    rows: empDeptRows,
    roleOverrides: {
      theory: {
        rows: theoryEmpDeptRows,
        rowLimits: THEORY_ROW_LIMITS,
      },
    },
  },
  departments: {
    name: 'departments',
    createStatement: `
  CREATE TABLE departments (
    d_id INTEGER PRIMARY KEY,
    d_name TEXT NOT NULL,
    manager_id INTEGER,
    budget REAL,
    nr_employees INTEGER,
    FOREIGN KEY (manager_id) REFERENCES employees(e_id)
  );`.trim(),
    rows: departmentsRows,
    roleOverrides: {
      theory: {
        rows: theoryDepartmentsRows,
        rowLimits: THEORY_ROW_LIMITS,
      },
    },
  },
  accounts: {
    name: 'accounts',
    createStatement: `
  CREATE TABLE accounts (
    acct_id TEXT PRIMARY KEY,
    username TEXT,
    phone TEXT,
    email TEXT,
    email_verified BOOLEAN,
    full_name TEXT,
    address TEXT,
    city TEXT,
    created_at TEXT,
    last_login_at TEXT
  );`.trim(),
    rows: accountsRows,
    roleOverrides: {
      theory: {
        rows: theoryAccountsRows,
        rowLimits: THEORY_ROW_LIMITS,
      },
    },
  },
  products: {
    name: 'products',
    createStatement: `
  CREATE TABLE products (
    p_id INTEGER PRIMARY KEY,
    name TEXT,
    category TEXT,
    owner_id TEXT,
    est_value REAL,
    status TEXT,
    FOREIGN KEY (owner_id) REFERENCES accounts(acct_id)
  );`.trim(),
    rows: productsRows,
    roleOverrides: {
      theory: {
        rows: theoryProductsRows,
        rowLimits: THEORY_ROW_LIMITS,
      },
    },
  },
  transactions: {
    name: 'transactions',
    createStatement: `
  CREATE TABLE transactions (
    t_id INTEGER PRIMARY KEY,
    vendor_id TEXT,
    buyer_id TEXT,
    prod_id INTEGER,
    date_time DATETIME,
    amount REAL,
    validated_by INTEGER,
    status TEXT,
    FOREIGN KEY (vendor_id) REFERENCES accounts(acct_id),
    FOREIGN KEY (buyer_id) REFERENCES accounts(acct_id),
    FOREIGN KEY (prod_id) REFERENCES products(p_id),
    FOREIGN KEY (validated_by) REFERENCES employees(e_id)
  );`.trim(),
    rows: transactionsRows,
    roleOverrides: {
      theory: {
        rows: theoryTransactionsRows,
        rowLimits: THEORY_ROW_LIMITS,
      },
    },
  },
  expenses: {
    name: 'expenses',
    createStatement: `
  CREATE TABLE expenses (
    exp_id INTEGER PRIMARY KEY,
    amount REAL,
    d_id INTEGER,
    description TEXT,
    date DATE,
    requested_by INTEGER,
    approved_by INTEGER,
    FOREIGN KEY (d_id) REFERENCES departments(d_id),
    FOREIGN KEY (requested_by) REFERENCES employees(e_id),
    FOREIGN KEY (approved_by) REFERENCES employees(e_id)
  );`.trim(),
    rows: expensesRows,
    roleOverrides: {
      theory: {
        rows: theoryExpensesRows,
        rowLimits: THEORY_ROW_LIMITS,
      },
    },
  },
  quarterly_performance: {
    name: 'quarterly_performance',
    createStatement: `
  CREATE TABLE quarterly_performance (
    quarter INTEGER,
    fiscal_year INTEGER,
    revenue REAL,
    operating_expenses REAL,
    total_transactions INTEGER,
    growth_rate REAL,
    updated_at DATETIME,
    PRIMARY KEY (quarter, fiscal_year)
  );`.trim(),
    rows: quarterlyPerformanceRows,
    roleOverrides: {
      theory: {
        rows: theoryQuarterlyPerformanceRows,
        rowLimits: THEORY_ROW_LIMITS,
      },
    },
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
  core: ['employees', 'emp_data', 'emp_dept', 'departments'],
  commerce: ['accounts', 'products', 'transactions'],
  finance: ['expenses', 'quarterly_performance'],
  full: ['employees', 'emp_data', 'emp_dept', 'departments', 'accounts', 'products', 'transactions', 'expenses', 'quarterly_performance'],
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

function extractColumns(createStatement: string): string[] {
  const body = createStatement.match(/\(([\s\S]+)\)/)?.[1];
  if (!body) return [];

  return body
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/,$/, ''))
    .filter((line) => line.length > 0)
    .filter((line) => !/^(primary|foreign|unique|constraint|check)\b/i.test(line))
    .map((line) => line.split(/\s+/)[0])
    .map((column) => column.replace(/^[`"[]?(.+?)[`"\]]?$/, '$1'))
    .filter(Boolean);
}

export function getCompletionSchemaForTables(tables: TableKey[], role?: DatabaseRole): Record<string, string[]> {
  const schema: Record<string, string[]> = {};
  const seen = new Set<string>();

  tables.forEach((tableKey) => {
    const source = tableDefinitions[tableKey];
    if (!source) return;
    const definition = resolveDefinitionForRole(source, role);
    if (!definition || seen.has(definition.name)) return;

    const columns = extractColumns(definition.createStatement);
    if (columns.length === 0) return;

    schema[definition.name] = columns;
    seen.add(definition.name);
  });

  return schema;
}

export function getCompletionSchemaForKey(schemaKey: SchemaKey, role?: DatabaseRole): Record<string, string[]> {
  const tables = getTablesForSchema(schemaKey);
  return getCompletionSchemaForTables(tables, role);
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
