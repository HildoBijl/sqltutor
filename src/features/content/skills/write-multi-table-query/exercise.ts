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
    id: 'multi-table-projects',
    description: 'Show each employee together with the projects they work on by joining employees, employee_projects, and projects.',
    expectedQuery: 'SELECT e.name, p.name AS project_name FROM employees e JOIN employee_projects ep ON e.id = ep.employee_id JOIN projects p ON ep.project_id = p.id',
  },
  {
    id: 'multi-table-active',
    description: 'List active projects with the employees assigned to them.',
    expectedQuery: "SELECT p.name, e.name AS employee_name FROM projects p JOIN employee_projects ep ON p.id = ep.project_id JOIN employees e ON ep.employee_id = e.id WHERE p.status = 'Active'",
  },
  {
    id: 'multi-table-hours',
    description: 'Retrieve employee names with their allocated hours per project.',
    expectedQuery: 'SELECT e.name, p.name AS project_name, ep.hours_allocated FROM employees e JOIN employee_projects ep ON e.id = ep.employee_id JOIN projects p ON ep.project_id = p.id',
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
