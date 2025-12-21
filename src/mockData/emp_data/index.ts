import dataCsv from './data.csv?raw';
import theoryCsv from './theory.csv?raw';
import { THEORY_ROW_LIMITS } from '../constants';
import { idOrNull, numberOrNull, parseCsv, stringOrNull } from '../shared';
import type { SqlCell, TableDefinition } from '../types';

function buildRows(records: Record<string, string>[]): SqlCell[][] {
  return records.map((row) => [
    idOrNull(row.e_id),
    stringOrNull(row.position),
    numberOrNull(row.salary),
    stringOrNull(row.start_date),
    stringOrNull(row.end_date),
    numberOrNull(row.perf_score),
    stringOrNull(row.status),
  ]);
}

const empDataRows = buildRows(parseCsv(dataCsv));
const theoryEmpDataRows = buildRows(parseCsv(theoryCsv));

export const empDataTable: TableDefinition = {
  name: 'emp_data',
  createStatement: `
  CREATE TABLE emp_data (
    e_id INTEGER NOT NULL,
    position TEXT,
    salary REAL,
    start_date DATE,
    end_date DATE,
    perf_score INTEGER,
    status TEXT,
    FOREIGN KEY (e_id) REFERENCES employees(e_id)
  );`.trim(),
  rows: empDataRows,
  roleOverrides: {
    theory: {
      rows: theoryEmpDataRows,
      rowLimits: THEORY_ROW_LIMITS,
    },
  },
};
