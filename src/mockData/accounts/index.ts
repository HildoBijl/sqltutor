import dataCsv from './data.csv?raw';
import theoryCsv from './theory.csv?raw';
import { THEORY_ROW_LIMITS } from '../constants';
import { booleanOrNull, parseCsv, stringOrNull } from '../shared';
import type { SqlCell, TableDefinition } from '../types';

function buildRows(records: Record<string, string>[]): SqlCell[][] {
  return records.map((row) => [
    stringOrNull(row.acct_id),
    stringOrNull(row.username),
    stringOrNull(row.phone),
    stringOrNull(row.email),
    booleanOrNull(row.verified),
    stringOrNull(row.full_name),
    stringOrNull(row.address),
    stringOrNull(row.city),
    stringOrNull(row.created_at),
    stringOrNull(row.last_login_at),
  ]);
}

const accountsRows = buildRows(parseCsv(dataCsv));
const theoryAccountsRows = buildRows(parseCsv(theoryCsv));

export const accountsTable: TableDefinition = {
  name: 'accounts',
  createStatement: `
  CREATE TABLE accounts (
    acct_id TEXT PRIMARY KEY,
    username TEXT,
    phone TEXT,
    email TEXT,
    email_verified BOOLEAN,
    full_name TEXT,
    address TEXT,
    city TEXT,
    created_at TEXT,
    last_login_at TEXT
  );`.trim(),
  rows: accountsRows,
  roleOverrides: {
    theory: {
      rows: theoryAccountsRows,
      rowLimits: THEORY_ROW_LIMITS,
    },
  },
};
