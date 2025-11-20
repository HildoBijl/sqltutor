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

type ScenarioId =
  | 'filtered-aggregation-avg'
  | 'filtered-aggregation-country'
  | 'filtered-aggregation-total';

interface ScenarioDefinition {
  id: ScenarioId;
  columns: string[];
  expectedRows: unknown[][];
}

export interface UseFilteredAggregationState {
  scenario: ScenarioId;
  columns: string[];
  expectedRows: unknown[][];
}

export interface ExerciseState {
  id: ScenarioId;
  state: UseFilteredAggregationState;
}

export const MESSAGES = {
  descriptions: {
    'filtered-aggregation-avg': 'Find industries where the average number of employees exceeds 120000.',
    'filtered-aggregation-country': 'List countries with at least two technology companies.',
    'filtered-aggregation-total': 'Return industries whose total headcount surpasses 300000 employees.',
  },
  validation: {
    ...COMMON_MESSAGES.validation,
    noResultSet: 'Query returned no data.',
    wrongColumns: 'Return exactly the requested columns with the correct aliases.',
  },
  verification: {
    ...COMMON_MESSAGES.verification,
    correct: 'Great filtering!',
    wrongRowCount: 'Expected {expected} groups but got {actual}.',
    wrongValues: 'Some aggregates do not match the expected values.',
  },
} as const;

const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'filtered-aggregation-avg',
    columns: ['industry', 'avg_employees'],
    expectedRows: (() => {
      const aggregates = new Map<string, { sum: number; count: number }>();
      COMPANIES.forEach((company) => {
        const key = company.industry ?? '';
        const stat = aggregates.get(key) ?? { sum: 0, count: 0 };
        if (company.num_employees !== null) {
          stat.sum += company.num_employees;
          stat.count += 1;
        }
        aggregates.set(key, stat);
      });
      return [...aggregates.entries()]
        .map(([industry, { sum, count }]) => {
          const average = count === 0 ? null : sum / count;
          return { industry: industry || null, average };
        })
        .filter((group) => (group.average ?? 0) > 120000)
        .map((group) => [group.industry, group.average])
        .sort(compareRows);
    })(),
  },
  {
    id: 'filtered-aggregation-country',
    columns: ['country', 'tech_companies'],
    expectedRows: (() => {
      const counts = new Map<string, number>();
      COMPANIES.filter((company) => company.industry === 'Technology').forEach((company) => {
        counts.set(company.country, (counts.get(company.country) ?? 0) + 1);
      });
      return [...counts.entries()]
        .filter(([, count]) => count >= 2)
        .map(([country, count]) => [country, count])
        .sort(compareRows);
    })(),
  },
  {
    id: 'filtered-aggregation-total',
    columns: ['industry', 'total_employees'],
    expectedRows: (() => {
      const totals = new Map<string, number>();
      COMPANIES.forEach((company) => {
        if (company.num_employees === null) return;
        const key = company.industry ?? '';
        totals.set(key, (totals.get(key) ?? 0) + company.num_employees);
      });
      return [...totals.entries()]
        .filter(([, total]) => total > 300000)
        .map(([industry, total]) => [industry || null, total])
        .sort(compareRows);
    })(),
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
    case 'filtered-aggregation-avg':
      return 'SELECT industry, AVG(num_employees) AS avg_employees FROM companies GROUP BY industry HAVING AVG(num_employees) > 120000';
    case 'filtered-aggregation-country':
      return "SELECT country, COUNT(*) AS tech_companies FROM companies WHERE industry = 'Technology' GROUP BY country HAVING COUNT(*) >= 2";
    case 'filtered-aggregation-total':
      return 'SELECT industry, SUM(num_employees) AS total_employees FROM companies GROUP BY industry HAVING SUM(num_employees) > 300000';
    default:
      return 'SELECT industry FROM companies GROUP BY industry';
  }
}
