import {
  buildSimpleSQLExercise,
  type SimpleSQLExerciseDefinition,
} from '@sqlvalley/sql';
import type { AnyExerciseDefinition } from '@sqlvalley/exercise-engine';
import { SqlPracticeProvider } from '@/curriculum/utils/SqlPracticeProvider';

type Parameters = Record<string, never>;

const EXERCISES: SimpleSQLExerciseDefinition<Parameters>[] = [
  {
    exerciseId: 'filter-rows-lt-amount',
    version: 1,
    generateParameters: () => ({}),
    problem: 'Retrieve all contracts with performance score under 80.',
    solution: `
SELECT *
FROM contracts
WHERE perf_score < 80;
    `,
  },
  {
    exerciseId: 'filter-rows-equal-date',
    version: 1,
    generateParameters: () => ({}),
    problem: 'Retrieve all contracts where the start date and end date are the same.',
    solution: `
SELECT *
FROM contracts
WHERE start_date = end_date;
    `,
  },
  {
    exerciseId: 'filter-rows-string-like',
    version: 1,
    generateParameters: () => ({}),
    problem: 'Retrieve all contracts that have the word "sick" anywhere in the status.',
    solution: `
SELECT *
FROM contracts
WHERE status LIKE '%sick%';
    `,
  },
];

export default function buildExercises(): AnyExerciseDefinition[] {
  return EXERCISES.map((exercise) => buildSimpleSQLExercise(exercise));
}

export const ModuleProvider = SqlPracticeProvider;
