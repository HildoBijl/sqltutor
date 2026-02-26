import fullCsv from './full.csv?raw';
import smallCsv from './small.csv?raw';
import { parseCsv, buildRows } from '../../utils';
import type { TableDefinition, Attributes } from '../../types';

const attributes = {
  t_id: 'id',
  vendor_username: 'string',
  buyer_username: 'string',
  prod_id: 'id',
  date_time: 'date',
  price: 'number',
  validated_by: 'id',
  status: 'string',
} as const satisfies Attributes;

export const transactionsTable: TableDefinition = {
  name: 'transactions',
  attributes,
  createStatement: `CREATE TABLE transactions (
  t_id INTEGER PRIMARY KEY,
  vendor_username TEXT,
  buyer_username TEXT,
  prod_id INTEGER,
  date_time TEXT,
  price REAL,
  validated_by INTEGER,
  status TEXT,
  FOREIGN KEY (vendor_username) REFERENCES accounts(username),
  FOREIGN KEY (buyer_username) REFERENCES accounts(acct_id),
  FOREIGN KEY (prod_id) REFERENCES products(p_id),
  FOREIGN KEY (validated_by) REFERENCES employees(e_id)
);`,
  rows: {
    full: buildRows(parseCsv(fullCsv), attributes),
    small: buildRows(parseCsv(smallCsv), attributes),
  },
};
