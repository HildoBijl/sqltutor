import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '../shared/simpleExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'lookup-validator-names',
    prompt: 'Retrieve the names of employees who appear as validators in transactions where the customer ID is the same as the vendor ID.',
    solution: `
SELECT first_name, last_name
FROM employees
WHERE e_id IN (
  SELECT validated_by
  FROM transactions
  WHERE buyer_id = vendor_id
);
    `,
  },
  {
    id: 'lookup-before-vendor-created',
    prompt: 'Retrieve all transactions that occurred before the corresponding vendor’s registration date.',
    solution: `
SELECT *
FROM transactions t
WHERE t.date_time < (
    SELECT a.created_at
    FROM accounts a
    WHERE a.acct_id = t.vendor_id
);
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
