import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'sort-by-perf-salary',
    version: 1,
    prompt: 'Retrieve all contracts, sorted first by performance score ascending, and for equal scores, by salary descending.',
    solution: `
SELECT *
FROM contracts
ORDER BY perf_score ASC, salary DESC;
    `,
  },
  {
    id: 'sort-dept-budget-skip',
    version: 1,
    prompt: 'Retrieve 5 departments with the smallest budgets, skipping the first 3.',
    solution: `
SELECT *
FROM departments
ORDER BY budget ASC
LIMIT 5 OFFSET 3;
    `,
  },
  {
    id: 'sort-end-date-null-last',
    version: 1,
    prompt: 'Retrieve all contracts of all employees, ordered by end date. Put the unlimited contracts at the end.',
    solution: `
SELECT *
FROM contracts
ORDER BY end_date ASC NULLS LAST;
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
