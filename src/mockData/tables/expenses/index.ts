import type { TableDefinition, Attributes } from '../../types';
import { parseCsv, buildRows } from '../../utils';

import fullCsv from './expensesFull.csv?raw';
import smallCsv from './expensesSmall.csv?raw';

const attributes = {
  exp_id: 'id',
  amount: 'number',
  d_id: 'id',
  description: 'string',
  date: 'date',
  requested_by: 'id',
  approved_by: 'id',
} as const satisfies Attributes;

export const expensesTable: TableDefinition = {
  name: 'expenses',
  attributes,
  createStatement: `CREATE TABLE expenses (
  exp_id INTEGER PRIMARY KEY,
  amount REAL,
  d_id INTEGER,
  description TEXT,
  date TEXT,
  requested_by INTEGER,
  approved_by INTEGER,
  FOREIGN KEY (d_id) REFERENCES departments(d_id),
  FOREIGN KEY (requested_by) REFERENCES employees(e_id),
  FOREIGN KEY (approved_by) REFERENCES employees(e_id)
);`,
  rows: {
    full: buildRows(parseCsv(fullCsv), attributes),
    small: buildRows(parseCsv(smallCsv), attributes),
  },
};
