import dataCsv from './data.csv?raw';
import theoryCsv from './theory.csv?raw';
import { THEORY_ROW_LIMITS } from '../constants';
import { numberOrNull, parseCsv, stringOrNull } from '../shared';
import type { SqlCell, TableDefinition } from '../types';

function buildRows(records: Record<string, string>[]): SqlCell[][] {
  return records.map((row) => [
    numberOrNull(row.quarter),
    numberOrNull(row.fiscal_year),
    numberOrNull(row.revenue),
    numberOrNull(row.operating_expenses),
    numberOrNull(row.total_transactions),
    numberOrNull(row.growth_rate),
    stringOrNull(row.updated_at),
  ]);
}

const quarterlyPerformanceRows = buildRows(parseCsv(dataCsv));
const theoryQuarterlyPerformanceRows = buildRows(parseCsv(theoryCsv));

export const quarterlyPerformanceTable: TableDefinition = {
  name: 'quarterly_performance',
  createStatement: `
  CREATE TABLE quarterly_performance (
    quarter INTEGER,
    fiscal_year INTEGER,
    revenue REAL,
    operating_expenses REAL,
    total_transactions INTEGER,
    growth_rate REAL,
    updated_at DATETIME,
    PRIMARY KEY (quarter, fiscal_year)
  );`.trim(),
  rows: quarterlyPerformanceRows,
  roleOverrides: {
    theory: {
      rows: theoryQuarterlyPerformanceRows,
      rowLimits: THEORY_ROW_LIMITS,
    },
  },
};
