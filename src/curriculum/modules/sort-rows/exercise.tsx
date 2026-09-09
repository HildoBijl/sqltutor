import {
  buildSimpleSQLExercise,
  type SimpleSQLExerciseDefinition,
} from '@sqlvalley/sql';
import type { AnyExerciseDefinition } from '@sqlvalley/exercise-engine';
import { SqlPracticeProvider } from '@/curriculum/utils/SqlPracticeProvider';

type Parameters = Record<string, never>;

const EXERCISES: SimpleSQLExerciseDefinition<Parameters>[] = [
  {
    exerciseId: 'sort-by-perf-salary',
    version: 1,
    generateParameters: () => ({}),
    problem: 'Retrieve all contracts, sorted first by performance score ascending, and for equal scores, by salary descending.',
    solution: `
SELECT *
FROM contracts
ORDER BY perf_score ASC, salary DESC;
    `,
  },
  {
    exerciseId: 'sort-dept-budget-skip',
    version: 1,
    generateParameters: () => ({}),
    problem: 'Retrieve 5 departments with the smallest budgets, skipping the first 3. Put departments with unknown budget at the end.',
    solution: `
SELECT *
FROM departments
ORDER BY budget ASC NULLS LAST
LIMIT 5 OFFSET 3;
    `,
  },
  {
    exerciseId: 'sort-end-date-null-last',
    version: 1,
    generateParameters: () => ({}),
    problem: 'Retrieve all contracts of all employees, ordered by end date with later end dates shown first. Put everyone with an unlimited contract at the start.',
    solution: `
SELECT *
FROM contracts
ORDER BY end_date DESC NULLS FIRST;
    `,
  },
];

export default function buildExercises(): AnyExerciseDefinition[] {
  return EXERCISES.map((exercise) => buildSimpleSQLExercise(exercise));
}

export const ModuleProvider = SqlPracticeProvider;
