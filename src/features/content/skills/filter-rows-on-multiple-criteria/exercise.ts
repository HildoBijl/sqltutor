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

type ScenarioId = 'multi-filter-us-large' | 'multi-filter-netherlands-tech' | 'multi-filter-uk-or-us';

interface ScenarioDefinition {
  id: ScenarioId;
  description: string;
  predicate: (company: CompanyRow) => boolean;
}

export interface FilterRowsMultiState {
  scenario: ScenarioId;
  expectedIds: number[];
}

export interface ExerciseState {
  id: ScenarioId;
  description: string;
  state: FilterRowsMultiState;
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

const REQUIRED_COLUMNS = ['id', 'company_name', 'country', 'founded_year', 'num_employees', 'industry'];

export const MESSAGES = {
  descriptions: {
    'multi-filter-us-large': 'List companies from the United States with more than 100000 employees.',
    'multi-filter-netherlands-tech': 'Find Dutch companies in the Technology industry.',
    'multi-filter-uk-or-us': 'Return companies based in the United Kingdom or the United States that were founded after 2000.',
  },
  validation: {
    ...COMMON_MESSAGES.validation,
    noResultSet: 'Query returned no data.',
    missingColumns: 'Include all columns from the companies table (use SELECT *).',
  },
  verification: {
    ...COMMON_MESSAGES.verification,
    correct: 'Perfect! Your filter is spot on.',
    wrongRowCount: 'Expected {expected} rows but got {actual}.',
    wrongRows: 'Some returned rows do not meet the required conditions.',
  },
} as const;

const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'multi-filter-us-large',
    description: MESSAGES.descriptions['multi-filter-us-large'],
    predicate: (company) => company.country === 'United States' && (company.num_employees ?? 0) > 100000,
  },
  {
    id: 'multi-filter-netherlands-tech',
    description: MESSAGES.descriptions['multi-filter-netherlands-tech'],
    predicate: (company) => company.country === 'Netherlands' && company.industry === 'Technology',
  },
  {
    id: 'multi-filter-uk-or-us',
    description: MESSAGES.descriptions['multi-filter-uk-or-us'],
    predicate: (company) =>
      (company.country === 'United Kingdom' || company.country === 'United States') &&
      (company.founded_year ?? 0) > 2000,
  },
];

export function generate(utils: Utils): ExerciseState {
  const scenario = utils.selectRandomly(SCENARIOS as readonly ScenarioDefinition[]);
  const expectedIds = COMPANIES.filter(scenario.predicate).map((company) => company.id);

  return {
    id: scenario.id,
    description: scenario.description,
    state: {
      scenario: scenario.id,
      expectedIds,
    },
  };
}

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

  const hasAllColumns = REQUIRED_COLUMNS.every((column) => firstResult.columns.includes(column));
  if (!hasAllColumns) {
    return {
      ok: false,
      message: MESSAGES.validation.missingColumns,
    };
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

  const idIndex = firstResult.columns.indexOf('id');
  if (idIndex === -1) {
    return {
      correct: false,
      message: MESSAGES.validation.missingColumns,
    };
  }

  const actualIds = firstResult.values.map((row) => Number(row?.[idIndex])).filter((id) => !Number.isNaN(id));
  const expectedIds = exercise.state.expectedIds;

  if (actualIds.length !== expectedIds.length) {
    return {
      correct: false,
      message: template(MESSAGES.verification.wrongRowCount, {
        expected: expectedIds.length,
        actual: actualIds.length,
      }),
    };
  }

  const expectedSet = new Set(expectedIds);
  const allMatch =
    actualIds.every((id) => expectedSet.has(id)) &&
    expectedIds.every((id) => actualIds.includes(id)) &&
    new Set(actualIds).size === actualIds.length;

  if (!allMatch) {
    return {
      correct: false,
      message: MESSAGES.verification.wrongRows,
    };
  }

  return {
    correct: true,
    message: MESSAGES.verification.correct,
  };
}

export function getSolution(exercise: ExerciseState): string {
  switch (exercise.state.scenario) {
    case 'multi-filter-us-large':
      return "SELECT * FROM companies WHERE country = 'United States' AND num_employees > 100000";
    case 'multi-filter-netherlands-tech':
      return "SELECT * FROM companies WHERE country = 'Netherlands' AND industry = 'Technology'";
    case 'multi-filter-uk-or-us':
      return "SELECT * FROM companies WHERE (country = 'United Kingdom' OR country = 'United States') AND founded_year > 2000";
    default:
      return 'SELECT * FROM companies';
  }
}

function stringify(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}
