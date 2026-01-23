import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'join-managers-hire-date',
    version: 1,
    prompt: 'Retrieve the department names and manager names (first and last) of all departments whose manager was hired before 2018.',
    solution: `
SELECT d_name, first_name, last_name
FROM departments AS d
JOIN employees AS e
ON d.manager_id = e.e_id
WHERE e.hire_date < '2018-01-01';
    `,
  },
  {
    id: 'join-employee-positions',
    version: 1,
    prompt: 'For all employees, make a list of the positions they have had. Give the first name, the last name and the position. A person may have multiple entries in case of multiple positions, but there should be no duplicates. Also include employees who never had a position.',
    solution: `
SELECT DISTINCT first_name, last_name, position
FROM employees
NATURAL LEFT JOIN emp_data;
    `,
  },
  {
    id: 'join-employee-leave',
    version: 1,
    prompt: 'Create an overview of all sick leaves. More specific: find the names (first and last) of all employees who have been on sick leave. Also include the starting date and ending date of the respective contract in which they had sick leave. (In case of multiple contracts with sick leave, include multiple rows.)',
    solution: `
SELECT first_name, last_name, position, start_date, end_date
FROM employees
NATURAL JOIN emp_data
WHERE status = 'sick leave';
    `,
  },
  // {
  //     id: 'join-before-vendor-registered',
  //     prompt: 'Retrieve the product id and the username of the vendor from all transactions that occurred before that vendor\'s account was officially registered.',
  //     solution: `
  // SELECT t.prod_id, a.username
  // FROM transactions t
  // JOIN accounts a ON t.vendor_id = a.acct_id
  // WHERE t.date_time < a.created_at;
  //     `,
  //   },
  //   {
  //     id: 'join-same-day-accounts',
  //     prompt: 'Retrieve the names of vendors and customers whose accounts were created on the same date and participated in the same transaction.',
  //     solution: `
  // SELECT vendor.full_name, customer.full_name
  // FROM transactions AS t
  // JOIN accounts AS vendor ON vendor.acct_id = t.vendor_id
  // JOIN accounts AS customer ON customer.acct_id = t.buyer_id
  // WHERE vendor.created_at = customer.created_at;
  //     `,
  //   },
  //   {
  //     id: 'join-product-not-owner',
  //     prompt: 'Retrieve the product name and the amount it was sold for for all transactions where the product was sold by someone other than its owner.',
  //     solution: `
  // SELECT t.amount, p.name
  // FROM transactions t
  // JOIN products p ON t.prod_id = p.p_id
  // WHERE t.vendor_id != p.owner_id;
  //     `,
  //   },
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
