import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
//   {
//     id: 'filtered-aggregation-micro',
//     version: 1,
//     prompt: 'Any transaction whose amount is less than 5 is considered a microtransaction. Create an overview of the buyers (their IDs) and the number of microtransactions they have made. Limit the output to buyers whose total amount spent is more than 20000.',
//     solution: `
// SELECT 
//   buyer,
//   COUNT(*) AS num_micro_tx
// FROM transactions
// WHERE amount < 5.00        
// GROUP BY buyer
// HAVING SUM(amount) > 20000;
//     `,
//   },
//   {
//     id: 'filtered-aggregation-teambuilding',
//     version: 1,
//     prompt: 'Any expenses that have "teambuilding" in their description are considered teambuilding expenses. Create an overview of the departments (their IDs), their total teambuilding expenses, and their average teambuilding expenses per expense listing. Limit the output to departments whose average teambuilding expenses exceed 10,000.',
//     solution: `
// SELECT 
//   d_id,
//   SUM(amount) AS total_expenses,
//   AVG(amount) AS average_expenses
// FROM expenses
// WHERE description LIKE '%teambuilding%'
// GROUP BY d_id
// HAVING AVG(amount) > 10000;
//     `,
//   },
  {
    id: 'filtered-aggregation-perf-range',
    version: 1,
    prompt: 'Create an overview of all employees (their IDs) and their lowest and highest performance score ever obtained since January 1st, 2020 (going by contract end date). Limit the output to fluctuating employees: those where the difference between the lowest and highest score in this time period exceeds 40.',
    solution: `
SELECT 
  e_id,
  MIN(perf_score) AS lowest_score,
  MAX(perf_score) AS highest_score
FROM contracts
WHERE end_date >= '2020-01-01'
GROUP BY e_id
HAVING MAX(perf_score) - MIN(perf_score) > 40;
    `,
  },
  {
    id: 'filtered-aggregation-rejected-tx',
    version: 1,
    prompt: 'Create an overview of all vendors (their usernames), their total number of transactions with price larger than ten million, and the number of these that were rejected. Limit the output to those vendors with more than three such rejected large transactions.',
    solution: `
SELECT 
  vendor,
  COUNT(*) AS total_tx,
  SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_tx
FROM transactions
WHERE price > 10000000
GROUP BY vendor
HAVING SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) > 3;
    `,
  },
  {
    id: 'filtered-aggregation-product-revenue',
    version: 1,
    prompt: 'Create an overview of all products (their IDs), the number of incomplete transactions, and the total revenue from those incomplete transactions. Limit the output to those products whose average transaction value at these incomplete transactions is less than one million.',
    solution: `
SELECT 
    prod_id,
    COUNT(*) AS tx_count,
    SUM(price) AS revenue
FROM transactions
WHERE status <> 'completed'
GROUP BY prod_id
HAVING AVG(price) < 1000000;
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
  listExercises,
  getExerciseById,
} = buildStaticExerciseModule(EXERCISES);
