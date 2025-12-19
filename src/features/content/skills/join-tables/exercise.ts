import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'join-before-vendor-registered',
    prompt: 'Retrieve the product id and the username of the vendor from all transactions that occurred before that vendor\'s account was officially registered.',
    solution: `
SELECT t.prod_id, a.username
FROM transactions t
JOIN accounts a ON t.vendor_id = a.acct_id
WHERE t.date_time < a.created_at;
    `,
  },
  {
    id: 'join-same-day-accounts',
    prompt: 'Retrieve the names of vendors and customers whose accounts were created on the same date and participated in the same transaction.',
    solution: `
SELECT vendor.full_name, customer.full_name
FROM transactions AS t
JOIN accounts AS vendor ON vendor.acct_id = t.vendor_id
JOIN accounts AS customer ON customer.acct_id = t.buyer_id
WHERE vendor.created_at = customer.created_at;
    `,
  },
  {
    id: 'join-product-not-owner',
    prompt: 'Retrieve the product name and the amount it was sold for for all transactions where the product was sold by someone other than its owner.',
    solution: `
SELECT t.amount, p.name
FROM transactions t
JOIN products p ON t.prod_id = p.p_id
WHERE t.vendor_id != p.owner_id;
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
