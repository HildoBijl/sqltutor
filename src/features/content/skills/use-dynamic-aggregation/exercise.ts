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
import { compareQueryResults } from '@/features/learning/exerciseEngine/resultComparison';

interface CompanyRow {
  id: number;
  company_name: string;
  country: string;
  founded_year: number | null;
  num_employees: number | null;
  industry: string | null;
}

type ScenarioId = 'dynamic-industry' | 'dynamic-country' | 'dynamic-founded';

interface ScenarioDefinition {
  id: ScenarioId;
  description: string;
  columns: string[];
  compute(rows: CompanyRow[]): unknown[][];
}

export interface UseDynamicAggregationState {
  scenario: ScenarioId;
  columns: string[];
  expectedRows: unknown[][];
}

export interface ExerciseState {
  id: ScenarioId;
  description: string;
  state: UseDynamicAggregationState;
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
    'dynamic-industry': 'Produce company counts grouped dynamically by industry.',
    'dynamic-country': 'Produce company counts grouped dynamically by country.',
    'dynamic-founded': 'Aggregate the average employee count grouped by founded year.',
  },
  validation: {
    ...COMMON_MESSAGES.validation,
    noResultSet: 'Query returned no data.',
    wrongColumns: 'Return the grouping column together with the requested aggregate.',
  },
  verification: {
    ...COMMON_MESSAGES.verification,
    correct: 'Dynamic grouping looks good!',
    wrongRowCount: 'Expected {expected} groups but got {actual}.',
    wrongValues: 'Grouped values do not match expectations.',
  },
} as const;

const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'dynamic-industry',
    description: MESSAGES.descriptions['dynamic-industry'],
    columns: ['industry', 'company_count'],
    compute(rows) {
      const counts = new Map<string, number>();
      rows.forEach((company) => {
        const key = company.industry ?? '';
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
      return [...counts.entries()]
        .map(([industry, count]) => [industry || null, count])
        .sort(compareRows);
    },
  },
  {
    id: 'dynamic-country',
    description: MESSAGES.descriptions['dynamic-country'],
    columns: ['country', 'company_count'],
    compute(rows) {
      const counts = new Map<string, number>();
      rows.forEach((company) => {
        counts.set(company.country, (counts.get(company.country) ?? 0) + 1);
      });
      return [...counts.entries()]
        .map(([country, count]) => [country, count])
        .sort(compareRows);
    },
  },
  {
    id: 'dynamic-founded',
    description: MESSAGES.descriptions['dynamic-founded'],
    columns: ['founded_year', 'avg_employees'],
    compute(rows) {
      const aggregates = new Map<number, { sum: number; count: number }>();
      rows.forEach((company) => {
        if (company.founded_year === null || company.num_employees === null) return;
        const current = aggregates.get(company.founded_year) ?? { sum: 0, count: 0 };
        current.sum += company.num_employees;
        current.count += 1;
        aggregates.set(company.founded_year, current);
      });
      return [...aggregates.entries()]
        .map(([year, { sum, count }]) => [year, count === 0 ? null : sum / count])
        .sort(compareRows);
    },
  },
];

export function generate(utils: Utils): ExerciseState {
  const scenario = utils.selectRandomly(SCENARIOS as readonly ScenarioDefinition[]);
  const expectedRows = scenario.compute(COMPANIES);

  return {
    id: scenario.id,
    description: scenario.description,
    state: {
      scenario: scenario.id,
      columns: scenario.columns,
      expectedRows,
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
  database: any,
): VerificationResult {
  const actualResult = output?.[0];

  if (!actualResult || !Array.isArray(actualResult.columns) || !Array.isArray(actualResult.values)) {
    return {
      correct: false,
      message: MESSAGES.validation.noResultSet,
    };
  }

  if (!database || typeof database.exec !== 'function') {
    return {
      correct: false,
      message: 'Unable to verify results. Please try again.',
    };
  }

  const solutionQuery = getSolution(exercise);

  let expectedResult: QueryResult | undefined;
  try {
    const result = database.exec(solutionQuery);
    expectedResult = result?.[0];
  } catch (error) {
    console.error('Failed to execute solution query:', error);
    return {
      correct: false,
      message: 'Unable to verify results. Please try again.',
    };
  }

  const comparison = compareQueryResults(expectedResult, actualResult, {
    ignoreRowOrder: true,
    ignoreColumnOrder: false,
    caseSensitive: false,
  });

  return {
    correct: comparison.match,
    message: comparison.match ? MESSAGES.verification.correct : comparison.feedback,
    details: comparison.details,
  };
}

export function getSolution(exercise: ExerciseState): string {
  switch (exercise.state.scenario) {
    case 'dynamic-industry':
      return 'SELECT industry, COUNT(*) AS company_count FROM companies GROUP BY industry';
    case 'dynamic-country':
      return 'SELECT country, COUNT(*) AS company_count FROM companies GROUP BY country';
    case 'dynamic-founded':
      return 'SELECT founded_year, AVG(num_employees) AS avg_employees FROM companies GROUP BY founded_year';
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
