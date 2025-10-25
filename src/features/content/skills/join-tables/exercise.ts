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
}

interface PositionRow {
  id: number;
  company_id: number;
  position: string;
  salary: number | null;
  country: string;
  city: string;
}

type ScenarioId = 'join-company-positions' | 'join-left' | 'join-filtered';

interface ScenarioDefinition {
  id: ScenarioId;
  description: string;
  columns: string[];
  expectedRows: unknown[][];
}

export interface JoinTablesState {
  scenario: ScenarioId;
  columns: string[];
  expectedRows: unknown[][];
}

export interface ExerciseState {
  id: ScenarioId;
  description: string;
  state: JoinTablesState;
}

const RAW_COMPANIES = parseSchemaRows(schemas.companiesAndPositions, 'companies');
const RAW_POSITIONS = parseSchemaRows(schemas.companiesAndPositions, 'positions');

const COMPANIES: CompanyRow[] = RAW_COMPANIES.map((row) => ({
  id: Number(row.id ?? 0),
  company_name: stringify(row.company_name),
  country: stringify(row.country),
}));

const POSITIONS: PositionRow[] = RAW_POSITIONS.map((row) => ({
  id: Number(row.id ?? 0),
  company_id: Number(row.company_id ?? 0),
  position: stringify(row.position),
  salary: typeof row.salary === 'number' ? row.salary : null,
  country: stringify(row.country),
  city: stringify(row.city),
}));

const COMPANY_LOOKUP = new Map(COMPANIES.map((company) => [company.id, company]));

export const MESSAGES = {
  descriptions: {
    'join-company-positions': 'List each position together with the company name using an inner join.',
    'join-left': 'Show all companies and any available positions, keeping companies even if they have no positions.',
    'join-filtered': 'Return positions located in the Netherlands with their company name.',
  },
  validation: {
    ...COMMON_MESSAGES.validation,
    noResultSet: 'Query returned no data.',
    wrongColumns: 'Return exactly the expected columns.',
  },
  verification: {
    ...COMMON_MESSAGES.verification,
    correct: 'Perfect join!',
    wrongRowCount: 'Expected {expected} rows but got {actual}.',
    wrongValues: 'Joined rows do not match the expected result.',
  },
} as const;

const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'join-company-positions',
    description: MESSAGES.descriptions['join-company-positions'],
    columns: ['company_name', 'position', 'salary'],
    expectedRows: POSITIONS.map((position) => {
      const company = COMPANY_LOOKUP.get(position.company_id);
      return [company?.company_name ?? null, position.position, position.salary];
    })
      .filter((row) => row[0] !== null)
      .sort(compareRows),
  },
  {
    id: 'join-left',
    description: MESSAGES.descriptions['join-left'],
    columns: ['company_name', 'position'],
    expectedRows: COMPANIES.flatMap((company) => {
      const companyPositions = POSITIONS.filter((position) => position.company_id === company.id);
      if (companyPositions.length === 0) {
        return [[company.company_name, null]];
      }
      return companyPositions.map((position) => [company.company_name, position.position]);
    }).sort(compareRows),
  },
  {
    id: 'join-filtered',
    description: MESSAGES.descriptions['join-filtered'],
    columns: ['company_name', 'position', 'city'],
    expectedRows: POSITIONS.filter((position) => position.country === 'Netherlands')
      .map((position) => {
        const company = COMPANY_LOOKUP.get(position.company_id);
        return [company?.company_name ?? null, position.position, position.city];
      })
      .filter((row) => row[0] !== null)
      .sort(compareRows),
  },
];

export function generate(utils: Utils): ExerciseState {
  const scenario = utils.selectRandomly(SCENARIOS as readonly ScenarioDefinition[]);

  return {
    id: scenario.id,
    description: scenario.description,
    state: {
      scenario: scenario.id,
      columns: scenario.columns,
      expectedRows: scenario.expectedRows,
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
    case 'join-company-positions':
      return 'SELECT c.company_name, p.position, p.salary FROM positions p JOIN companies c ON p.company_id = c.id';
    case 'join-left':
      return 'SELECT c.company_name, p.position FROM companies c LEFT JOIN positions p ON c.id = p.company_id';
    case 'join-filtered':
      return "SELECT c.company_name, p.position, p.city FROM positions p JOIN companies c ON p.company_id = c.id WHERE p.country = 'Netherlands'";
    default:
      return 'SELECT c.company_name, p.position FROM companies c JOIN positions p ON c.id = p.company_id';
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
