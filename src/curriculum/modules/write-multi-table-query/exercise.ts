import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'multitable-mock-join-le',
    version: 1,
    prompt: 'List the email addresses of unverified accounts who have bought a product for less than half of its estimated value.',
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
    id: 'multitable-mock-in-notin',
    version: 1,
    prompt: 'Find the first name and last name of accounts who appear as buyers in transactions related to "Musical Instruments" products, but never sold anything (of any type).',
    solution: `
SELECT first_name, last_name
FROM accounts
AND username IN (
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
    id: 'multitable-mock-intersect',
    version: 1,
    prompt: 'Retrieve the usernames of all users who have bought one or more products from the "Fine Art" category at any point in time, that also appear as owners of products categorized as "Designer Fashion".',
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
