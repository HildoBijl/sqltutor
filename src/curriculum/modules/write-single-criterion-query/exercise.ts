import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
  //   {
  //     id: 'single-refunded',
  //     prompt: 'Retrieve the validator ID, amount, and status of all transactions that have been refunded.',
  //     solution: `
  // SELECT validated_by, amount, status
  // FROM transactions
  // WHERE status = 'refunded';
  //     `,
  //   },
  //   {
  //     id: 'single-vendor-42',
  //     prompt: 'Retrieve the customer ID, amount, and date/time of all transactions handled by vendor with ID = 42.',
  //     solution: `
  // SELECT buyer_id, amount, date_time
  // FROM transactions
  // WHERE vendor_id = 42;
  //     `,
  //   },
  {
    id: 'unknown-budget',
    version: 1,
    prompt: 'Find the ID and name of all the departments whose budget is not known.',
    solution: `
SELECT d_id, d_name
FROM departments
WHERE budget IS NULL;
    `,
  },
  {
    id: 'large-earners',
    version: 1,
    prompt: 'Find the first and last names of all the employees who currently earn more than 150,000. Ensure there are no duplicates.',
    solution: `
SELECT DISTINCT first_name, last_name
FROM employees
WHERE current_salary > 150000;
    `,
  },
  {
    id: 'tough-positions',
    version: 1,
    prompt: 'Find all the job positions where at some point someone performed less than a performance score of 60. Ensure there are no duplicates.',
    solution: `
SELECT DISTINCT position
FROM emp_data
WHERE perf_score < 60;
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
