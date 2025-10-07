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

type ScenarioId =
  | 'filtered-aggregation-avg'
  | 'filtered-aggregation-country'
  | 'filtered-aggregation-total';

interface ScenarioDefinition {
  id: ScenarioId;
  description: string;
  columns: string[];
  expectedRows: unknown[][];
}

export interface UseFilteredAggregationState {
  scenario: ScenarioId;
  columns: string[];
  expectedRows: unknown[][];
}

export interface ExerciseState {
  id: ScenarioId;
  description: string;
  state: UseFilteredAggregationState;
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

export const MESSAGES = {
  descriptions: {
    'filtered-aggregation-avg': 'Find industries where the average number of employees exceeds 120000.',
    'filtered-aggregation-country': 'List countries with at least two technology companies.',
    'filtered-aggregation-total': 'Return industries whose total headcount surpasses 300000 employees.',
  },
  validation: {
    ...COMMON_MESSAGES.validation,
    noResultSet: 'Query returned no data.',
    wrongColumns: 'Return exactly the requested columns with the correct aliases.',
  },
  verification: {
    ...COMMON_MESSAGES.verification,
    correct: 'Great filtering!',
    wrongRowCount: 'Expected {expected} groups but got {actual}.',
    wrongValues: 'Some aggregates do not match the expected values.',
  },
} as const;

const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'filtered-aggregation-avg',
    description: MESSAGES.descriptions['filtered-aggregation-avg'],
    columns: ['industry', 'avg_employees'],
    expectedRows: (() => {
      const aggregates = new Map<string, { sum: number; count: number }>();
      COMPANIES.forEach((company) => {
        const key = company.industry ?? '';
        const stat = aggregates.get(key) ?? { sum: 0, count: 0 };
        if (company.num_employees !== null) {
          stat.sum += company.num_employees;
          stat.count += 1;
        }
        aggregates.set(key, stat);
      });
      return [...aggregates.entries()]
        .map(([industry, { sum, count }]) => {
          const average = count === 0 ? null : sum / count;
          return { industry: industry || null, average };
        })
        .filter((group) => (group.average ?? 0) > 120000)
        .map((group) => [group.industry, group.average])
        .sort(compareRows);
    })(),
  },
  {
    id: 'filtered-aggregation-country',
    description: MESSAGES.descriptions['filtered-aggregation-country'],
    columns: ['country', 'tech_companies'],
    expectedRows: (() => {
      const counts = new Map<string, number>();
      COMPANIES.filter((company) => company.industry === 'Technology').forEach((company) => {
        counts.set(company.country, (counts.get(company.country) ?? 0) + 1);
      });
      return [...counts.entries()]
        .filter(([, count]) => count >= 2)
        .map(([country, count]) => [country, count])
        .sort(compareRows);
    })(),
  },
  {
    id: 'filtered-aggregation-total',
    description: MESSAGES.descriptions['filtered-aggregation-total'],
    columns: ['industry', 'total_employees'],
    expectedRows: (() => {
      const totals = new Map<string, number>();
      COMPANIES.forEach((company) => {
        if (company.num_employees === null) return;
        const key = company.industry ?? '';
        totals.set(key, (totals.get(key) ?? 0) + company.num_employees);
      });
      return [...totals.entries()]
        .filter(([, total]) => total > 300000)
        .map(([industry, total]) => [industry || null, total])
        .sort(compareRows);
    })(),
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
    JSON.stringify(row.slice(0, exercise.state.columns.length).map(normalizeNumeric)),
  );
  const normalizedExpected = exercise.state.expectedRows.map((row) =>
    JSON.stringify(row.map(normalizeNumeric)),
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
    case 'filtered-aggregation-avg':
      return 'SELECT industry, AVG(num_employees) AS avg_employees FROM companies GROUP BY industry HAVING AVG(num_employees) > 120000';
    case 'filtered-aggregation-country':
      return "SELECT country, COUNT(*) AS tech_companies FROM companies WHERE industry = 'Technology' GROUP BY country HAVING COUNT(*) >= 2";
    case 'filtered-aggregation-total':
      return 'SELECT industry, SUM(num_employees) AS total_employees FROM companies GROUP BY industry HAVING SUM(num_employees) > 300000';
    default:
      return 'SELECT industry FROM companies GROUP BY industry';
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

function normalizeNumeric(value: unknown): unknown {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.round(value * 1000) / 1000 : null;
  }
  if (value === null || value === undefined) {
    return null;
  }
  return value;
}
