import type { TableDefinition, Attributes } from '../../types';
import { parseCsv, buildRows } from '../../utils';

import fullCsv from './contractsFull.csv?raw';
import smallCsv from './contractsSmall.csv?raw';

const attributes = {
  e_id: 'id',
  position: 'string',
  salary: 'number',
  start_date: 'date',
  end_date: 'date',
  perf_score: 'number',
  status: 'string',
} as const satisfies Attributes;

export const contractsTable: TableDefinition = {
  name: 'contracts',
  attributes,
  createStatement: `CREATE TABLE contracts (
  e_id INTEGER NOT NULL,
  position TEXT,
  salary REAL,
  start_date TEXT,
  end_date TEXT,
  perf_score INTEGER,
  status TEXT,
  FOREIGN KEY (e_id) REFERENCES employees(e_id)
);`,
  rows: {
    full: buildRows(parseCsv(fullCsv), attributes),
    small: buildRows(parseCsv(smallCsv), attributes),
  },
};
