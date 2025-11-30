import mockDataCsv from '../../../mock_data.csv?raw';

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
  small: 50,
  medium: Number.POSITIVE_INFINITY,
  large: Number.POSITIVE_INFINITY,
};

type SalaryRecord = { date: string; salary: number };

interface MockRow {
  eId: number;
  position: string | null;
  salary: number | null;
  startDate: string | null;
  endDate: string | null;
  perfScore: number | null;
  status: string | null;
  deptId: number | null;
  deptName: string | null;
  name: string | null;
}

function toNumber(value: string | null | undefined): number | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeStatus(status: string | null): string | null {
  if (!status) return null;
  const normalized = status.trim().toLowerCase();
  const map: Record<string, string> = {
    'sick leave': 'sick_leave',
    'paid leave': 'paid_leave',
    'parental leave': 'parental_leave',
    'unpaid personal leave': 'unpaid_leave',
    fmla: 'fmla',
    sabbatical: 'sabbatical',
    'bereavement leave': 'bereavement_leave',
  };
  return map[normalized] ?? normalized.replace(/\s+/g, '_');
}

function splitName(name: string | null, fallbackId: number): { first: string; last: string } {
  if (!name) {
    return { first: `Employee ${fallbackId}`, last: '' };
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) {
    return { first: `Employee ${fallbackId}`, last: '' };
  }
  const [first, ...rest] = parts;
  return { first, last: rest.join(' ') };
}

function pickLatestSalary(salaries: SalaryRecord[]): number | null {
  if (!salaries.length) return null;
  const sorted = [...salaries].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  return sorted[sorted.length - 1]?.salary ?? null;
}

function parseMockData(raw: string): MockRow[] {
  if (!raw) return [];

  const lines = raw.trim().split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const header = lines[0].replace(/^\uFEFF/, '').split(',');
  const rows: MockRow[] = [];

  const getCell = (line: string, index: number): string | null => {
    const parts = line.split(',');
    if (index >= parts.length) return null;
    const value = parts[index]?.trim() ?? '';
    return value.length > 0 ? value : null;
  };

  const eIdIndex = header.indexOf('e_id');
  const positionIndex = header.indexOf('position');
  const salaryIndex = header.indexOf('salary');
  const startDateIndex = header.indexOf('start_date');
  const endDateIndex = header.indexOf('end_date');
  const perfIndex = header.indexOf('perf_score');
  const statusIndex = header.indexOf('status');
  const deptIdIndex = header.indexOf('dept_id');
  const deptNameIndex = header.indexOf('dept_name');
  const nameIndex = header.indexOf('name');

  lines.slice(1).forEach((line) => {
    const eId = toNumber(getCell(line, eIdIndex));
    if (!eId) return;

    rows.push({
      eId,
      position: getCell(line, positionIndex),
      salary: toNumber(getCell(line, salaryIndex)),
      startDate: getCell(line, startDateIndex),
      endDate: getCell(line, endDateIndex),
      perfScore: toNumber(getCell(line, perfIndex)),
      status: getCell(line, statusIndex),
      deptId: toNumber(getCell(line, deptIdIndex)),
      deptName: getCell(line, deptNameIndex),
      name: getCell(line, nameIndex),
    });
  });

  return rows;
}

const mockRows = parseMockData(mockDataCsv);

type DepartmentAggregate = { name: string; employeeIds: Set<number> };
type EmployeeAggregate = { firstName: string; lastName: string; salaries: SalaryRecord[] };

const departments = new Map<number, DepartmentAggregate>();
const employees = new Map<number, EmployeeAggregate>();
const empDataRows: SqlCell[][] = [];

