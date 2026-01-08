/**
 * Central registry of all table definitions.
 */

import { accountsTable } from './accounts';
import { departmentsTable } from './departments';
import { empDataTable } from './emp_data';
import { empDeptTable } from './emp_dept';
import { employeesTable } from './employees';
import { expensesTable } from './expenses';
import { productsTable } from './products';
import { quarterlyPerformanceTable } from './quarterly_performance';
import { transactionsTable } from './transactions';
import type { TableDefinition } from '../types';

export const tableDefinitions = {
  employees: employeesTable,
  emp_data: empDataTable,
  emp_dept: empDeptTable,
  departments: departmentsTable,
  accounts: accountsTable,
  products: productsTable,
  transactions: transactionsTable,
  expenses: expensesTable,
  quarterly_performance: quarterlyPerformanceTable,
} satisfies Record<string, TableDefinition>;

export type TableKey = keyof typeof tableDefinitions;
