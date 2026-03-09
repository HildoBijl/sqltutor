import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'multilayered-mock-dept-expense',
    version: 1,
    prompt: 'Retrieve the id, budget and total amount spent of all the departments whose total recorded expenses never exceeded their allocated budget',
    solution: `
  WITH dept_expenses AS (
	SELECT 
		d_id, SUM(amount) AS total_spent
	FROM expenses
	GROUP BY d_id
),
dept_budget AS (
	SELECT d_id, budget
	FROM departments
)
SELECT b.d_id, b.budget, e.total_spent
FROM dept_budget b
JOIN dept_expenses e 
	ON b.d_id = e.d_id
WHERE e.total_spent <= b.budget
    `,
  },
  {
    id: 'multilayered-mock-buyer-vendor',
    version: 1,
    prompt: 'Identify the username, amount spent and amount earned, for all users whose total revenue as vendor exceeds their total spending as buyer',
    solution: `
  WITH vendor_totals AS (
    SELECT vendor AS username, SUM(price) AS earned
    FROM transactions
    GROUP BY vendor
  ),
  buyer_totals AS (
    SELECT buyer AS username, SUM(price) AS spent
    FROM transactions
    GROUP BY buyer
  )
  SELECT v.username,
       v.earned,
       b.spent
  FROM vendor_totals v
  JOIN buyer_totals b
    ON v.username = b.username
  WHERE v.earned > b.spent;
    `,
  },
  {
    id: 'multilayered-mock-owners-not-buyers',
    version: 1,
    prompt: 'Retrieve the name of the products owned by users who never appear as buyers in any transaction',
    solution: `
    WITH buyers AS (
    SELECT DISTINCT buyer
    FROM transactions
  ),
  eligible_owners AS (
    SELECT username
    FROM accounts
    WHERE username NOT IN (
      SELECT buyer
      FROM buyers
    )
  )
  SELECT p.name
  FROM products p
  JOIN eligible_owners o
    ON p.owned_by = o.username
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
