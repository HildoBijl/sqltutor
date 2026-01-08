import fullCsv from './full.csv?raw';
import smallCsv from './small.csv?raw';
import { parseCsv, buildRows } from '../../utils';
import type { TableDefinition, Attributes } from '../../types';

const attributes = {
  d_id: 'id',
  d_name: 'string',
  manager_id: 'id',
  budget: 'number',
  nr_employees: 'number',
} as const satisfies Attributes;

export const departmentsTable: TableDefinition = {
  name: 'departments',
  attributes,
  createStatement: `CREATE TABLE departments (
  d_id INTEGER PRIMARY KEY,
  d_name TEXT NOT NULL,
  manager_id INTEGER,
  budget REAL,
  nr_employees INTEGER,
  FOREIGN KEY (manager_id) REFERENCES employees(e_id)
);`,
  rows: {
    full: buildRows(parseCsv(fullCsv), attributes),
    small: buildRows(parseCsv(smallCsv), attributes),
  },
};
