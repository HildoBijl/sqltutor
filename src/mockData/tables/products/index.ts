import fullCsv from './full.csv?raw';
import smallCsv from './small.csv?raw';
import { parseCsv, buildRows } from '../../utils';
import type { TableDefinition, Attributes } from '../../types';

const attributes = {
  p_id: 'id',
  name: 'string',
  category: 'string',
  owner_id: 'string',
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
  owner_id TEXT,
  est_value REAL,
  status TEXT,
  FOREIGN KEY (owner_id) REFERENCES accounts(acct_id)
);`,
  rows: {
    full: buildRows(parseCsv(fullCsv), attributes),
    small: buildRows(parseCsv(smallCsv), attributes),
  },
};
