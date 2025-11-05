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

interface FieldDescriptor {
  column: string;
  property: keyof CompanyRow;
}

interface ScenarioBuildResult {
  description: string;
  fields: FieldDescriptor[];
}

interface ScenarioDefinition {
  id: ChooseColumnsState['scenario'];
  build(utils: Utils): ScenarioBuildResult;
}

export interface ChooseColumnsState {
  scenario: 'choose-columns-basic' | 'choose-columns-alias' | 'choose-columns-location';
  columns: string[];
  expectedValues: unknown[][];
}

export interface ExerciseState {
  id: ChooseColumnsState['scenario'];
  description: string;
  state: ChooseColumnsState;
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
    'choose-columns-basic': 'Return company name and industry from the companies table.',
    'choose-columns-alias': 'Select company name and number of employees, renaming the numeric column to employees.',
    'choose-columns-location': 'Retrieve company name together with country and founded year.',
  },
  validation: {
    ...COMMON_MESSAGES.validation,
    noResultSet: 'Query returned no data.',
    missingColumns: 'Select exactly the requested columns in the correct order.',
    unexpectedColumns: 'Remove any extra columns from your result.',
  },
  verification: {
    ...COMMON_MESSAGES.verification,
    correct: 'Perfect! Those columns look great.',
    wrongRowCount: 'Expected {expected} rows but got {actual}.',
    wrongValues: 'Some rows do not match the expected results.',
  },
} as const;

const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'choose-columns-basic',
    build() {
      return {
        description: MESSAGES.descriptions['choose-columns-basic'],
        fields: [
          { column: 'company_name', property: 'company_name' },
          { column: 'industry', property: 'industry' },
        ],
      };
    },
  },
  {
    id: 'choose-columns-alias',
    build() {
      return {
        description: MESSAGES.descriptions['choose-columns-alias'],
        fields: [
          { column: 'company_name', property: 'company_name' },
          { column: 'employees', property: 'num_employees' },
        ],
      };
    },
  },
  {
    id: 'choose-columns-location',
    build() {
      return {
        description: MESSAGES.descriptions['choose-columns-location'],
        fields: [
          { column: 'company_name', property: 'company_name' },
          { column: 'country', property: 'country' },
          { column: 'founded_year', property: 'founded_year' },
        ],
      };
    },
  },
];

export function generate(utils: Utils): ExerciseState {
  const scenario = utils.selectRandomly(SCENARIOS as readonly ScenarioDefinition[]);
  const { description, fields } = scenario.build(utils);

  const columns = fields.map((field) => field.column);
  const expectedValues = COMPANIES.map((company) =>
    fields.map((field) => company[field.property] ?? null),
  );

  return {
    id: scenario.id,
    description,
    state: {
      scenario: scenario.id,
      columns,
      expectedValues,
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
      message: MESSAGES.validation.missingColumns,
    };
  }

  for (let index = 0; index < exercise.state.columns.length; index += 1) {
    if (firstResult.columns[index] !== exercise.state.columns[index]) {
      return {
        ok: false,
        message: MESSAGES.validation.missingColumns,
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
    case 'choose-columns-basic':
      return 'SELECT company_name, industry FROM companies';
    case 'choose-columns-alias':
      return 'SELECT company_name, num_employees AS employees FROM companies';
    case 'choose-columns-location':
      return 'SELECT company_name, country, founded_year FROM companies';
    default:
      return 'SELECT company_name FROM companies';
  }
}

function stringify(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}
