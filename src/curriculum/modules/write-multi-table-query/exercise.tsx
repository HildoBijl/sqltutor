import {
  buildSimpleSQLExercise,
  type SimpleSQLExerciseDefinition,
} from '@sqlvalley/sql';
import type { AnyExerciseDefinition } from '@sqlvalley/exercise-engine';
import { SqlPracticeProvider } from '@/curriculum/utils/SqlPracticeProvider';

type Parameters = Record<string, never>;

const EXERCISES: SimpleSQLExerciseDefinition<Parameters>[] = [
  {
    exerciseId: 'multitable-mock-join-le',
    version: 1,
    generateParameters: () => ({}),
    problem: 'List the email addresses of unverified accounts who have bought a product for less than half of its estimated value.',
    solution: `
SELECT email
FROM accounts
WHERE email_verified = FALSE AND username IN (
  SELECT t.buyer
  FROM products AS p
  JOIN transactions AS t
  ON t.prod_id = p.p_id
  WHERE t.price < 0.5*p.est_value
)
    `,
  },
  {
    exerciseId: 'multitable-mock-in-notin',
    version: 1,
    generateParameters: () => ({}),
    problem: 'Find the first name and last name of accounts who appear as buyers in transactions related to "Musical Instruments" products, but never sold anything.',
    solution: `
SELECT first_name, last_name
FROM accounts
WHERE username IN (
  SELECT buyer
  FROM transactions
  WHERE prod_id IN (
    SELECT p_id
    FROM products
    WHERE category = 'Musical Instruments'
  )
) AND username NOT IN (
  SELECT vendor
  FROM transactions
)
    `,
  },
  {
    exerciseId: 'multitable-mock-intersect',
    version: 1,
    generateParameters: () => ({}),
    problem: 'Retrieve the usernames of all users who have bought one or more products from the "Fine Art" category and also appear as owners of products categorized as "Designer Fashion".',
    solution: `
SELECT DISTINCT buyer
FROM transactions
WHERE prod_id IN (
  SELECT p_id
  FROM products
  WHERE category = 'Fine Art'
)
INTERSECT
SELECT DISTINCT owned_by
FROM products
WHERE category = 'Designer Fashion'
    `,
  },
];

export default function buildExercises(): AnyExerciseDefinition[] {
  return EXERCISES.map((exercise) => buildSimpleSQLExercise(exercise));
}

export const ModuleProvider = SqlPracticeProvider;
