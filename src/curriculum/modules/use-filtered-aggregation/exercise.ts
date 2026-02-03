import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'filtered-aggregation-micro',
    version: 1,
    prompt: '[Exercise is under development: data may not be present yet.] Any transaction whose amount is less than 5 is considered a microtransaction. Create an overview of the buyers (their IDs) and the number of microtransactions they have made. Limit the output to buyers whose total amount spent is more than 20000.',
    solution: `
SELECT 
  buyer_id,
  COUNT(*) AS num_micro_tx
FROM transactions
WHERE amount < 5.00        
GROUP BY buyer_id
HAVING SUM(amount) > 20000;
    `,
  },
  {
    id: 'filtered-aggregation-teambuilding',
    version: 1,
    prompt: '[Exercise is under development: data may not be present yet.] Any expenses that have "teambuilding" in their description are considered teambuilding expenses. Create an overview of the departments (their IDs), their total teambuilding expenses, and their average teambuilding expenses per expense listing. Limit the output to departments whose average teambuilding expenses exceed 10,000.',
    solution: `
SELECT 
  d_id,
  SUM(amount) AS total_expenses,
  AVG(amount) AS average_expenses
FROM expenses
WHERE description LIKE '%teambuilding%'
GROUP BY d_id
HAVING AVG(amount) > 10000;
    `,
  },
  {
    id: 'filtered-aggregation-perf-range',
    version: 1,
    prompt: 'Create an overview of all employees (their IDs) and their lowest and highest performance score ever obtained. Limit the output to fluctuating employees: those where the difference between the lowest and highest score exceeds 40.',
    solution: `
SELECT 
  e_id,
  MIN(perf_score) AS lowest_score,
  MAX(perf_score) AS highest_score
FROM emp_data
GROUP BY e_id
HAVING MAX(perf_score) - MIN(perf_score) > 40;
    `,
  },
  {
    id: 'filtered-aggregation-rejected-tx',
    version: 1,
    prompt: '[Exercise is under development: data may not be present yet.] Create an overview of all vendors (their IDs), their total number of transactions, and the number of rejected transactions. Limit the output to those vendors with more than 50 rejected transactions.',
    solution: `
SELECT 
  vendor_id,
  COUNT(*) AS total_tx,
  SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_tx
FROM transactions
GROUP BY vendor_id
HAVING SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) > 50;
    `,
  },
  {
    id: 'filtered-aggregation-product-revenue',
    version: 1,
    prompt: '[Exercise is under development: data may not be present yet.] Create an overview of all products (their IDs), the number of times it has been sold, and the total revenue obtained from the product. Limit the output to products whose total revenue is more than 20,000, yet the average transaction value is less than 10.',
    solution: `
SELECT 
    prod_id,
    COUNT(*) AS tx_count,
    SUM(amount) AS revenue
FROM transactions
GROUP BY prod_id
HAVING AVG(amount) < 10 AND SUM(amount) > 20000;
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
