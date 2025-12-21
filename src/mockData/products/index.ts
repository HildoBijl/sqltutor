import dataCsv from './data.csv?raw';
import theoryCsv from './theory.csv?raw';
import { THEORY_ROW_LIMITS } from '../constants';
import { numberOrNull, parseCsv, stringOrNull, idOrNull } from '../shared';
import type { SqlCell, TableDefinition } from '../types';

function buildRows(records: Record<string, string>[]): SqlCell[][] {
  return records.map((row) => [
    idOrNull(row.p_id),
    stringOrNull(row.name),
    stringOrNull(row.category),
    stringOrNull(row.owner_id ?? row.owned_by),
    numberOrNull(row.est_value),
    stringOrNull(row.status),
  ]);
}

const productsRows = buildRows(parseCsv(dataCsv));
const theoryProductsRows = buildRows(parseCsv(theoryCsv));

export const productsTable: TableDefinition = {
  name: 'products',
  createStatement: `
  CREATE TABLE products (
    p_id INTEGER PRIMARY KEY,
    name TEXT,
    category TEXT,
    owner_id TEXT,
    est_value REAL,
    status TEXT,
    FOREIGN KEY (owner_id) REFERENCES accounts(acct_id)
  );`.trim(),
  rows: productsRows,
  roleOverrides: {
    theory: {
      rows: theoryProductsRows,
      rowLimits: THEORY_ROW_LIMITS,
    },
  },
};
