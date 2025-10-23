import { COMMON_MESSAGES } from '../../messages';
import { template } from '../../utils';
import type {
  ExecutionResult,
  QueryResult,
  Utils,
  ValidationResult,
  VerificationResult,
} from '../../types';
import { schemas } from '../../../database/schemas';
import { parseSchemaRows } from '@/features/learning/exerciseEngine/schemaHelpers';

interface CompanyRow {
  id: number;
  company_name: string;
  country: string;
  founded_year: number | null;
  num_employees: number | null;
  industry: string | null;
}

type ScenarioId = 'multi-criterion-europe' | 'multi-criterion-tech-regions' | 'multi-criterion-older';

interface ScenarioDefinition {
  id: ScenarioId;
  description: string;
  columns: string[];
  expectedRows: unknown[][];
}

export interface WriteMultiCriterionState {
  scenario: ScenarioId;
  columns: string[];
  expectedRows: unknown[][];
}

export interface ExerciseState {
  id: ScenarioId;
  description: string;
  state: WriteMultiCriterionState;
}

const RAW_COMPANIES = parseSchemaRows(schemas.companies, 'companies');

const COMPANIES: CompanyRow[] = RAW_COMPANIES.map((row) => ({
  id: Number(row.id ?? 0),
  company_name: stringify(row.company_name),
  country: stringify(row.country),
  founded_year: typeof row.founded_year === 'number' ? row.founded_year : null,
  num_employees: typeof row.num_employees === 'number' ? row.num_employees : null,
  industry: row.industry === null || row.industry === undefined ? null : stringify(row.industry),
}));

const ALL_COLUMNS = ['id', 'company_name', 'country', 'founded_year', 'num_employees', 'industry'];

export const MESSAGES = {
  descriptions: {
    'multi-criterion-europe': 'Find consulting companies in the Netherlands with more than 50000 employees.',
    'multi-criterion-tech-regions': 'List technology companies from the Netherlands or United States that were founded after 1995.',
    'multi-criterion-older': 'Show companies founded before 1980 that are not based in the United States.',
  },
  validation: {
    ...COMMON_MESSAGES.validation,
    noResultSet: 'Query returned no data.',
    wrongColumns: 'Return the requested columns in the correct order.',
  },
  verification: {
    ...COMMON_MESSAGES.verification,
    correct: 'Multi-criteria filter is spot on!',
    wrongRowCount: 'Expected {expected} rows but got {actual}.',
    wrongValues: 'Some returned rows do not satisfy the filters.',
  },
} as const;

const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'multi-criterion-europe',
    description: MESSAGES.descriptions['multi-criterion-europe'],
    columns: ALL_COLUMNS,
    expectedRows: COMPANIES.filter(
      (company) =>
        company.country === 'Netherlands' &&
        company.industry === 'Consulting' &&
        (company.num_employees ?? 0) > 50000,
    )
      .map((company) => [
        company.id,
        company.company_name,
        company.country,
        company.founded_year,
        company.num_employees,
        company.industry,
      ])
      .sort(compareRows),
  },
  {
    id: 'multi-criterion-tech-regions',
    description: MESSAGES.descriptions['multi-criterion-tech-regions'],
    columns: ALL_COLUMNS,
    expectedRows: COMPANIES.filter(
      (company) =>
        company.industry === 'Technology' &&
        (company.country === 'Netherlands' || company.country === 'United States') &&
        (company.founded_year ?? 0) > 1995,
    )
      .map((company) => [
        company.id,
        company.company_name,
        company.country,
        company.founded_year,
        company.num_employees,
        company.industry,
      ])
      .sort(compareRows),
  },
  {
    id: 'multi-criterion-older',
    description: MESSAGES.descriptions['multi-criterion-older'],
    columns: ['company_name', 'country'],
    expectedRows: COMPANIES.filter(
      (company) =>
        (company.founded_year ?? Number.MAX_SAFE_INTEGER) < 1980 &&
        company.country !== 'United States',
    )
      .map((company) => [company.company_name, company.country])
      .sort(compareRows),
  },
];

export function generate(utils: Utils): ExerciseState {
  const scenario = utils.selectRandomly(SCENARIOS as readonly ScenarioDefinition[]);

  return {
    id: scenario.id,
    description: scenario.description,
    state: {
      scenario: scenario.id,
      columns: scenario.columns,
      expectedRows: scenario.expectedRows,
    },
  };
}

export function validateOutput(
  exercise: ExerciseState,
  result: ExecutionResult<QueryResult[]>,
): ValidationResult {
  if (!result.success) {
    return {
      ok: false,
      message: template(MESSAGES.validation.syntaxError, {
        error: result.error?.message || 'Unknown error',
      }),
    };
  }

  const firstResult = result.output?.[0];
  if (!firstResult || !Array.isArray(firstResult.columns) || !Array.isArray(firstResult.values)) {
    return {
      ok: false,
      message: MESSAGES.validation.noResultSet,
    };
  }

  if (firstResult.columns.length !== exercise.state.columns.length) {
    return {
      ok: false,
      message: MESSAGES.validation.wrongColumns,
    };
  }

  for (let index = 0; index < exercise.state.columns.length; index += 1) {
    if (firstResult.columns[index] !== exercise.state.columns[index]) {
      return {
        ok: false,
        message: MESSAGES.validation.wrongColumns,
      };
    }
  }

  return { ok: true };
}

export function verifyOutput(
  exercise: ExerciseState,
  output: QueryResult[] | undefined,
): VerificationResult {
  const firstResult = output?.[0];

  if (!firstResult || !Array.isArray(firstResult.values)) {
    return {
      correct: false,
      message: MESSAGES.validation.noResultSet,
    };
  }

  const normalizedActual = firstResult.values.map((row) =>
    JSON.stringify(row.slice(0, exercise.state.columns.length).map(normalizeValue)),
  );
  const normalizedExpected = exercise.state.expectedRows.map((row) =>
    JSON.stringify(row.map(normalizeValue)),
  );

  normalizedActual.sort();
  normalizedExpected.sort();

  if (normalizedActual.length !== normalizedExpected.length) {
    return {
      correct: false,
      message: template(MESSAGES.verification.wrongRowCount, {
        expected: normalizedExpected.length,
        actual: normalizedActual.length,
      }),
    };
  }

  const matches = normalizedActual.every((value, index) => value === normalizedExpected[index]);

  return {
    correct: matches,
    message: matches ? MESSAGES.verification.correct : MESSAGES.verification.wrongValues,
  };
}

export function getSolution(exercise: ExerciseState): string {
  switch (exercise.state.scenario) {
    case 'multi-criterion-europe':
      return "SELECT * FROM companies WHERE country = 'Netherlands' AND industry = 'Consulting' AND num_employees > 50000";
    case 'multi-criterion-tech-regions':
      return "SELECT * FROM companies WHERE industry = 'Technology' AND (country = 'Netherlands' OR country = 'United States') AND founded_year > 1995";
    case 'multi-criterion-older':
      return "SELECT company_name, country FROM companies WHERE founded_year < 1980 AND country <> 'United States'";
    default:
      return "SELECT company_name FROM companies WHERE country = 'Netherlands'";
  }
}

function stringify(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

function compareRows(a: unknown[], b: unknown[]): number {
  for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
    const left = a[index] === null ? '' : String(a[index]);
    const right = b[index] === null ? '' : String(b[index]);
    const diff = left.localeCompare(right);
    if (diff !== 0) return diff;
  }
  return a.length - b.length;
}

function normalizeValue(value: unknown): unknown {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.round(value * 1000) / 1000 : null;
  }
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return value;
}
