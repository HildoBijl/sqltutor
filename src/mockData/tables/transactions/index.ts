import fullCsv from './full.csv?raw';
import smallCsv from './small.csv?raw';
import { parseCsv, buildRows } from '../../utils';
import type { TableDefinition, Attributes } from '../../types';

const attributes = {
  t_id: 'id',
  vendor_id: 'string',
  buyer_id: 'string',
  prod_id: 'id',
  date_time: 'date',
  amount: 'number',
  validated_by: 'id',
  status: 'string',
} as const satisfies Attributes;

export const transactionsTable: TableDefinition = {
  name: 'transactions',
  attributes,
  createStatement: `CREATE TABLE transactions (
  t_id INTEGER PRIMARY KEY,
  vendor_id TEXT,
  buyer_id TEXT,
  prod_id INTEGER,
  date_time DATETIME,
  amount REAL,
  validated_by INTEGER,
  status TEXT,
  FOREIGN KEY (vendor_id) REFERENCES accounts(acct_id),
  FOREIGN KEY (buyer_id) REFERENCES accounts(acct_id),
  FOREIGN KEY (prod_id) REFERENCES products(p_id),
  FOREIGN KEY (validated_by) REFERENCES employees(e_id)
);`,
  rows: {
    full: buildRows(parseCsv(fullCsv), attributes),
    small: buildRows(parseCsv(smallCsv), attributes),
  },
};
