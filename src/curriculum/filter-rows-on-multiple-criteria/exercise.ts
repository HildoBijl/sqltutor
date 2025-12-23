import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'multi-filter-employees-between',
    prompt: 'Retrieve all departments where the number of employees is not between 10 and 20, and whose budget is known.',
    solution: `
SELECT *
FROM departments
WHERE nr_employees NOT BETWEEN 10 AND 20
  AND budget IS NOT NULL;
    `,
  },
  {
    id: 'multi-filter-on-leave',
    prompt: 'Retrieve all employee data records where the employee is either on sick leave or paid leave, and the end date is after 2024.',
    solution: `
SELECT *
FROM emp_data
WHERE (status = 'paid leave' OR status = 'sick leave')
  AND end_date > '2024-12-31';
    `,
  },
  {
    id: 'multi-filter-phone-area',
    prompt: 'Retrieve all employees whose phone number starts with 408 and who live in either Mountain View or Menlo Park.',
    solution: `
SELECT *
FROM employees
WHERE phone LIKE '408%'
  AND (city = 'Mountain View' OR city = 'Santa Clara');
    `,
  },
//   {
//     id: 'multi-filter-amount-between',
//     prompt: 'Retrieve all transactions where the amount is not between 100 and 1000 and were not validated by any employee.',
//     solution: `
// SELECT *
// FROM transactions
// WHERE amount NOT BETWEEN 100 AND 1000
//   AND validated_by IS NULL;
//     `,
//   },
//   {
//     id: 'multi-filter-approved-null',
//     prompt: 'Retrieve all transactions with status approved where either the buyer or the vendor are undefined.',
//     solution: `
// SELECT *
// FROM transactions
// WHERE (vendor_id IS NULL OR buyer_id IS NULL)
//   AND status = 'approved';
//     `,
//   },
//   {
//     id: 'multi-filter-expenses-first-day',
//     prompt: 'Retrieve the id of the departments that have registered expenses on the first day of any month of 2025, requested and approved by the same employee.',
//     solution: `
// SELECT d_id
// FROM expenses
// WHERE date LIKE '2025-__-01'
//   AND requested_by = approved_by;
//     `,
//   },
//   {
//     id: 'multi-filter-expenses-lorem',
//     prompt: 'Retrieve all expenses with descriptions starting with Lorem or which occurred before 2005-09-20.',
//     solution: `
// SELECT *
// FROM expenses
// WHERE description LIKE 'Lorem%' OR date < '2005-09-20';
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
} = buildStaticExerciseModule(EXERCISES);