mockRows.forEach((row) => {
  const status = normalizeStatus(row.status);

  empDataRows.push([
    row.eId,
    row.deptId,
    row.position,
    row.salary,
    row.startDate,
    row.endDate,
    row.perfScore,
    null,
    status,
  ]);

  if (row.deptId !== null) {
    const existingDept = departments.get(row.deptId) ?? {
      name: row.deptName || `Department ${row.deptId}`,
      employeeIds: new Set<number>(),
    };
    if (row.deptName) {
      existingDept.name = row.deptName;
    }
    existingDept.employeeIds.add(row.eId);
    departments.set(row.deptId, existingDept);
  }

  const existingEmployee = employees.get(row.eId) ?? {
    firstName: '',
    lastName: '',
    salaries: [],
  };
  if (!existingEmployee.firstName || !existingEmployee.lastName) {
    const names = splitName(row.name, row.eId);
    existingEmployee.firstName = names.first;
    existingEmployee.lastName = names.last;
  }
  if (row.salary !== null) {
    existingEmployee.salaries.push({
      salary: row.salary,
      date: row.startDate || row.endDate || '',
    });
  }
  employees.set(row.eId, existingEmployee);
});

const employeesRows: SqlCell[][] = Array.from(employees.entries())
  .sort(([a], [b]) => a - b)
  .map(([eId, data]) => [
    eId,
    data.firstName || `Employee ${eId}`,
    data.lastName || '',
    null,
    null,
    null,
    null,
    pickLatestSalary(data.salaries),
  ]);

const departmentsRows: SqlCell[][] = Array.from(departments.entries())
  .sort(([a], [b]) => a - b)
  .map(([dId, data]) => [
    dId,
    data.name,
    null,
    null,
    data.employeeIds.size || null,
  ]);

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
    current_salary REAL
  );`.trim(),
    rows: employeesRows,
  },
  departments: {
    name: 'departments',
    createStatement: `
  CREATE TABLE departments (
    d_id INTEGER PRIMARY KEY,
    d_name TEXT NOT NULL,
    managed_by INTEGER,
    budget REAL,
    nr_employees INTEGER,
    FOREIGN KEY (managed_by) REFERENCES employees(e_id)
  );`.trim(),
    rows: departmentsRows,
  },
  emp_data: {
    name: 'emp_data',
    createStatement: `
  CREATE TABLE emp_data (
    e_id INTEGER NOT NULL,
    d_id INTEGER,
    position TEXT,
    salary REAL,
    start_date DATE,
    end_date DATE,
    perf_score INTEGER,
    other_info TEXT,
    work_status TEXT,
    PRIMARY KEY (e_id, start_date, end_date),
    FOREIGN KEY (e_id) REFERENCES employees(e_id),
    FOREIGN KEY (d_id) REFERENCES departments(d_id)
  );`.trim(),
    rows: empDataRows,
  },
  clock_in_out: {
    name: 'clock_in_out',
    createStatement: `
  CREATE TABLE clock_in_out (
    entry_id INTEGER PRIMARY KEY,
    e_id INTEGER NOT NULL,
    in_time DATETIME NOT NULL,
    out_time DATETIME,
    on_site BOOLEAN,
    FOREIGN KEY (e_id) REFERENCES employees(e_id)
  );`.trim(),
    rows: [],
  },
  accounts: {
    name: 'accounts',
    createStatement: `
  CREATE TABLE accounts (
    acct_id INTEGER PRIMARY KEY,
    username TEXT,
    phone TEXT,
    email TEXT,
    email_verified BOOLEAN,
    full_name TEXT,
    created_at DATETIME,
    last_login_at DATETIME
  );`.trim(),
    rows: [],
  },
  products: {
    name: 'products',
    createStatement: `
  CREATE TABLE products (
    p_id INTEGER PRIMARY KEY,
    name TEXT,
    category TEXT,
    owner_id INTEGER,
    est_value REAL,
    status TEXT,
    FOREIGN KEY (owner_id) REFERENCES accounts(acct_id)
  );`.trim(),
    rows: [],
  },
  transactions: {
    name: 'transactions',
    createStatement: `
  CREATE TABLE transactions (
    t_id INTEGER PRIMARY KEY,
    vendor_id INTEGER,
    buyer_id INTEGER,
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
    rows: [],
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
    rows: [],
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
    rows: [],
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
  core: ['employees', 'departments', 'emp_data', 'clock_in_out'],
  commerce: ['accounts', 'products', 'transactions'],
  finance: ['expenses', 'quarterly_performance'],
  full: [
    'employees',
    'departments',
    'emp_data',
    'clock_in_out',
    'accounts',
    'products',
    'transactions',
    'expenses',
    'quarterly_performance',
  ],
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
