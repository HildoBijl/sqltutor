import {
  buildSimpleSQLExercise,
  type SimpleSQLExerciseDefinition,
} from '@sqlvalley/sql';
import type { AnyExerciseDefinition } from '@sqlvalley/exercise-engine';
import { SqlPracticeProvider } from '@/curriculum/utils/SqlPracticeProvider';

type Parameters = Record<string, never>;

const EXERCISES: SimpleSQLExerciseDefinition<Parameters>[] = [
  {
    exerciseId: 'choose-columns-contacts',
    version: 1,
    generateParameters: () => ({}),
    problem: 'List the first name, last name, email, and phone number of all employees. Ensure that the phone number is called "number" as column name.',
    solution: `
SELECT
  first_name,
  last_name,
  email,
  phone AS number
FROM employees;
    `,
    comparisonOptions: {
      requireEqualColumnNames: true,
      requireEqualColumnOrder: false,
    },
  },
  {
    exerciseId: 'choose-columns-department-budgets',
    version: 1,
    generateParameters: () => ({}),
    problem: 'Retrieve the department ID, department name and budget of all departments. Ensure that the budget is called "available_money" as column name.',
    solution: `
SELECT
  d_id,
  d_name,
  budget AS available_money
FROM departments;
    `,
    comparisonOptions: {
      requireEqualColumnNames: true,
      requireEqualColumnOrder: false,
    },
  },
  {
    exerciseId: 'choose-columns-cities',
    version: 1,
    generateParameters: () => ({}),
    problem: 'Find the list of all cities in which the employees of the company live, without duplicates.',
    solution: `
SELECT DISTINCT city
FROM employees;
    `,
  },
];

export default function buildExercises(): AnyExerciseDefinition[] {
  return EXERCISES.map((exercise) => buildSimpleSQLExercise(exercise));
}

export const ModuleProvider = SqlPracticeProvider;
