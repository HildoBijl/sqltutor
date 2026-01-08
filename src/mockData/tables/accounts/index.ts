import fullCsv from './full.csv?raw';
import smallCsv from './small.csv?raw';
import { parseCsv, buildRows } from '../../utils';
import type { TableDefinition, Attributes } from '../../types';

const attributes = {
  acct_id: 'string',
  username: 'string',
  phone: 'string',
  email: 'string',
  verified: 'boolean',
  full_name: 'string',
  address: 'string',
  city: 'string',
  created_at: 'date',
  last_login_at: 'date',
} as const satisfies Attributes;

export const accountsTable: TableDefinition = {
  name: 'accounts',
  attributes,
  createStatement: `CREATE TABLE accounts (
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
);`,
  rows: {
    full: buildRows(parseCsv(fullCsv), attributes),
    small: buildRows(parseCsv(smallCsv), attributes),
  },
};
