import fullCsv from './full.csv?raw';
import smallCsv from './small.csv?raw';
import { parseCsv, buildRows } from '../../utils';
import type { TableDefinition, Attributes } from '../../types';

const attributes = {
  e_id: 'id',
  position: 'string',
  salary: 'number',
  start_date: 'date',
  end_date: 'date',
  perf_score: 'number',
  status: 'string',
} as const satisfies Attributes;

export const empDataTable: TableDefinition = {
  name: 'emp_data',
  attributes,
  createStatement: `CREATE TABLE emp_data (
  e_id INTEGER NOT NULL,
  position TEXT,
  salary REAL,
  start_date DATE,
  end_date DATE,
  perf_score INTEGER,
  status TEXT,
  FOREIGN KEY (e_id) REFERENCES employees(e_id)
);`,
  rows: {
    full: buildRows(parseCsv(fullCsv), attributes),
    small: buildRows(parseCsv(smallCsv), attributes),
  },
};
