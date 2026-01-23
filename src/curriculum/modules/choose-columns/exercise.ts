import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'choose-columns-contacts',
    version: 1,
    prompt: 'List the first name, last name, email, and phone number of all employees. Ensure that the phone number is called "number" as column name.',
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
    id: 'choose-columns-department-budgets',
    version: 1,
    prompt: 'Retrieve the department ID, department name and budget of all departments. Ensure that the budget is called "available_money" as column name.',
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
    id: 'choose-columns-cities',
    version: 1,
    prompt: 'Find the list of all cities in which the employees of the company live, without duplicates.',
    solution: `
SELECT DISTINCT city
FROM employees;
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
} = buildStaticExerciseModule(EXERCISES);
