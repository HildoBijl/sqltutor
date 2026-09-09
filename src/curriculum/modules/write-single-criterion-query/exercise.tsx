import {
  buildSimpleSQLExercise,
  type SimpleSQLExerciseDefinition,
} from '@sqlvalley/sql';
import type { AnyExerciseDefinition } from '@sqlvalley/exercise-engine';
import { SqlPracticeProvider } from '@/curriculum/utils/SqlPracticeProvider';

type Parameters = Record<string, never>;

const EXERCISES: SimpleSQLExerciseDefinition<Parameters>[] = [
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
    exerciseId: 'unknown-budget',
    version: 1,
    generateParameters: () => ({}),
    problem: 'Find the ID and name of all the departments whose budget is not known.',
    solution: `
SELECT d_id, d_name
FROM departments
WHERE budget IS NULL;
    `,
  },
  {
    exerciseId: 'large-earners',
    version: 1,
    generateParameters: () => ({}),
    problem: 'Find the first and last names of all the employees who currently earn more than 150,000. Ensure there are no duplicates.',
    solution: `
SELECT DISTINCT first_name, last_name
FROM employees
WHERE current_salary > 150000;
    `,
  },
  {
    exerciseId: 'tough-positions',
    version: 1,
    generateParameters: () => ({}),
    problem: 'Find all the job positions where at some point someone performed less than a performance score of 60. Ensure there are no duplicates.',
    solution: `
SELECT DISTINCT position
FROM contracts
WHERE perf_score < 60;
    `,
  },
];

export default function buildExercises(): AnyExerciseDefinition[] {
  return EXERCISES.map((exercise) => buildSimpleSQLExercise(exercise));
}

export const ModuleProvider = SqlPracticeProvider;
