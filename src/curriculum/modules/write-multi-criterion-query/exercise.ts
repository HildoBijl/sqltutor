import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'multi-criterion-start-date-range',
    version: 1,
    prompt: 'Retrieve the first 10 employees whose start date falls between January 1 and September 30 of 2025 (inclusive), sorted by start date.',
    solution: `
SELECT e_id, start_date, position, perf_score
FROM emp_data
WHERE start_date BETWEEN '2025-01-01' AND '2025-09-30'
ORDER BY start_date
LIMIT 10;
    `,
  },
//   {
//     id: 'multi-criterion-work-status-leave',
//     prompt: 'Retrieve the employee ID, status, and monthly salary of employees whose work_status contains leave and whose monthly salary is either above 10,000 or below 1,000.',
//     solution: `
// SELECT e_id, work_status, salary / 12 AS monthly_salary
// FROM emp_data
// WHERE work_status LIKE '%leave%'
//   AND (salary / 12 > 10000 OR salary / 12 < 1000);
//     `,
//   },
  {
    id: 'multi-criterion-work-status-active',
    version: 1,
    prompt: 'Retrieve the employee ID, status, and monthly salary of employees whose status is active and whose whose monthly salary is either above 10,000 or below 1,000.',
    solution: `
SELECT e_id, status, salary / 12 AS monthly_salary
FROM emp_data
WHERE status = 'active'
  AND (salary / 12 > 10000 OR salary / 12 < 1000);
    `,
  },
  {
    id: 'multi-criterion-departments-expenditure',
    version: 1,
    prompt: 'Retrieve an overview of department names and their budget per employee, sorted from highest to lowest. Exclude the departments of Human Resources, Customer Support and Public Relations in this overview.',
    solution: `
SELECT d_name AS name,
       budget / nr_employees AS expenditure
FROM departments
WHERE d_name NOT IN ('Human Resources', 'Customer Support', 'Public Relations')
ORDER BY expenditure DESC;
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
  listExercises,
  getExerciseById,
} = buildStaticExerciseModule(EXERCISES);
