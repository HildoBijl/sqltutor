import type { SchemaKey } from '@/features/database/schemas';
import { schemas } from '@/features/database/schemas';
import { parseSchemaRows } from '@/features/learning/exerciseEngine/schemaHelpers';

import { booleanOrNull, numberOrNull, stringify, stringOrNull } from './valueHelpers';
import type { CompanyRow } from './companies';

export interface PositionRow {
  id: number;
  company_id: number;
  company_name: string;
  country: string;
  city: string;
  position: string;
  department: string | null;
  salary: number | null;
  remote_allowed: boolean | null;
}

function mapPositionRow(raw: Record<string, unknown>): PositionRow {
  return {
    id: typeof raw.id === 'number' ? raw.id : Number(raw.id ?? 0),
    company_id: typeof raw.company_id === 'number' ? raw.company_id : Number(raw.company_id ?? 0),
    company_name: stringify(raw.company_name),
    country: stringify(raw.country),
    city: stringify(raw.city),
    position: stringify(raw.position),
    department: stringOrNull(raw.department),
    salary: numberOrNull(raw.salary),
    remote_allowed: booleanOrNull(raw.remote_allowed),
  };
}

export function parsePositions(schemaSource: string = schemas.full): PositionRow[] {
  return parseSchemaRows(schemaSource, 'positions').map(mapPositionRow);
}

export function loadPositions(schemaKey: SchemaKey): PositionRow[] {
  return parsePositions(schemas[schemaKey]);
}

export const POSITIONS: readonly PositionRow[] = parsePositions();

export function createCompanyLookup(rows: readonly CompanyRow[]): Map<number, CompanyRow> {
  return new Map(rows.map((company) => [company.id, company]));
}
