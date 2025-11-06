import type { SchemaKey } from '@/features/database/schemas';
import { schemas } from '@/features/database/schemas';
import { parseSchemaRows } from '@/features/learning/exerciseEngine/schemaHelpers';

import { numberOrNull, stringify, stringOrNull } from './valueHelpers';

export interface CompanyRow {
  id: number;
  company_name: string;
  country: string;
  founded_year: number | null;
  num_employees: number | null;
  industry: string | null;
}

function mapCompanyRow(raw: Record<string, unknown>): CompanyRow {
  return {
    id: typeof raw.id === 'number' ? raw.id : Number(raw.id ?? 0),
    company_name: stringify(raw.company_name),
    country: stringify(raw.country),
    founded_year: numberOrNull(raw.founded_year),
    num_employees: numberOrNull(raw.num_employees),
    industry: stringOrNull(raw.industry),
  };
}

export function parseCompanies(schemaSource: string = schemas.companies): CompanyRow[] {
  return parseSchemaRows(schemaSource, 'companies').map(mapCompanyRow);
}

export function loadCompanies(schemaKey: SchemaKey): CompanyRow[] {
  return parseCompanies(schemas[schemaKey]);
}

export const COMPANIES: readonly CompanyRow[] = parseCompanies();

export function groupCompaniesByCountry(
  rows: readonly CompanyRow[] = COMPANIES,
): Map<string, CompanyRow[]> {
  const groups = new Map<string, CompanyRow[]>();
  rows.forEach((company) => {
    const key = company.country;
    if (!key) return;
    const list = groups.get(key) ?? [];
    list.push(company);
    groups.set(key, list);
  });
  return groups;
}

export function groupCompaniesByInitial(
  rows: readonly CompanyRow[] = COMPANIES,
): Map<string, CompanyRow[]> {
  const groups = new Map<string, CompanyRow[]>();
  rows.forEach((company) => {
    const letter = company.company_name.charAt(0).toUpperCase();
    if (!letter || !/[A-Z]/.test(letter)) {
      return;
    }
    const list = groups.get(letter) ?? [];
    list.push(company);
    groups.set(letter, list);
  });
  return groups;
}
