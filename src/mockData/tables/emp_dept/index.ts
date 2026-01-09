import fullCsv from './full.csv?raw';
import smallCsv from './small.csv?raw';
import { parseCsv, buildRows } from '../../utils';
import type { TableDefinition, Attributes } from '../../types';

const attributes = {
  e_id: 'id',
  d_id: 'id',
} as const satisfies Attributes;

export const empDeptTable: TableDefinition = {
  name: 'emp_dept',
  attributes,
  createStatement: `CREATE TABLE emp_dept (
  e_id INTEGER NOT NULL,
  d_id INTEGER NOT NULL,
  PRIMARY KEY (e_id, d_id),
  FOREIGN KEY (e_id) REFERENCES employees(e_id),
  FOREIGN KEY (d_id) REFERENCES departments(d_id)
);`,
  rows: {
    full: buildRows(parseCsv(fullCsv), attributes),
    small: buildRows(parseCsv(smallCsv), attributes),
  },
};
