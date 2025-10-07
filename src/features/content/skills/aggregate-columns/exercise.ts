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
  | 'aggregate-count-country'
  | 'aggregate-average-employees'
  | 'aggregate-max-founded';

interface ScenarioDefinition {
  id: ScenarioId;
  description: string;
  columns: string[];
  compute(rows: CompanyRow[]): unknown[][];
}

export interface AggregateColumnsState {
  scenario: ScenarioId;
  columns: string[];
  expectedRows: unknown[][];
}

export interface ExerciseState {
  id: ScenarioId;
  description: string;
  state: AggregateColumnsState;
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
    'aggregate-count-country': 'Count how many companies exist in each country.',
    'aggregate-average-employees': 'Calculate the average number of employees per industry.',
    'aggregate-max-founded': 'Find the most recent founding year per country.',
  },
  validation: {
    ...COMMON_MESSAGES.validation,
    noResultSet: 'Query returned no data.',
    wrongColumns: 'Return exactly the expected columns with the correct aliases.',
  },
  verification: {
    ...COMMON_MESSAGES.verification,
    correct: 'Perfect aggregation!',
    wrongRowCount: 'Expected {expected} rows but got {actual}.',
    wrongValues: 'Some grouped values are incorrect.',
  },
} as const;

const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'aggregate-count-country',
    description: MESSAGES.descriptions['aggregate-count-country'],
    columns: ['country', 'company_count'],
    compute(rows) {
      const counts = new Map<string, number>();
      rows.forEach((company) => {
        const key = company.country;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
      return [...counts.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([country, count]) => [country, count]);
    },
  },
  {
    id: 'aggregate-average-employees',
    description: MESSAGES.descriptions['aggregate-average-employees'],
    columns: ['industry', 'avg_employees'],
    compute(rows) {
      const sums = new Map<string, { sum: number; count: number }>();
      rows.forEach((company) => {
        const key = company.industry ?? '';
        const current = sums.get(key) ?? { sum: 0, count: 0 };
        if (company.num_employees !== null) {
          current.sum += company.num_employees;
          current.count += 1;
        }
        sums.set(key, current);
      });
      return [...sums.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([industry, { sum, count }]) => [industry || null, count === 0 ? null : sum / count]);
    },
  },
  {
    id: 'aggregate-max-founded',
    description: MESSAGES.descriptions['aggregate-max-founded'],
    columns: ['country', 'latest_founded_year'],
    compute(rows) {
      const latest = new Map<string, number | null>();
      rows.forEach((company) => {
        const key = company.country;
        const current = latest.get(key);
        if (company.founded_year === null) return;
        if (current === undefined || current === null || company.founded_year > current) {
          latest.set(key, company.founded_year);
        }
      });
      return [...latest.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([country, year]) => [country, year]);
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
    case 'aggregate-count-country':
      return 'SELECT country, COUNT(*) AS company_count FROM companies GROUP BY country';
    case 'aggregate-average-employees':
      return 'SELECT industry, AVG(num_employees) AS avg_employees FROM companies GROUP BY industry';
    case 'aggregate-max-founded':
      return 'SELECT country, MAX(founded_year) AS latest_founded_year FROM companies GROUP BY country';
    default:
      return 'SELECT country FROM companies GROUP BY country';
  }
}

function stringify(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
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
