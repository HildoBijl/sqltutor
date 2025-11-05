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

type ScenarioId = 'processed-columns-employees' | 'processed-columns-age';

interface ScenarioDefinition {
  id: ScenarioId;
  description: string;
  buildState(): CreateProcessedColumnsState;
}

type ExpectedValueStore = Record<string, unknown> | Map<string, unknown>;

export interface CreateProcessedColumnsState {
  scenario: ScenarioId;
  columns: [string, string];
  expectedValues: ExpectedValueStore;
}

export interface ExerciseState {
  id: ScenarioId;
  description: string;
  state: CreateProcessedColumnsState;
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
    'processed-columns-employees': 'Show company name and employees expressed in thousands (round down to one decimal place).',
    'processed-columns-age': 'List company name together with its age in years, assuming the current year is 2024.',
  },
  validation: {
    ...COMMON_MESSAGES.validation,
    noResultSet: 'Query returned no data.',
    wrongStructure: 'Return exactly the requested columns in order.',
  },
  verification: {
    ...COMMON_MESSAGES.verification,
    correct: 'Perfect transformation!',
    wrongRowCount: 'Expected {expected} rows but got {actual}.',
    wrongValues: 'Some computed values are incorrect.',
  },
} as const;

const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'processed-columns-employees',
    description: MESSAGES.descriptions['processed-columns-employees'],
    buildState(): CreateProcessedColumnsState {
      const expectedValues: Record<string, number | null> = {};

      COMPANIES.forEach((company) => {
        const value = company.num_employees === null
          ? null
          : Math.round(((company.num_employees ?? 0) / 1000) * 10) / 10;
        expectedValues[company.company_name] = value;
      });

      return {
        scenario: 'processed-columns-employees',
        columns: ['company_name', 'employees_in_thousands'],
        expectedValues,
      };
    },
  },
  {
    id: 'processed-columns-age',
    description: MESSAGES.descriptions['processed-columns-age'],
    buildState(): CreateProcessedColumnsState {
      const expectedValues: Record<string, number | null> = {};

      COMPANIES.forEach((company) => {
        const value = company.founded_year === null ? null : 2024 - company.founded_year;
        expectedValues[company.company_name] = value;
      });

      return {
        scenario: 'processed-columns-age',
        columns: ['company_name', 'age'],
        expectedValues,
      };
    },
  },
];

export function generate(utils: Utils): ExerciseState {
  const scenario = utils.selectRandomly(SCENARIOS as readonly ScenarioDefinition[]);
  const state = scenario.buildState();

  return {
    id: scenario.id,
    description: scenario.description,
    state,
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
      message: MESSAGES.validation.wrongStructure,
    };
  }

  for (let index = 0; index < exercise.state.columns.length; index += 1) {
    if (firstResult.columns[index] !== exercise.state.columns[index]) {
      return {
        ok: false,
        message: MESSAGES.validation.wrongStructure,
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
    case 'processed-columns-employees':
      return 'SELECT company_name, ROUND(num_employees / 1000.0, 1) AS employees_in_thousands FROM companies';
    case 'processed-columns-age':
      return 'SELECT company_name, 2024 - founded_year AS age FROM companies';
    default:
      return 'SELECT company_name FROM companies';
  }
}

function stringify(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

