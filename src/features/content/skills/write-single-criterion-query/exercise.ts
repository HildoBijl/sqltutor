import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'single-refunded',
    prompt: 'Retrieve the validator ID, amount, and status of all transactions that have been refunded.',
    solution: `
SELECT validated_by, amount, status
FROM transactions
WHERE status = 'refunded';
    `,
  },
  {
    id: 'single-vendor-42',
    prompt: 'Retrieve the customer ID, amount, and date/time of all transactions handled by vendor with ID = 42.',
    solution: `
SELECT buyer_id, amount, date_time
FROM transactions
WHERE vendor_id = 42;
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
