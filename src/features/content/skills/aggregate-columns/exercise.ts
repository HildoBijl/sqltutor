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
    id: 'aggregate-count-country',
    description: 'Count how many companies exist in each country.',
    expectedQuery: 'SELECT country, COUNT(*) AS company_count FROM companies GROUP BY country',
  },
  {
    id: 'aggregate-average-employees',
    description: 'Calculate the average number of employees per industry.',
    expectedQuery: 'SELECT industry, AVG(num_employees) AS avg_employees FROM companies GROUP BY industry',
  },
  {
    id: 'aggregate-max-founded',
    description: 'Find the most recent founding year per country.',
    expectedQuery: 'SELECT country, MAX(founded_year) AS latest_founded_year FROM companies GROUP BY country',
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
