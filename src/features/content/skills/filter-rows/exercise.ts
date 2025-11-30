import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '../shared/simpleExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'filter-rows-gt-amount',
    prompt: 'Retrieve all transactions with an amount greater than 10,000.',
    solution: `
SELECT *
FROM transactions
WHERE amount > 10000;
    `,
  },
  {
    id: 'filter-rows-same-buyer-vendor',
    prompt: 'Retrieve all transactions where the buyer and the vendor is the same account.',
    solution: `
SELECT *
FROM transactions
WHERE buyer_id = vendor_id;
    `,
  },
  {
    id: 'filter-rows-specific-date',
    prompt: 'Retrieve all transactions that occurred on the 11th of February 2025.',
    solution: `
SELECT *
FROM transactions
WHERE date_time LIKE '2025-02-11%';
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
