import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '../shared/simpleExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'multi-filter-amount-between',
    prompt: 'Retrieve all transactions where the amount is not between 100 and 1000 and were not validated by any employee.',
    solution: `
SELECT *
FROM transactions
WHERE amount NOT BETWEEN 100 AND 1000
  AND validated_by IS NULL;
    `,
  },
  {
    id: 'multi-filter-approved-null',
    prompt: 'Retrieve all transactions with status approved where either the buyer or the vendor are undefined.',
    solution: `
SELECT *
FROM transactions
WHERE (vendor_id IS NULL OR buyer_id IS NULL)
  AND status = 'approved';
    `,
  },
  {
    id: 'multi-filter-expenses-first-day',
    prompt: 'Retrieve the id of the departments that have registered expenses on the first day of any month of 2025, requested and approved by the same employee.',
    solution: `
SELECT d_id
FROM expenses
WHERE date LIKE '2025-__-01'
  AND requested_by = approved_by;
    `,
  },
  {
    id: 'multi-filter-expenses-lorem',
    prompt: 'Retrieve all expenses with descriptions starting with Lorem or which occurred before 2005-09-20.',
    solution: `
SELECT *
FROM expenses
WHERE description LIKE 'Lorem%' OR date < '2005-09-20';
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
