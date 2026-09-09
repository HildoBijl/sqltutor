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
    problem: 'Find the first name and last name of accounts who appear as buyers in transactions related to "Musical Instruments" products, but never sold anything (of any type).',
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
    problem: 'Retrieve the usernames of all users who have at some point bought one or more products from the "Fine Art" category, and who also appear as owners of products categorized as "Designer Fashion".',
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
    exerciseId: 'multitable-universal-query',
    version: 1,
    generateParameters: () => ({}),
    problem: 'Find the product categories of which all transactions have been validated by employees whose current salary is less than 200000.',
    solution: `
SELECT DISTINCT category FROM products
EXCEPT
SELECT DISTINCT category FROM products WHERE p_id IN (
  SELECT prod_id FROM transactions WHERE validated_by IN (
    SELECT e_id FROM employees WHERE current_salary >= 200000
  )
)
    `,
    // Some other solutions that are also correct. Implement them later on in the actual solution explanation as other options.
    //     solution: `
    // SELECT DISTINCT category FROM products AS p
    // WHERE NOT EXISTS (
    //   SELECT 1
    //   FROM transactions
    //   WHERE prod_id IN (
    //     SELECT p_id FROM products AS p2 WHERE p.category = p2.category 
    //   ) AND validated_by IN (
    //     SELECT e_id FROM employees WHERE current_salary >= 200000
    //   )
    // )    
    //     `,
    //     solution: `
    // SELECT DISTINCT category
    // FROM product
    // EXCEPT
    // SELECT DISTINCT p.category
    // FROM product p
    // JOIN transaction t ON t.prod_id = p.p_id
    // JOIN employee e ON e.e_id = t.validated_by
    // WHERE e.current_salary >= 200000;    
    //     `,
  },
];

export default function buildExercises(): AnyExerciseDefinition[] {
  return EXERCISES.map((exercise) => buildSimpleSQLExercise(exercise));
}

export const ModuleProvider = SqlPracticeProvider;
