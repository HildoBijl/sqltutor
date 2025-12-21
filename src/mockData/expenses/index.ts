import dataCsv from './data.csv?raw';
import theoryCsv from './theory.csv?raw';
import { THEORY_ROW_LIMITS } from '../constants';
import { idOrNull, numberOrNull, parseCsv, stringOrNull } from '../shared';
import type { SqlCell, TableDefinition } from '../types';

function buildRows(records: Record<string, string>[]): SqlCell[][] {
  return records.map((row) => [
    idOrNull(row.exp_id),
    numberOrNull(row.amount),
    idOrNull(row.d_id),
    stringOrNull(row.description),
    stringOrNull(row.date),
    idOrNull(row.requested_by),
    idOrNull(row.approved_by),
  ]);
}

const expensesRows = buildRows(parseCsv(dataCsv));
const theoryExpensesRows = buildRows(parseCsv(theoryCsv));

export const expensesTable: TableDefinition = {
  name: 'expenses',
  createStatement: `
  CREATE TABLE expenses (
    exp_id INTEGER PRIMARY KEY,
    amount REAL,
    d_id INTEGER,
    description TEXT,
    date DATE,
    requested_by INTEGER,
    approved_by INTEGER,
    FOREIGN KEY (d_id) REFERENCES departments(d_id),
    FOREIGN KEY (requested_by) REFERENCES employees(e_id),
    FOREIGN KEY (approved_by) REFERENCES employees(e_id)
  );`.trim(),
  rows: expensesRows,
  roleOverrides: {
    theory: {
      rows: theoryExpensesRows,
      rowLimits: THEORY_ROW_LIMITS,
    },
  },
};
