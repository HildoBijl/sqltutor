import dataCsv from './data.csv?raw';
import theoryCsv from './theory.csv?raw';
import { THEORY_ROW_LIMITS } from '../constants';
import { idOrNull, numberOrNull, parseCsv, stringOrNull } from '../shared';
import type { SqlCell, TableDefinition } from '../types';

function buildRows(records: Record<string, string>[]): SqlCell[][] {
  return records.map((row) => [
    idOrNull(row.t_id),
    stringOrNull(row.vendor_id),
    stringOrNull(row.buyer_id),
    idOrNull(row.prod_id),
    stringOrNull(row.date_time),
    numberOrNull(row.amount ?? row.price),
    idOrNull(row.validated_by),
    stringOrNull(row.status),
  ]);
}

const transactionsRows = buildRows(parseCsv(dataCsv));
const theoryTransactionsRows = buildRows(parseCsv(theoryCsv));

export const transactionsTable: TableDefinition = {
  name: 'transactions',
  createStatement: `
  CREATE TABLE transactions (
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
  );`.trim(),
  rows: transactionsRows,
  roleOverrides: {
    theory: {
      rows: theoryTransactionsRows,
      rowLimits: THEORY_ROW_LIMITS,
    },
  },
};
