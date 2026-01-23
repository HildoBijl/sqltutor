import { buildStaticExerciseModule, type ExerciseState as StaticExerciseState, type StaticExercise } from '@/learning/engine/staticExercise';

const EXERCISES: StaticExercise[] = [
  {
    id: 'filtered-aggregation-micro',
    version: 1,
    prompt: 'Retrieve the buyer ID and the number of transactions they appear in, where the amount of the transaction is less than 5, but that buyer\'s total amount spent is more than 20000.',
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
    prompt: 'Retrieve the department ID, average, and total expenses for teambuilding activities for departments where the average teambuilding expense exceeds 10,000.',
    solution: `
SELECT 
    d_id,
    AVG(amount) AS avg_expense,
    SUM(amount) AS total_expense
FROM expenses
WHERE description LIKE '%teambuilding%'
GROUP BY d_id
HAVING AVG(amount) > 10000;
    `,
  },
  {
    id: 'filtered-aggregation-perf-range',
    version: 1,
    prompt: 'Retrieve the employee ID, minimum, and maximum performance scores for employees whose performance score range exceeds 40.',
    solution: `
SELECT 
    e_id,
    MIN(perf_score) AS min_score,
    MAX(perf_score) AS max_score
FROM emp_data
GROUP BY e_id
HAVING max_score - min_score > 40;
    `,
  },
  {
    id: 'filtered-aggregation-rejected-tx',
    version: 1,
    prompt: 'Retrieve the vendor ID, total number of transactions, and number of rejected transactions for vendors with more than 50 rejected transactions.',
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
    prompt: 'Retrieve the product ID, total revenue, and number of transactions for products with an average transaction amount below 10 but total revenue above 20,000.',
    solution: `
SELECT 
    p_id,
    SUM(amount) AS revenue,
    COUNT(*) AS tx_count
FROM transactions
GROUP BY p_id
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
