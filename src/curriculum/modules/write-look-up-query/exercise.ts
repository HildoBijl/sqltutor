import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'lookup-manager-city',
    version: 1,
    prompt: 'Find the names of the departments whose manager lives in Palo Alto.',
    solution: `
SELECT d_name
FROM departments
WHERE manager_id IN (
    SELECT e_id
    FROM employees
    WHERE city = 'Palo Alto'
);
    `,
  },
  {
    id: 'lookup-employee-position',
    version: 1,
    prompt: 'Find the first and last name of all employees that have ever worked as a warehouse associate.',
    solution: `
SELECT first_name, last_name
FROM employees
WHERE e_id IN (
    SELECT e_id
    FROM emp_data
    WHERE position = 'warehouse associate'
);
    `,
  },
  {
    id: 'lookup-manager-sick',
    version: 1,
    prompt: 'Find the names of the departments whose manager has at some point been on sick leave.',
    solution: `
SELECT d_name
FROM departments
WHERE manager_id IN (
    SELECT e_id
    FROM emp_data
    WHERE status = 'sick leave'
);
    `,
  },
  //   {
  //     id: 'lookup-validator-names',
  //     prompt: 'Retrieve the names of employees who appear as validators in transactions where the customer ID is the same as the vendor ID.',
  //     solution: `
  // SELECT first_name, last_name
  // FROM employees
  // WHERE e_id IN (
  //   SELECT validated_by
  //   FROM transactions
  //   WHERE buyer_id = vendor_id
  // );
  //     `,
  //   },
  //   {
  //     id: 'lookup-before-vendor-created',
  //     prompt: 'Retrieve all transactions that occurred before the corresponding vendor’s registration date.',
  //     solution: `
  // SELECT *
  // FROM transactions t
  // WHERE t.date_time < (
  //     SELECT a.created_at
  //     FROM accounts a
  //     WHERE a.acct_id = t.vendor_id
  // );
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
