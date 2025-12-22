import dataCsv from './data.csv?raw';
import theoryCsv from './theory.csv?raw';
import { THEORY_ROW_LIMITS } from '../constants';
import { idOrNull, numberOrNull, parseCsv, stringOrNull } from '../shared';
import type { SqlCell, TableDefinition } from '../types';

function buildRows(records: Record<string, string>[]): SqlCell[][] {
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

const employeesRows = buildRows(parseCsv(dataCsv));
const theoryEmployeesRows = buildRows(parseCsv(theoryCsv));

export const employeesTable: TableDefinition = {
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
};
