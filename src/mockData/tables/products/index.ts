import fullCsv from './full.csv?raw';
import smallCsv from './small.csv?raw';
import { parseCsv, buildRows } from '../../utils';
import type { TableDefinition, Attributes } from '../../types';

const attributes = {
  p_id: 'id',
  name: 'string',
  category: 'string',
  owned_by: 'string',
  est_value: 'number',
  status: 'string',
} as const satisfies Attributes;

export const productsTable: TableDefinition = {
  name: 'products',
  attributes,
  createStatement: `CREATE TABLE products (
  p_id INTEGER PRIMARY KEY,
  name TEXT,
  category TEXT,
  owned_by TEXT,
  est_value REAL,
  status TEXT,
  FOREIGN KEY (owned_by) REFERENCES accounts(username)
);`,
  rows: {
    full: buildRows(parseCsv(fullCsv), attributes),
    small: buildRows(parseCsv(smallCsv), attributes),
  },
};
