import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '../shared/simpleExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'filter-rows-lt-amount',
    prompt: 'Retrieve all employee data records with performance score under 80.',
    solution: `
SELECT *
FROM emp_data
WHERE perf_score < 80;
    `,
  },
  {
    id: 'filter-rows-equal-date',
    prompt: 'Retrieve all employee data records where the start date and end date are the same.',
    solution: `
SELECT *
FROM emp_data
WHERE start_date = end_date;
    `,
  },
  {
    id: 'filter-rows-string-like',
    prompt: 'Retrieve all employee data records that have the word "sick" anywhere in the status.',
    solution: `
SELECT *
FROM emp_data
WHERE status LIKE '%sick%';
    `,
  },
  {
    id: 'filter-rows-gt-date',
    prompt: 'Find all employee data records for employees that started after 2023.',
    solution: `
SELECT *
FROM emp_data
WHERE start_date > '2023-12-31';
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
