import fullCsv from './full.csv?raw';
import smallCsv from './small.csv?raw';
import { parseCsv, buildRows } from '../../utils';
import type { TableDefinition, Attributes } from '../../types';

const attributes = {
  quarter: 'number',
  fiscal_year: 'number',
  revenue: 'number',
  operating_expenses: 'number',
  total_transactions: 'number',
  growth_rate: 'number',
  updated_at: 'date',
} as const satisfies Attributes;

export const quarterlyPerformanceTable: TableDefinition = {
  name: 'quarterly_performance',
  attributes,
  createStatement: `CREATE TABLE quarterly_performance (
  quarter INTEGER,
  fiscal_year INTEGER,
  revenue REAL,
  operating_expenses REAL,
  total_transactions INTEGER,
  growth_rate REAL,
  updated_at DATETIME,
  PRIMARY KEY (quarter, fiscal_year)
);`,
  rows: {
    full: buildRows(parseCsv(fullCsv), attributes),
    small: buildRows(parseCsv(smallCsv), attributes),
  },
};
