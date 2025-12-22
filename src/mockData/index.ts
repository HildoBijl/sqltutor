import { resolveContentSize, resolveContentTables } from './contentAccess';
import { buildInsertStatement, getRowsForSize, resolveDefinitionForRole } from './shared';
import { tableDefinitions, type TableKey } from './tableDefinitions';
import type { DatasetSize, DatabaseRole } from './types';

export type { DatasetSize, DatabaseRole } from './types';
export type { TableKey };
export { tableDefinitions };

interface BuildSchemaOptions {
  tables: TableKey[];
  size?: DatasetSize;
  role?: DatabaseRole;
}

export function buildSchema({ tables, size, role }: BuildSchemaOptions): string {
  if (!tables || tables.length === 0) {
    return '';
  }

  const statements: string[] = [];
  const seen = new Set<string>();

  tables.forEach((tableKey) => {
    const sourceDefinition = tableDefinitions[tableKey];
    if (!sourceDefinition) return;
    const definition = resolveDefinitionForRole(sourceDefinition, role);
    if (!definition || seen.has(definition.name)) {
      return;
    }
    seen.add(definition.name);

    statements.push(definition.createStatement);
    const rows = getRowsForSize(definition, size);
    if (rows.length > 0) {
      statements.push(buildInsertStatement(definition.name, rows));
    }
  });

  return statements.join('\n\n').trim();
}

const schemaTableGroups: Record<string, TableKey[]> = {
  core: ['employees', 'emp_data', 'emp_dept', 'departments'],
  commerce: ['accounts', 'products', 'transactions'],
  finance: ['expenses', 'quarterly_performance'],
  full: ['employees', 'emp_data', 'emp_dept', 'departments', 'accounts', 'products', 'transactions', 'expenses', 'quarterly_performance'],
};

export const schemas = Object.entries(schemaTableGroups).reduce<Record<string, string>>(
  (acc, [key, tables]) => {
    acc[key] = buildSchema({ tables, size: 'medium' });
    return acc;
  },
  {},
);

export type SchemaKey = keyof typeof schemas;

export function getTablesForSchema(schemaKey: SchemaKey): TableKey[] {
  return schemaTableGroups[schemaKey] ?? schemaTableGroups.core;
}

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

export function getCompletionSchemaForTables(tables: TableKey[], role?: DatabaseRole): Record<string, string[]> {
  const schema: Record<string, string[]> = {};
  const seen = new Set<string>();

  tables.forEach((tableKey) => {
    const source = tableDefinitions[tableKey];
    if (!source) return;
    const definition = resolveDefinitionForRole(source, role);
    if (!definition || seen.has(definition.name)) return;

    const columns = extractColumns(definition.createStatement);
    if (columns.length === 0) return;

    schema[definition.name] = columns;
    seen.add(definition.name);
  });

  return schema;
}

export function getCompletionSchemaForKey(schemaKey: SchemaKey, role?: DatabaseRole): Record<string, string[]> {
  const tables = getTablesForSchema(schemaKey);
  return getCompletionSchemaForTables(tables, role);
}

export function getTableNames(schema: string): string[] {
  const matches = schema.match(/CREATE TABLE (\w+)/gi);
  if (!matches) return [];
  return matches.map((match) => match.replace(/CREATE TABLE /i, '').trim());
}

export function getSchemaDescription(schemaKey: SchemaKey): string {
  const descriptions: Record<SchemaKey, string> = {
    core: 'Employee records and department assignments',
    commerce: 'Accounts, products, and transactions',
    finance: 'Expenses and quarterly performance',
    full: 'Combined operational data set',
  };

  return descriptions[schemaKey] ?? 'Database schema';
}

export function resolveDatasetSize(role: DatabaseRole, skillId?: string, override?: DatasetSize): DatasetSize {
  return resolveContentSize(role, skillId, override);
}

export function resolveSkillTables(role: DatabaseRole, skillId?: string): TableKey[] {
  return resolveContentTables(role, skillId);
}
