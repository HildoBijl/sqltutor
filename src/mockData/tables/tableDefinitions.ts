/**
 * Central registry of all table definitions.
 */

import { accountsTable } from './accounts';
import { allocationsTable } from './allocations';
import { contractsTable } from './contracts';
import { departmentsTable } from './departments';
import { employeesTable } from './employees';
import { expensesTable } from './expenses';
import { productsTable } from './products';
import { quarterlyPerformanceTable } from './quarterly_performance';
import { transactionsTable } from './transactions';
import type { TableDefinition } from '../types';

export const tableDefinitions = {
  accounts: accountsTable,
  allocations: allocationsTable,
  contracts: contractsTable,
  departments: departmentsTable,
  employees: employeesTable,
  expenses: expensesTable,
  products: productsTable,
  quarterly_performance: quarterlyPerformanceTable,
  transactions: transactionsTable,
} satisfies Record<string, TableDefinition>;

export type TableKey = keyof typeof tableDefinitions;
