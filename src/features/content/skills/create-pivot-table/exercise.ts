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
  num_employees: number | null;
  industry: string | null;
}

type ScenarioId = 'pivot-country-counts' | 'pivot-employee-sum';

interface ScenarioDefinition {
  id: ScenarioId;
  description: string;
  columns: string[];
  compute(rows: CompanyRow[]): unknown[][];
}

export interface CreatePivotTableState {
  scenario: ScenarioId;
  columns: string[];
  expectedRows: unknown[][];
}

export interface ExerciseState {
  id: ScenarioId;
  description: string;
  state: CreatePivotTableState;
}

const RAW_COMPANIES = parseSchemaRows(schemas.companies, 'companies');

const COMPANIES: CompanyRow[] = RAW_COMPANIES.map((row) => ({
  id: Number(row.id ?? 0),
  company_name: stringify(row.company_name),
  country: stringify(row.country),
  num_employees: typeof row.num_employees === 'number' ? row.num_employees : null,
  industry: row.industry === null || row.industry === undefined ? null : stringify(row.industry),
}));

export const MESSAGES = {
  descriptions: {
    'pivot-country-counts': 'Build a pivot that counts companies per industry for the Netherlands and the United States.',
    'pivot-employee-sum': 'Pivot the total number of employees per industry comparing the Netherlands and United Kingdom.',
  },
  validation: {
    ...COMMON_MESSAGES.validation,
    noResultSet: 'Query returned no data.',
    wrongColumns: 'Return the requested pivot columns with the correct aliases.',
  },
  verification: {
    ...COMMON_MESSAGES.verification,
    correct: 'Pivot looks perfect!',
    wrongRowCount: 'Expected {expected} rows but got {actual}.',
    wrongValues: 'Some pivot values do not match the expected totals.',
  },
} as const;

const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'pivot-country-counts',
    description: MESSAGES.descriptions['pivot-country-counts'],
    columns: ['industry', 'nl_companies', 'us_companies'],
    compute(rows) {
      const grouped = new Map<string, { nl: number; us: number }>();
      rows.forEach((row) => {
        const key = row.industry ?? '';
        const entry = grouped.get(key) ?? { nl: 0, us: 0 };
        if (row.country === 'Netherlands') entry.nl += 1;
        if (row.country === 'United States') entry.us += 1;
        grouped.set(key, entry);
      });
      return [...grouped.entries()]
        .map(([industry, counts]) => [industry || null, counts.nl, counts.us])
        .sort(compareRows);
    },
  },
  {
    id: 'pivot-employee-sum',
    description: MESSAGES.descriptions['pivot-employee-sum'],
    columns: ['industry', 'nl_employees', 'uk_employees'],
    compute(rows) {
      const grouped = new Map<string, { nl: number; uk: number }>();
      rows.forEach((row) => {
        if (row.num_employees === null) return;
        const key = row.industry ?? '';
        const entry = grouped.get(key) ?? { nl: 0, uk: 0 };
        if (row.country === 'Netherlands') entry.nl += row.num_employees;
        if (row.country === 'United Kingdom') entry.uk += row.num_employees;
        grouped.set(key, entry);
      });
      return [...grouped.entries()]
        .map(([industry, totals]) => [industry || null, totals.nl, totals.uk])
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
    case 'pivot-country-counts':
      return "SELECT industry, SUM(CASE WHEN country = 'Netherlands' THEN 1 ELSE 0 END) AS nl_companies, SUM(CASE WHEN country = 'United States' THEN 1 ELSE 0 END) AS us_companies FROM companies GROUP BY industry";
    case 'pivot-employee-sum':
      return "SELECT industry, SUM(CASE WHEN country = 'Netherlands' THEN num_employees ELSE 0 END) AS nl_employees, SUM(CASE WHEN country = 'United Kingdom' THEN num_employees ELSE 0 END) AS uk_employees FROM companies GROUP BY industry";
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
