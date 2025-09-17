export interface ExerciseState {
  id: string;
  description: string;
  expectedQuery: string;
}

type Utils = {
  selectRandomly: <T>(items: readonly T[]) => T;
};

const scenarios: readonly ExerciseState[] = [
  {
    id: 'multi-layered-department-average',
    description: 'Find employees whose salary is higher than the average salary of their department using a CTE.',
    expectedQuery: 'WITH department_avg AS ( SELECT department, AVG(salary) AS avg_salary FROM employees GROUP BY department ) SELECT e.name, e.department, e.salary FROM employees e JOIN department_avg d ON e.department = d.department WHERE e.salary > d.avg_salary',
  },
  {
    id: 'multi-layered-project-hours',
    description: 'List projects whose total allocated hours exceed 1000 using a subquery against employee_projects.',
    expectedQuery: 'SELECT name, budget FROM projects WHERE id IN ( SELECT project_id FROM employee_projects GROUP BY project_id HAVING SUM(hours_allocated) > 1000 )',
  },
];

export function generate(utils: Utils): ExerciseState {
  return utils.selectRandomly(scenarios);
}

function normalize(query: string) {
  return query.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');
}

export function validate(input: string, state: ExerciseState | null, _result: unknown) {
  if (!state) return false;
  return normalize(input) === normalize(state.expectedQuery);
}

export const solutionTemplate = '{{expectedQuery}};';
