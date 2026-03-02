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
    prompt: 'Retrieve 5 departments with the smallest budgets, skipping the first 3. Put departments with unknown budget at the end.',
    solution: `
SELECT *
FROM departments
ORDER BY budget ASC NULLS LAST
LIMIT 5 OFFSET 3;
    `,
  },
  {
    id: 'sort-end-date-null-last',
    version: 1,
    prompt: 'Retrieve all contracts of all employees, ordered by end date with later end dates shown first. Put everyone with an unlimited contract at the start.',
    solution: `
SELECT *
FROM contracts
ORDER BY end_date DESC NULLS FIRST;
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
