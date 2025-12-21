import dataCsv from './data.csv?raw';
import theoryCsv from './theory.csv?raw';
import { THEORY_ROW_LIMITS } from '../constants';
import { idOrNull, numberOrNull, parseCsv, stringOrNull } from '../shared';
import type { SqlCell, TableDefinition } from '../types';

function buildRows(records: Record<string, string>[]): SqlCell[][] {
  return records.map((row) => [
    idOrNull(row.d_id),
    stringOrNull(row.d_name),
    idOrNull(row.manager_id),
    numberOrNull(row.budget),
    numberOrNull(row.nr_employees),
  ]);
}

const departmentsRows = buildRows(parseCsv(dataCsv));
const theoryDepartmentsRows = buildRows(parseCsv(theoryCsv));

export const departmentsTable: TableDefinition = {
  name: 'departments',
  createStatement: `
  CREATE TABLE departments (
    d_id INTEGER PRIMARY KEY,
    d_name TEXT NOT NULL,
    manager_id INTEGER,
    budget REAL,
    nr_employees INTEGER,
    FOREIGN KEY (manager_id) REFERENCES employees(e_id)
  );`.trim(),
  rows: departmentsRows,
  roleOverrides: {
    theory: {
      rows: theoryDepartmentsRows,
      rowLimits: THEORY_ROW_LIMITS,
    },
  },
};
