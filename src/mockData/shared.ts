import { DEFAULT_ROW_LIMITS } from './constants';
import type { DatasetSize, DatabaseRole, SqlCell, TableDefinition } from './types';

export function parseCsv(raw: string): Record<string, string>[] {
  if (!raw) return [];
  const source = raw.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let currentCell = '';
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      currentCell += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => header.trim());

  return rows
    .slice(1)
    .map((cells) => {
      const entry: Record<string, string> = {};
      headers.forEach((header, index) => {
        entry[header] = (cells[index] ?? '').trim();
      });
      return entry;
    })
    .filter((entry) => headers.some((header) => (entry[header] ?? '').trim().length > 0));
}

export function numberOrNull(value: string | undefined): number | null {
  if (!value) return null;
  const normalized = value.replace(/[^0-9.-]/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function booleanOrNull(value: string | undefined): boolean | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return null;
}

export function stringOrNull(value: string | undefined): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function idOrNull(value: string | undefined): number | string | null {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return null;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : trimmed;
}

export function formatSqlValue(value: SqlCell): string {
  if (value === null || (typeof value === 'number' && !Number.isFinite(value))) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function buildInsertStatement(table: string, rows: SqlCell[][]): string {
  if (rows.length === 0) return '';
  const values = rows
    .map((row) => `(${row.map(formatSqlValue).join(', ')})`)
    .join(',\n    ');

  return `INSERT INTO ${table} VALUES\n    ${values};`;
}

export function resolveDefinitionForRole(definition: TableDefinition, role?: DatabaseRole): TableDefinition {
  if (!role || !definition.roleOverrides?.[role]) {
    return definition;
  }
  const override = definition.roleOverrides[role]!;
  return {
    name: definition.name,
    createStatement: override.createStatement ?? definition.createStatement,
    rows: override.rows ?? definition.rows,
    rowLimits: override.rowLimits ?? definition.rowLimits,
  };
}

export function getRowsForSize(definition: TableDefinition, size?: DatasetSize): SqlCell[][] {
  const rows = Array.isArray(definition.rows) ? definition.rows : Array.from(definition.rows);
  if (!size) return rows.map((row) => [...row]);
  const limit = definition.rowLimits?.[size] ?? DEFAULT_ROW_LIMITS[size];
  if (!Number.isFinite(limit)) {
    return rows.map((row) => [...row]);
  }
  return rows.slice(0, limit).map((row) => [...row]);
}
