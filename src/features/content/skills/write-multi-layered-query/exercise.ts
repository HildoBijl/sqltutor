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

interface EmployeeRow {
  id: number;
  name: string;
  department: string;
  salary: number | null;
}

interface ProjectRow {
  id: number;
  name: string;
  budget: number | null;
}

interface EmployeeProjectRow {
  project_id: number;
  hours_allocated: number | null;
}

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

const RAW_EMPLOYEES = parseSchemaRows(schemas.employees, 'employees');
const RAW_PROJECTS = parseSchemaRows(schemas.employees, 'projects');
const RAW_EMPLOYEE_PROJECTS = parseSchemaRows(schemas.employees, 'employee_projects');

const EMPLOYEES: EmployeeRow[] = RAW_EMPLOYEES.map((row) => ({
  id: Number(row.id ?? 0),
  name: stringify(row.name),
  department: stringify(row.department),
  salary: typeof row.salary === 'number' ? row.salary : null,
}));

const PROJECTS: ProjectRow[] = RAW_PROJECTS.map((row) => ({
  id: Number(row.id ?? 0),
  name: stringify(row.name),
  budget: typeof row.budget === 'number' ? row.budget : null,
}));

const EMPLOYEE_PROJECTS: EmployeeProjectRow[] = RAW_EMPLOYEE_PROJECTS.map((row) => ({
  project_id: Number(row.project_id ?? 0),
  hours_allocated: typeof row.hours_allocated === 'number' ? row.hours_allocated : null,
}));

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
        const bucket = stats.get(employee.department) ?? { sum: 0, count: 0 };
        bucket.sum += employee.salary;
        bucket.count += 1;
        stats.set(employee.department, bucket);
      });
      return EMPLOYEES.filter((employee) => {
        if (employee.salary === null) return false;
        const departmentStats = stats.get(employee.department);
        if (!departmentStats || departmentStats.count === 0) return false;
        const average = departmentStats.sum / departmentStats.count;
        return employee.salary > average;
      })
        .map((employee) => [employee.name, employee.department, employee.salary])
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
): VerificationResult {
  const firstResult = output?.[0];

  if (!firstResult || !Array.isArray(firstResult.values)) {
    return {
      correct: false,
      message: MESSAGES.validation.noResultSet,
    };
  }

  const normalizedActual = firstResult.values.map((row) =>
    JSON.stringify(row.slice(0, exercise.state.columns.length).map(normalizeValue)),
  );
  const normalizedExpected = exercise.state.expectedRows.map((row) =>
    JSON.stringify(row.map(normalizeValue)),
  );

  normalizedActual.sort();
  normalizedExpected.sort();

  if (normalizedActual.length !== normalizedExpected.length) {
    return {
      correct: false,
      message: template(MESSAGES.verification.wrongRowCount, {
        expected: normalizedExpected.length,
        actual: normalizedActual.length,
      }),
    };
  }

  const matches = normalizedActual.every((value, index) => value === normalizedExpected[index]);

  return {
    correct: matches,
    message: matches ? MESSAGES.verification.correct : MESSAGES.verification.wrongValues,
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

function normalizeValue(value: unknown): unknown {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.round(value * 1000) / 1000 : null;
  }
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return value;
}
