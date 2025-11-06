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
import { groupCompaniesByCountry, groupCompaniesByInitial, type CompanyRow } from '../shared';

// ============================================================================
// DATA SETUP
// ============================================================================

const COUNTRY_GROUPS = groupCompaniesByCountry();
const LETTER_GROUPS = groupCompaniesByInitial();

const COUNTRY_OPTIONS = [...COUNTRY_GROUPS.keys()].sort();
const LETTER_OPTIONS = [...LETTER_GROUPS.keys()].sort();

const REQUIRED_COLUMNS = ['id', 'company_name', 'country'];

// ============================================================================
// MESSAGES
// ============================================================================

export const MESSAGES = {
  descriptions: {
    'filter-by-country': 'Find all companies from {country}.',
    'filter-with-pattern': 'Find all companies whose name starts with {letter}.',
  },
  validation: {
    ...COMMON_MESSAGES.validation,
    noResultSet: 'Query returned no data.',
    missingColumns: 'Include the id, company_name, and country columns in your result.',
  },
  verification: {
    ...COMMON_MESSAGES.verification,
    correct: 'Perfect! Your query returned the correct rows.',
    wrongRowCount: 'Expected {expected} rows but got {actual}.',
    wrongRows: 'Returned rows do not match the expected result.',
  },
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface FilterRowsState {
  scenario: 'filter-by-country' | 'filter-with-pattern';
  country?: string;
  letter?: string;
  expectedRows: CompanyRow[];
}

export interface ExerciseState {
  id: FilterRowsState['scenario'];
  description: string;
  state: FilterRowsState;
}

interface ScenarioBuildResult {
  description: string;
  state: Omit<FilterRowsState, 'scenario'>;
}

interface ScenarioDefinition {
  id: FilterRowsState['scenario'];
  build(utils: Utils): ScenarioBuildResult;
}

const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'filter-by-country',
    build(utils) {
      const country = utils.selectRandomly(COUNTRY_OPTIONS as readonly string[]);
      const expectedRows = [...(COUNTRY_GROUPS.get(country) ?? [])];

      return {
        description: template(MESSAGES.descriptions['filter-by-country'], { country }),
        state: { country, expectedRows },
      };
    },
  },
  {
    id: 'filter-with-pattern',
    build(utils) {
      const letter = utils.selectRandomly(LETTER_OPTIONS as readonly string[]);
      const expectedRows = [...(LETTER_GROUPS.get(letter) ?? [])];

      return {
        description: template(MESSAGES.descriptions['filter-with-pattern'], { letter }),
        state: { letter, expectedRows },
      };
    },
  },
];

// ============================================================================
// GENERATOR
// ============================================================================

export function generate(utils: Utils): ExerciseState {
  const availableScenarios = SCENARIOS.filter((scenario) => {
    if (scenario.id === 'filter-by-country') {
      return COUNTRY_OPTIONS.length > 0;
    }
    if (scenario.id === 'filter-with-pattern') {
      return LETTER_OPTIONS.length > 0;
    }
    return true;
  });

  if (availableScenarios.length === 0) {
    throw new Error('No scenarios available for filter-rows exercise.');
  }

  const scenario = utils.selectRandomly(availableScenarios as readonly ScenarioDefinition[]);
  const result = scenario.build(utils);

  return {
    id: scenario.id,
    description: result.description,
    state: {
      scenario: scenario.id,
      ...result.state,
    },
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

export function validateOutput(
  _exercise: ExerciseState,
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

  const missing = REQUIRED_COLUMNS.filter((column) => !firstResult.columns.includes(column));
  if (missing.length > 0) {
    return {
      ok: false,
      message: MESSAGES.validation.missingColumns,
    };
  }

  return { ok: true };
}

// ============================================================================
// VERIFICATION
// ============================================================================

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
    ignoreColumnOrder: true,
    caseSensitive: false,
  });

  return {
    correct: comparison.match,
    message: comparison.match ? MESSAGES.verification.correct : comparison.feedback,
    details: comparison.details,
  };
}

// ============================================================================
// SOLUTION
// ============================================================================

export function getSolution(exercise: ExerciseState): string {
  const { state } = exercise;

  if (state.scenario === 'filter-by-country' && state.country) {
    return `SELECT * FROM companies WHERE country = '${state.country}'`;
  }

  if (state.scenario === 'filter-with-pattern' && state.letter) {
    return `SELECT * FROM companies WHERE company_name LIKE '${state.letter}%'`;
  }

  return 'SELECT * FROM companies WHERE country IS NOT NULL';
}
