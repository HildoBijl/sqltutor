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
import {
  EMPLOYEES,
  PROJECTS,
  EMPLOYEE_PROJECTS,
  compareRows,
} from '../shared';

type ScenarioId = 'multi-layered-department-average' | 'multi-layered-project-hours';

interface ScenarioDefinition {
  id: ScenarioId;
  description: string;
  columns: string[];
  expectedRows: unknown[][];
}

export interface WriteMultiLayeredState {
  scenario: ScenarioId;
  columns: string[];
  expectedRows: unknown[][];
}

export interface ExerciseState {
  id: ScenarioId;
  description: string;
  state: WriteMultiLayeredState;
}

export const MESSAGES = {
  descriptions: {
    'multi-layered-department-average': 'Find employees whose salary is higher than the average salary of their department using a CTE.',
    'multi-layered-project-hours': 'List projects whose total allocated hours exceed 1000 using a subquery against employee_projects.',
  },
  validation: {
    ...COMMON_MESSAGES.validation,
    noResultSet: 'Query returned no data.',
    wrongColumns: 'Return the requested columns with correct aliases.',
  },
  verification: {
    ...COMMON_MESSAGES.verification,
    correct: 'Great multi-layered query!',
    wrongRowCount: 'Expected {expected} rows but got {actual}.',
    wrongValues: 'Some rows do not match the expected logic.',
  },
} as const;

const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'multi-layered-department-average',
    description: MESSAGES.descriptions['multi-layered-department-average'],
    columns: ['name', 'department', 'salary'],
    expectedRows: (() => {
      const stats = new Map<string, { sum: number; count: number }>();
      EMPLOYEES.forEach((employee) => {
        if (employee.salary === null) return;
        const department = employee.department;
        if (!department) return;
        const bucket = stats.get(department) ?? { sum: 0, count: 0 };
        bucket.sum += employee.salary;
        bucket.count += 1;
        stats.set(department, bucket);
      });
      return EMPLOYEES.filter((employee) => {
        if (employee.salary === null) return false;
        const department = employee.department;
        if (!department) return false;
        const departmentStats = stats.get(department);
        if (!departmentStats || departmentStats.count === 0) return false;
        const average = departmentStats.sum / departmentStats.count;
        return employee.salary > average;
      })
        .map((employee) => [employee.name, employee.department as string, employee.salary as number])
        .sort(compareRows);
    })(),
  },
  {
    id: 'multi-layered-project-hours',
    description: MESSAGES.descriptions['multi-layered-project-hours'],
    columns: ['name', 'budget'],
    expectedRows: (() => {
      const totals = new Map<number, number>();
      EMPLOYEE_PROJECTS.forEach((assignment) => {
        if (assignment.hours_allocated === null) return;
        totals.set(
          assignment.project_id,
          (totals.get(assignment.project_id) ?? 0) + assignment.hours_allocated,
        );
      });
      return PROJECTS.filter((project) => (totals.get(project.id) ?? 0) > 1000)
        .map((project) => [project.name, project.budget])
        .sort(compareRows);
    })(),
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
    case 'multi-layered-department-average':
      return 'WITH department_avg AS ( SELECT department, AVG(salary) AS avg_salary FROM employees GROUP BY department ) SELECT e.name, e.department, e.salary FROM employees e JOIN department_avg d ON e.department = d.department WHERE e.salary > d.avg_salary';
    case 'multi-layered-project-hours':
      return 'SELECT name, budget FROM projects WHERE id IN ( SELECT project_id FROM employee_projects GROUP BY project_id HAVING SUM(hours_allocated) > 1000 )';
    default:
      return 'SELECT name FROM projects';
  }
}
