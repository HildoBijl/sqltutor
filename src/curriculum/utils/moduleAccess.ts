/**
 * Defines which module has access to which mock data table.
 */

import { type TableKey, allTables } from '@sqlvalley/mock-data';
import { getPrerequisites } from '@sqlvalley/skill-tree-definition';
import { type ModuleId, skillTree } from '../skillTree';

// List the point (or points) in the Skill Tree where the respective tables are introduced.
const tableIntroduction: Record<TableKey, ModuleId | ModuleId[]> = {
	// Company internals.
	departments: 'database',
	employees: 'query-language',
	contracts: 'sql',
	allocations: 'join-tables',

	// Financials.
	expenses: 'data-types',
	quarterlyPerformance: 'aggregation',

	// Sales.
	accounts: 'database-keys',
	products: 'join-and-decomposition',
	transactions: 'projection-and-filtering',
} as const;

// Invert the table introduction: which module introduces which table?
const moduleTableIntroduction: Record<ModuleId, TableKey[]> = {};
allTables.forEach(table => {
	const moduleOrList = tableIntroduction[table];
	const moduleIds = Array.isArray(moduleOrList) ? moduleOrList : [moduleOrList];
	moduleIds.forEach(moduleId => {
		if (!skillTree[moduleId])
			throw new Error(`Invalid module ID given in table introductions: module "${moduleId}" is unknown.`)
		if (!moduleTableIntroduction[moduleId])
			moduleTableIntroduction[moduleId] = [];
		moduleTableIntroduction[moduleId].push(table);
	})
})

// Get the tables required for a given module ID. Gives an empty list when no tables are found.
export function getModuleTables(moduleId: ModuleId): TableKey[] {
	const prerequisites = getPrerequisites(skillTree, moduleId);
	const introducedTables = Array.from(prerequisites).flatMap(prerequisite => moduleTableIntroduction[prerequisite]);
	return Array.from(new Set(introducedTables));
}
