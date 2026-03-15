import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'multilayered-mock-dept-expense',
    version: 1,
    prompt: 'Retrieve the id, budget and total amount spent of all the departments whose total recorded expenses never exceeded their allocated budget.',
    solution: `
WITH dept_expenses AS (
	SELECT d_id, SUM(amount) AS total_spent
	FROM expenses
	GROUP BY d_id
),
dept_budget AS (
	SELECT d_id, budget
	FROM departments
)
SELECT b.d_id, b.budget, e.total_spent
FROM dept_budget b
JOIN dept_expenses e ON b.d_id = e.d_id
WHERE e.total_spent <= b.budget
    `,
  },
  {
    id: 'multilayered-mock-buyer-vendor',
    version: 1,
    prompt: 'Identify the username, amount spent and amount earned, for all users whose total revenue as vendor exceeds their total spending as buyer.',
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
  SELECT v.username, v.earned, b.spent
  FROM vendor_totals v
  JOIN buyer_totals b ON v.username = b.username
  WHERE v.earned > b.spent;
    `,
  },
  // {
  //   id: 'multilayered-mock-owners-not-buyers',
  //   version: 1,
  //   prompt: 'Retrieve the name of the products owned by users who never appear as buyers in any transaction.',
  //   solution: `
  //   WITH buyers AS (
  //   SELECT DISTINCT buyer
  //   FROM transactions
  // ),
  // eligible_owners AS (
  //   SELECT username
  //   FROM accounts
  //   WHERE username NOT IN (
  //     SELECT buyer
  //     FROM buyers
  //   )
  // )
  // SELECT p.name
  // FROM products p
  // JOIN eligible_owners o
  //   ON p.owned_by = o.username
  //   `,
  // },
  {
    id: 'multilayered-wrong-employee-counts',
    version: 1,
    prompt: 'The employee count in the departments table seems to be inflated. Create an overview containing the department name, the number of employees as mentioned in the departments table, the total number of employees allocated to the department, the total number of employees that are ONLY allocated to this department, and the first and last name of the department manager. Only show those rows for departments where the difference between the estimated number of employees and the number of employees only allocated to this department is larger than 3.',
    solution: `
WITH emp_alloc_count AS (
	SELECT e_id, COUNT(d_id) AS alloc_count
	FROM allocations
	GROUP BY e_id
),
single_allocations AS (
	SELECT a.e_id, a.d_id
	FROM allocations a
	JOIN emp_alloc_count c ON a.e_id = c.e_id
	WHERE c.alloc_count = 1
),
total_allocations AS (
	SELECT d_id, COUNT(e_id) AS total_allocated
	FROM allocations
	GROUP BY d_id
),
single_alloc_per_dept AS (
	SELECT d_id, COUNT(e_id) AS only_allocated
	FROM single_allocations
	GROUP BY d_id
)
SELECT 
    d.d_name,
    d.nr_employees AS estimated_employees,
    ta.total_allocated,
    COALESCE(sa.only_allocated, 0) AS only_in_this_department,
    m.first_name,
    m.last_name
FROM departments d
JOIN total_allocations ta ON d.d_id = ta.d_id
JOIN single_alloc_per_dept sa ON d.d_id = sa.d_id
JOIN employees m ON d.manager_id = m.e_id
WHERE d.nr_employees - COALESCE(sa.only_allocated, 0) > 3;
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
