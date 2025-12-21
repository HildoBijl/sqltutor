import dataCsv from './data.csv?raw';
import theoryCsv from './theory.csv?raw';
import { THEORY_ROW_LIMITS } from '../constants';
import { idOrNull, parseCsv } from '../shared';
import type { SqlCell, TableDefinition } from '../types';

function buildRows(records: Record<string, string>[]): SqlCell[][] {
  return records.map((row) => [idOrNull(row.e_id), idOrNull(row.d_id)]);
}

const empDeptRows = buildRows(parseCsv(dataCsv));
const theoryEmpDeptRows = buildRows(parseCsv(theoryCsv));

export const empDeptTable: TableDefinition = {
  name: 'emp_dept',
  createStatement: `
  CREATE TABLE emp_dept (
    e_id INTEGER NOT NULL,
    d_id INTEGER NOT NULL,
    PRIMARY KEY (e_id, d_id),
    FOREIGN KEY (e_id) REFERENCES employees(e_id),
    FOREIGN KEY (d_id) REFERENCES departments(d_id)
  );`.trim(),
  rows: empDeptRows,
  roleOverrides: {
    theory: {
      rows: theoryEmpDeptRows,
      rowLimits: THEORY_ROW_LIMITS,
    },
  },
};
