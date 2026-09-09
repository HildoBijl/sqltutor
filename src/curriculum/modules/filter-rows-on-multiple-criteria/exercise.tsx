import {
  buildSimpleSQLExercise,
  type SimpleSQLExerciseDefinition,
} from '@sqlvalley/sql';
import type { AnyExerciseDefinition } from '@sqlvalley/exercise-engine';
import { SqlPracticeProvider } from '@/curriculum/utils/SqlPracticeProvider';

type Parameters = Record<string, never>;

const EXERCISES: SimpleSQLExerciseDefinition<Parameters>[] = [
  {
    exerciseId: 'multi-filter-employees-between',
    version: 1,
    generateParameters: () => ({}),
    problem: 'Retrieve all departments where the number of employees is not between 10 and 20 (inclusive), and whose budget is known.',
    solution: `
SELECT *
FROM departments
WHERE nr_employees NOT BETWEEN 10 AND 20
  AND budget IS NOT NULL;
    `,
  },
  {
    exerciseId: 'multi-filter-on-leave',
    version: 1,
    generateParameters: () => ({}),
    problem: 'Retrieve all contracts where the employee is either on sick leave or paid leave, and the end date is after 2024.',
    solution: `
SELECT *
FROM contracts
WHERE (status = 'paid leave' OR status = 'sick leave')
  AND end_date > '2024-12-31';
    `,
  },
  {
    exerciseId: 'multi-filter-phone-area',
    version: 1,
    generateParameters: () => ({}),
    problem: 'Retrieve all employees whose phone number starts with 408 and who live in either Mountain View or Santa Clara.',
    solution: `
SELECT *
FROM employees
WHERE phone LIKE '408%'
  AND (city = 'Mountain View' OR city = 'Santa Clara');
    `,
  },
//   {
//     id: 'multi-filter-amount-between',
//     prompt: 'Retrieve all transactions where the amount is not between 100 and 1000 (inclusive) and were not validated by any employee.',
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
// WHERE (vendor IS NULL OR buyer IS NULL)
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

export default function buildExercises(): AnyExerciseDefinition[] {
  return EXERCISES.map((exercise) => buildSimpleSQLExercise(exercise));
}

export const ModuleProvider = SqlPracticeProvider;
