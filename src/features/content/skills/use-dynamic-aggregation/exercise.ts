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
    id: 'dynamic-industry',
    description: 'Produce company counts grouped dynamically by industry.',
    expectedQuery: 'SELECT industry, COUNT(*) AS company_count FROM companies GROUP BY industry',
  },
  {
    id: 'dynamic-country',
    description: 'Produce company counts grouped dynamically by country.',
    expectedQuery: 'SELECT country, COUNT(*) AS company_count FROM companies GROUP BY country',
  },
  {
    id: 'dynamic-founded',
    description: 'Aggregate the average employee count grouped by founded year.',
    expectedQuery: 'SELECT founded_year, AVG(num_employees) AS avg_employees FROM companies GROUP BY founded_year',
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
