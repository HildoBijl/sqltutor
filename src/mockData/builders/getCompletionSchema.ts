import { type TableKey, tableDefinitions } from '../tables';

/**
 * Extract column names from a CREATE TABLE statement.
 */
function extractColumns(createStatement: string): string[] {
	const body = createStatement.match(/\(([\s\S]+)\)/)?.[1];
	if (!body) return [];

	return body
		.split(/\r?\n/)
		.map((line) => line.trim().replace(/,$/, ''))
		.filter((line) => line.length > 0)
		.filter((line) => !/^(primary|foreign|unique|constraint|check)\b/i.test(line))
		.map((line) => line.split(/\s+/)[0])
		.map((column) => column.replace(/^[`"[]?(.+?)[`"\]]?$/, '$1'))
		.filter(Boolean);
}

/**
 * Get a completion schema (table → columns mapping) for SQL autocompletion.
 *
 * @param tables - Table keys to include
 * @returns Object mapping table names to column name arrays
 */
export function getCompletionSchema(tables: TableKey[]): Record<string, string[]> {
	const schema: Record<string, string[]> = {};
	const seen = new Set<string>();

	tables.forEach((tableKey) => {
		const definition = tableDefinitions[tableKey];
		if (!definition || seen.has(definition.name)) return;

		const columns = extractColumns(definition.createStatement);
		if (columns.length === 0) return;

		schema[definition.name] = columns;
		seen.add(definition.name);
	});

	return schema;
}
