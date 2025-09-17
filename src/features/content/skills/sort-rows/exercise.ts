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
    id: 'sort-by-employees',
    description: 'Return the three largest companies by number of employees.',
    expectedQuery: 'SELECT * FROM companies ORDER BY num_employees DESC LIMIT 3',
  },
  {
    id: 'sort-by-country-name',
    description: 'List companies ordered by country (A–Z) and company name descending within each country.',
    expectedQuery: 'SELECT * FROM companies ORDER BY country ASC, company_name DESC',
  },
  {
    id: 'sort-offset',
    description: 'Show two companies after skipping the first result when sorting by founded year ascending.',
    expectedQuery: 'SELECT * FROM companies ORDER BY founded_year ASC LIMIT 2 OFFSET 1',
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
