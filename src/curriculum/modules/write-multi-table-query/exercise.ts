import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'multitable-mock-intersect',
    version: 1,
    prompt: 'Retrieve the usernames of all users who have bought one or more products from the "Fine Art" category at any point in time, that also appear as owners of products categorized as "Designer Fashion"',
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
  {
    id: 'multitable-mock-in-notin',
    version: 1,
    prompt: 'Find the first name and last name of unverified accounts who appear as buyers, but not as vendors in transactions',
    solution: `
  SELECT first_name, last_name
FROM accounts a
WHERE a.email_verified = FALSE
AND a.username IN (
	SELECT buyer
	FROM transactions
	)
	AND a. username NOT IN (
		SELECT vendor
		FROM transactions
		)
    `,
  },
  {
    id: 'multitable-mock-join-le',
    version: 1,
    prompt: 'List the name of products that have been sold at least once for less than half of their estimated value',
    solution: `
  SELECT p.name
FROM products p
JOIN transactions t
ON t.prod_id = p.p_id
WHERE t.price < 0.5*p.est_value
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
