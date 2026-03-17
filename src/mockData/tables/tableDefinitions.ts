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
	// Company internals.
  departments: departmentsTable,
  employees: employeesTable,
  contracts: contractsTable,
  allocations: allocationsTable,

	// Financials.
  expenses: expensesTable,
  quarterly_performance: quarterlyPerformanceTable,
	
	// Sales.
  accounts: accountsTable,
  products: productsTable,
  transactions: transactionsTable,
} satisfies Record<string, TableDefinition>;

export type TableKey = keyof typeof tableDefinitions;

export const allTables = Object.keys(tableDefinitions) as TableKey[];
