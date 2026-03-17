import fullCsv from './accountsFull.csv?raw';
import smallCsv from './accountsSmall.csv?raw';
import { parseCsv, buildRows } from '../../utils';
import type { TableDefinition, Attributes } from '../../types';

const attributes = {
  username: 'string',
  phone: 'string',
  email: 'string',
  verified: 'boolean',
  first_name: 'string',
  last_name: "string",
  address: 'string',
  city: 'string',
  created_at: 'date',
  last_login_at: 'date',
} as const satisfies Attributes;

export const accountsTable: TableDefinition = {
  name: 'accounts',
  attributes,
  createStatement: `CREATE TABLE accounts (
  username TEXT PRIMARY KEY,
  phone TEXT,
  email TEXT,
  email_verified BOOLEAN,
  first_name TEXT,
  last_name TEXT,
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
