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

type ScenarioId = 'sort-by-employees' | 'sort-by-country-name' | 'sort-offset';

interface ScenarioBuildResult {
  description: string;
  expectedOrder: number[];
}

interface ScenarioDefinition {
  id: ScenarioId;
  build(utils: Utils): ScenarioBuildResult;
}

export interface SortRowsState {
  scenario: ScenarioId;
  expectedOrder: number[];
}

export interface ExerciseState {
  id: ScenarioId;
  description: string;
  state: SortRowsState;
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
    'sort-by-employees': 'Return the three largest companies by number of employees.',
    'sort-by-country-name': 'List companies ordered by country (A-Z) and company name descending within each country.',
    'sort-offset': 'Show two companies after skipping the first result when sorting by founded year ascending.',
  },
  validation: {
    ...COMMON_MESSAGES.validation,
    noResultSet: 'Query returned no data.',
    missingColumns: 'Include all columns from the companies table (use SELECT *).',
  },
  verification: {
    ...COMMON_MESSAGES.verification,
    correct: 'Perfect ordering!',
    wrongRowCount: 'Expected {expected} rows but got {actual}.',
    wrongOrder: 'Row order does not match the expected sort.',
  },
} as const;

const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'sort-by-employees',
    build() {
      const expectedOrder = [...COMPANIES]
        .sort((a, b) => (b.num_employees ?? 0) - (a.num_employees ?? 0))
        .slice(0, 3)
        .map((company) => company.id);

      return {
        description: MESSAGES.descriptions['sort-by-employees'],
        expectedOrder,
      };
    },
  },
  {
    id: 'sort-by-country-name',
    build() {
      const expectedOrder = [...COMPANIES]
        .sort((a, b) => {
          const countryDiff = a.country.localeCompare(b.country);
          if (countryDiff !== 0) return countryDiff;
          return b.company_name.localeCompare(a.company_name);
        })
        .map((company) => company.id);

      return {
        description: MESSAGES.descriptions['sort-by-country-name'],
        expectedOrder,
      };
    },
  },
  {
    id: 'sort-offset',
    build() {
      const sorted = [...COMPANIES].sort((a, b) => (a.founded_year ?? 0) - (b.founded_year ?? 0));
      const expectedOrder = sorted.slice(1, 3).map((company) => company.id);

      return {
        description: MESSAGES.descriptions['sort-offset'],
        expectedOrder,
      };
    },
  },
];

export function generate(utils: Utils): ExerciseState {
  const scenario = utils.selectRandomly(SCENARIOS as readonly ScenarioDefinition[]);
  const { description, expectedOrder } = scenario.build(utils);

  return {
    id: scenario.id,
    description,
    state: {
      scenario: scenario.id,
      expectedOrder,
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
    ignoreRowOrder: false,
    ignoreColumnOrder: true,
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
    case 'sort-by-employees':
      return 'SELECT * FROM companies ORDER BY num_employees DESC LIMIT 3';
    case 'sort-by-country-name':
      return 'SELECT * FROM companies ORDER BY country ASC, company_name DESC';
    case 'sort-offset':
      return 'SELECT * FROM companies ORDER BY founded_year ASC LIMIT 2 OFFSET 1';
    default:
      return 'SELECT * FROM companies ORDER BY company_name';
  }
}

function stringify(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}
