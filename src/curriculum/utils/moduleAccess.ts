/**
 * Defines which module has access to which mock data table.
 */

import { type TableKey, allTables } from '@/mockData';
import { getPrerequisites } from '@/learning/skilltree/utils/goalPath'
import { type ModuleId, modules } from '../modules';

// List the point (or points) in the Skill Tree where the respective tables are introduced.
const tableIntroduction: Record<TableKey, ModuleId | ModuleId[]> = {
	// Company internals.
	departments: 'database',
	employees: 'query-language',
	contracts: 'sql',
	allocations: 'join-tables',

	// Financials.
	expenses: 'data-types',
	quarterly_performance: 'aggregation',

	// Sales.
	accounts: 'database-key',
	products: 'join-and-decomposition',
	transactions: 'projection-and-filtering',
} as const;

// Invert the table introduction: which module introduces which table?
const moduleTableIntroduction: Record<ModuleId, TableKey[]> = {};
allTables.forEach(table => {
	const moduleOrList = tableIntroduction[table];
	const moduleList = Array.isArray(moduleOrList) ? moduleOrList : [moduleOrList];
	moduleList.forEach(module => {
		if (!moduleTableIntroduction[module])
			moduleTableIntroduction[module] = [];
		moduleTableIntroduction[module].push(table);
	})
})

// Get the tables required for a given module ID. Gives an empty list when no tables are found.
export function getModuleTables(moduleId: ModuleId): TableKey[] {
	const prerequisites = getPrerequisites(moduleId, modules);
	const introducedTables = Array.from(prerequisites).flatMap(prerequisite => moduleTableIntroduction[prerequisite]);
	return Array.from(new Set(introducedTables));
}
