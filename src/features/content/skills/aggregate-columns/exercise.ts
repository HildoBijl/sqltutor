import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'aggregate-revenue-year',
    prompt: 'Retrieve the total revenue for each fiscal year.',
    solution: `
SELECT fiscal_year, SUM(revenue)
FROM quarterly_performance
GROUP BY fiscal_year;
    `,
  },
  {
    id: 'aggregate-avg-growth',
    prompt: 'Retrieve the average growth rate for each quarter of every fiscal year.',
    solution: `
SELECT fiscal_year, quarter, AVG(growth_rate)
FROM quarterly_performance
GROUP BY fiscal_year, quarter;
    `,
  },
  {
    id: 'aggregate-max-min-revenue',
    prompt: 'Retrieve the maximum and minimum revenue for each fiscal year.',
    solution: `
SELECT fiscal_year, MAX(revenue) AS max_revenue, MIN(revenue) AS min_revenue
FROM quarterly_performance
GROUP BY fiscal_year;
    `,
  },
  {
    id: 'aggregate-total-expenses',
    prompt: 'Retrieve the total expenses for each department.',
    solution: `
SELECT d_id, SUM(amount) AS total_expenses
FROM expenses
GROUP BY d_id;
    `,
  },
  {
    id: 'aggregate-negative-growth-count',
    prompt: 'Count the number of quarters with negative growth.',
    solution: `
SELECT COUNT(*) AS low_growth_quarters
FROM quarterly_performance
WHERE growth_rate < 0.0;
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
