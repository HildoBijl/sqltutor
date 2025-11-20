import { COMMON_MESSAGES } from '../../messages';
import { template } from '../../utils';
import type {
  ExecutionResult,
  QueryResult,
  Utils,
  ValidationResult,
  VerificationResult,
} from '../../types';
import { compareQueryResults } from '@/features/learning/exerciseEngine/resultComparison';

import { COMPANIES, compareRows } from '../shared';

type ScenarioId = 'single-criterion-country' | 'single-criterion-founded' | 'single-criterion-industry';

interface ScenarioDefinition {
  id: ScenarioId;
  columns: string[];
  expectedRows: unknown[][];
}

export interface WriteSingleCriterionState {
  scenario: ScenarioId;
  columns: string[];
  expectedRows: unknown[][];
}

export interface ExerciseState {
  id: ScenarioId;
  state: WriteSingleCriterionState;
}

const ALL_COLUMNS = ['id', 'company_name', 'country', 'founded_year', 'num_employees', 'industry'];

export const MESSAGES = {
  descriptions: {
    'single-criterion-country': 'Show company name and country for organisations based in the Netherlands.',
    'single-criterion-founded': 'Retrieve all companies founded before 1980.',
    'single-criterion-industry': 'List technology companies with their employee counts.',
  },
  validation: {
    ...COMMON_MESSAGES.validation,
    noResultSet: 'Query returned no data.',
    wrongColumns: 'Return exactly the requested columns for this exercise.',
  },
  verification: {
    ...COMMON_MESSAGES.verification,
    correct: 'Filter looks good!',
    wrongRowCount: 'Expected {expected} rows but got {actual}.',
    wrongValues: 'Some returned rows do not match the filter criteria.',
  },
} as const;

const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'single-criterion-country',
    columns: ['company_name', 'country'],
    expectedRows: COMPANIES.filter((company) => company.country === 'Netherlands')
      .map((company) => [company.company_name, company.country])
      .sort(compareRows),
  },
  {
    id: 'single-criterion-founded',
    columns: ALL_COLUMNS,
    expectedRows: COMPANIES.filter((company) => (company.founded_year ?? Number.MAX_SAFE_INTEGER) < 1980)
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
    id: 'single-criterion-industry',
    columns: ['company_name', 'num_employees'],
    expectedRows: COMPANIES.filter((company) => company.industry === 'Technology')
      .map((company) => [company.company_name, company.num_employees])
      .sort(compareRows),
  },
];

export function generate(utils: Utils): ExerciseState {
  const scenario = utils.selectRandomly(SCENARIOS as readonly ScenarioDefinition[]);

  return {
    id: scenario.id,
    state: {
      scenario: scenario.id,
      columns: scenario.columns,
      expectedRows: scenario.expectedRows,
    },
  };
}

export function getDescription(exercise: ExerciseState): string {
  return MESSAGES.descriptions[exercise.state.scenario];
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
    case 'single-criterion-country':
      return "SELECT company_name, country FROM companies WHERE country = 'Netherlands'";
    case 'single-criterion-founded':
      return 'SELECT * FROM companies WHERE founded_year < 1980';
    case 'single-criterion-industry':
      return "SELECT company_name, num_employees FROM companies WHERE industry = 'Technology'";
    default:
      return 'SELECT company_name FROM companies';
  }
}
