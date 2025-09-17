export interface ExerciseState {
  id: string;
  description: string;
  expectedQuery: string;
}

type Utils = {
  selectRandomly: <T>(items: readonly T[]) => T;
};

const scenarios: readonly ExerciseState[] = [
  {
    id: 'filtered-aggregation-avg',
    description: 'Find industries where the average number of employees exceeds 120000.',
    expectedQuery: 'SELECT industry, AVG(num_employees) AS avg_employees FROM companies GROUP BY industry HAVING AVG(num_employees) > 120000',
  },
  {
    id: 'filtered-aggregation-country',
    description: "List countries with at least two technology companies.",
    expectedQuery: "SELECT country, COUNT(*) AS tech_companies FROM companies WHERE industry = 'Technology' GROUP BY country HAVING COUNT(*) >= 2",
  },
  {
    id: 'filtered-aggregation-total',
    description: 'Return industries whose total headcount surpasses 300000 employees.',
    expectedQuery: 'SELECT industry, SUM(num_employees) AS total_employees FROM companies GROUP BY industry HAVING SUM(num_employees) > 300000',
  },
];

export function generate(utils: Utils): ExerciseState {
  return utils.selectRandomly(scenarios);
}

function normalize(query: string) {
  return query.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');
}

export function validate(input: string, state: ExerciseState | null, _result: unknown) {
  if (!state) return false;
  return normalize(input) === normalize(state.expectedQuery);
}

export const solutionTemplate = '{{expectedQuery}};';
