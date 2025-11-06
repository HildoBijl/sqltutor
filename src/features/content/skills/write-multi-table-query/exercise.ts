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
  EMPLOYEE_PROJECTS,
  compareRows,
  createEmployeeLookup,
  createProjectLookup,
} from '../shared';

type ScenarioId = 'multi-table-projects' | 'multi-table-active' | 'multi-table-hours';

interface ScenarioDefinition {
  id: ScenarioId;
  description: string;
  columns: string[];
  expectedRows: unknown[][];
}

export interface WriteMultiTableState {
  scenario: ScenarioId;
  columns: string[];
  expectedRows: unknown[][];
}

export interface ExerciseState {
  id: ScenarioId;
  description: string;
  state: WriteMultiTableState;
}

const EMPLOYEE_LOOKUP = createEmployeeLookup();
const PROJECT_LOOKUP = createProjectLookup();

export const MESSAGES = {
  descriptions: {
    'multi-table-projects': 'Show each employee together with the projects they work on by joining employees, employee_projects, and projects.',
    'multi-table-active': 'List active projects with the employees assigned to them.',
    'multi-table-hours': 'Retrieve employee names with their allocated hours per project.',
  },
  validation: {
    ...COMMON_MESSAGES.validation,
    noResultSet: 'Query returned no data.',
    wrongColumns: 'Return exactly the expected columns with correct aliases.',
  },
  verification: {
    ...COMMON_MESSAGES.verification,
    correct: 'Great multi-table join!',
    wrongRowCount: 'Expected {expected} rows but got {actual}.',
    wrongValues: 'Some joined rows are incorrect.',
  },
} as const;

const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'multi-table-projects',
    description: MESSAGES.descriptions['multi-table-projects'],
    columns: ['name', 'project_name'],
    expectedRows: EMPLOYEE_PROJECTS.map((assignment) => {
      const employee = EMPLOYEE_LOOKUP.get(assignment.employee_id);
      const project = PROJECT_LOOKUP.get(assignment.project_id);
      return [employee?.name ?? null, project?.name ?? null];
    })
      .filter((row) => row[0] !== null && row[1] !== null)
      .sort(compareRows),
  },
  {
    id: 'multi-table-active',
    description: MESSAGES.descriptions['multi-table-active'],
    columns: ['name', 'employee_name'],
    expectedRows: EMPLOYEE_PROJECTS.map((assignment) => {
      const employee = EMPLOYEE_LOOKUP.get(assignment.employee_id);
      const project = PROJECT_LOOKUP.get(assignment.project_id);
      if (project?.status !== 'Active') return null;
      return [project.name, employee?.name ?? null];
    })
      .filter((row): row is [string, string] => row !== null && row[0] !== null && row[1] !== null)
      .sort(compareRows),
  },
  {
    id: 'multi-table-hours',
    description: MESSAGES.descriptions['multi-table-hours'],
    columns: ['name', 'project_name', 'hours_allocated'],
    expectedRows: EMPLOYEE_PROJECTS.map((assignment) => {
      const employee = EMPLOYEE_LOOKUP.get(assignment.employee_id);
      const project = PROJECT_LOOKUP.get(assignment.project_id);
      return [employee?.name ?? null, project?.name ?? null, assignment.hours_allocated];
    })
      .filter((row) => row[0] !== null && row[1] !== null)
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
    case 'multi-table-projects':
      return 'SELECT e.name, p.name AS project_name FROM employees e JOIN employee_projects ep ON e.id = ep.employee_id JOIN projects p ON ep.project_id = p.id';
    case 'multi-table-active':
      return "SELECT p.name, e.name AS employee_name FROM projects p JOIN employee_projects ep ON p.id = ep.project_id JOIN employees e ON ep.employee_id = e.id WHERE p.status = 'Active'";
    case 'multi-table-hours':
      return 'SELECT e.name, p.name AS project_name, ep.hours_allocated FROM employees e JOIN employee_projects ep ON e.id = ep.employee_id JOIN projects p ON ep.project_id = p.id';
    default:
      return 'SELECT e.name, p.name FROM employees e JOIN employee_projects ep ON e.id = ep.employee_id JOIN projects p ON ep.project_id = p.id';
  }
}
