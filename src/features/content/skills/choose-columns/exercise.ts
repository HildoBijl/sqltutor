import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '../shared/simpleExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'choose-columns-contacts',
    prompt: 'List the first name, last name, email, and phone number of all employees.',
    solution: `
SELECT first_name, last_name, email, phone
FROM employees;
    `,
  },
  {
    id: 'choose-columns-emp-rating',
    prompt: 'Retrieve the employee ID, position, salary, and performance score (as rating) of all employees.',
    solution: `
SELECT e_id, position, salary, perf_score AS rating
FROM emp_data;
    `,
  },
  {
    id: 'choose-columns-cities',
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
