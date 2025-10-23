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

// ============================================================================
// DATA SETUP
// ============================================================================

interface CompanyRow {
  id: number;
  company_name: string;
  country: string;
  founded_year: number | null;
  num_employees: number | null;
  industry: string | null;
}

const RAW_COMPANIES = parseSchemaRows(schemas.companies, 'companies');

const COMPANIES: CompanyRow[] = RAW_COMPANIES.map((row) => ({
  id: Number(row.id ?? 0),
  company_name: String(row.company_name ?? ''),
  country: String(row.country ?? ''),
  founded_year: typeof row.founded_year === 'number' ? row.founded_year : null,
  num_employees: typeof row.num_employees === 'number' ? row.num_employees : null,
  industry: row.industry === null || row.industry === undefined ? null : String(row.industry),
}));

const COUNTRY_GROUPS = new Map<string, CompanyRow[]>();
const LETTER_GROUPS = new Map<string, CompanyRow[]>();

COMPANIES.forEach((company) => {
  if (company.country) {
    const list = COUNTRY_GROUPS.get(company.country) ?? [];
    list.push(company);
    COUNTRY_GROUPS.set(company.country, list);
  }

  const letter = company.company_name.charAt(0).toUpperCase();
  if (letter && /[A-Z]/.test(letter)) {
    const list = LETTER_GROUPS.get(letter) ?? [];
    list.push(company);
    LETTER_GROUPS.set(letter, list);
  }
});

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
): VerificationResult {
  const firstResult = output?.[0];

  if (!firstResult || !Array.isArray(firstResult.values)) {
    return {
      correct: false,
      message: MESSAGES.validation.noResultSet,
    };
  }

  const { state } = exercise;
  const expectedIds = state.expectedRows.map((row) => row.id).sort((a, b) => a - b);

  const idIndex = firstResult.columns.indexOf('id');
  if (idIndex === -1) {
    return {
      correct: false,
      message: MESSAGES.validation.missingColumns,
    };
  }

  const actualIds = firstResult.values
    .map((row) => Number(row?.[idIndex]))
    .filter((id) => !Number.isNaN(id))
    .sort((a, b) => a - b);

  if (actualIds.length !== expectedIds.length) {
    return {
      correct: false,
      message: template(MESSAGES.verification.wrongRowCount, {
        expected: expectedIds.length,
        actual: actualIds.length,
      }),
    };
  }

  const matches = expectedIds.every((expectedId, index) => expectedId === actualIds[index]);

  return {
    correct: matches,
    message: matches ? MESSAGES.verification.correct : MESSAGES.verification.wrongRows,
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
