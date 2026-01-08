import fullCsv from './full.csv?raw';
import smallCsv from './small.csv?raw';
import { parseCsv, buildRows } from '../../utils';
import type { TableDefinition, Attributes } from '../../types';

const attributes = {
  e_id: 'id',
  first_name: 'string',
  last_name: 'string',
  phone: 'string',
  email: 'string',
  address: 'string',
  city: 'string',
  hire_date: 'date',
  current_salary: 'number',
} as const satisfies Attributes;

export const employeesTable: TableDefinition = {
  name: 'employees',
  attributes,
  createStatement: `CREATE TABLE employees (
  e_id INTEGER PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  hire_date DATE,
  current_salary REAL
);`,
  rows: {
    full: buildRows(parseCsv(fullCsv), attributes),
    small: buildRows(parseCsv(smallCsv), attributes),
  },
};
