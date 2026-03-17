import type { DatasetSize } from '../types';
import { buildInsertStatement } from '../utils';
import { type TableKey, tableDefinitions } from '../tables';

/**
 * Build SQL statements to create and populate tables.
 *
 * @param options - Tables to include and size to use
 * @returns SQL string with CREATE TABLE and INSERT statements
 */
export function buildSchema({ tables, size = 'small' }: { tables: TableKey[]; size?: DatasetSize }): string {
	if (!tables || tables.length === 0) {
		return '';
	}

	const statements: string[] = [];
	const seen = new Set<string>();

	tables.forEach((tableKey) => {
		const definition = tableDefinitions[tableKey];
		if (!definition || seen.has(definition.name)) {
			return;
		}
		seen.add(definition.name);

		statements.push(definition.createStatement);
		const rows = definition.rows[size];
		if (rows.length > 0) {
			statements.push(buildInsertStatement(definition.name, rows));
		}
	});

	return statements.join('\n\n').trim();
}
