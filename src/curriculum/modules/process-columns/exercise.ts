import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'process-pay-ratio',
    prompt: 'Retrieve the employee ID, start date, and the ratio of salary to performance score for all employees.',
    solution: `
SELECT e_id, start_date, salary / perf_score AS pay_ratio
FROM emp_data;
    `,
  },
  {
    id: 'process-budget-per-employee',
    prompt: 'Retrieve the department ID, budget, number of employees, and the budget per employee for all departments.',
    solution: `
SELECT d_id, budget, nr_employees,
       budget / nr_employees AS budget_per_employee
FROM departments;
    `,
  },
  {
    id: 'process-date-flag',
    prompt: 'Retrieve the employee ID and a flag indicating if the start date is after the end date for each employee. (The flag is TRUE or 1 when the start date is after the end date, and FALSE or 0 when this is not the case.)',
    solution: `
SELECT e_id, start_date > end_date AS wrong_info
FROM emp_data;
    `,
  },
];

export type ExerciseState = StaticExerciseState;

export const {
  generate,
  getDescription,
  validateOutput,
  verifyOutput,
  getSolution,
} = buildStaticExerciseModule(EXERCISES);
