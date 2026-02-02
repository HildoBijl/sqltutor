import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
//   {
//     id: 'aggregate-revenue-year',
//     version: 1,
//     prompt: 'Retrieve the total revenue for each fiscal year.',
//     solution: `
// SELECT fiscal_year, SUM(revenue)
// FROM quarterly_performance
// GROUP BY fiscal_year;
//     `,
//   },
//   {
//     id: 'aggregate-avg-growth',
//     version: 1,
//     prompt: 'Retrieve the average growth rate for each quarter of every fiscal year.',
//     solution: `
// SELECT fiscal_year, quarter, AVG(growth_rate)
// FROM quarterly_performance
// GROUP BY fiscal_year, quarter;
//     `,
//   },
  {
    id: 'aggregate-max-min-revenue',
    version: 1,
    prompt: 'Create an overview of all fiscal years and, for each respective fiscal year, the lowest and highest revenue obtained in any of its quarters.',
    solution: `
SELECT fiscal_year, MIN(revenue) AS min_revenue, MAX(revenue) AS max_revenue
FROM quarterly_performance
GROUP BY fiscal_year;
    `,
  },
  {
    id: 'aggregate-total-expenses',
    version: 1,
    prompt: 'Create an overview of the IDs of all departments that ever had expenses and, for each respective department, the total expenses incurred.',
    solution: `
SELECT d_id, SUM(amount) AS total_expenses
FROM expenses
GROUP BY d_id;
    `,
  },
  {
    id: 'aggregate-highest-expenses',
    version: 1,
    prompt: 'Create an overview of the IDs of all departments that ever had expenses and, for each respective department, the highest expense it ever incurred.',
    solution: `
SELECT d_id, MAX(amount) AS highest_expense
FROM expenses
GROUP BY d_id;
    `,
  },
//   {
//     id: 'aggregate-negative-growth-count',
//     version: 1,
//     prompt: 'Count the number of quarters with negative growth.',
//     solution: `
// SELECT COUNT(*) AS low_growth_quarters
// FROM quarterly_performance
// WHERE growth_rate < 0.0;
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
