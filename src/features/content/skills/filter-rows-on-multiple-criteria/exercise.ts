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
    id: 'multi-filter-us-large',
    description: 'List companies from the United States with more than 100000 employees.',
    expectedQuery: "SELECT * FROM companies WHERE country = 'United States' AND num_employees > 100000",
  },
  {
    id: 'multi-filter-netherlands-tech',
    description: 'Find Dutch companies in the Technology industry.',
    expectedQuery: "SELECT * FROM companies WHERE country = 'Netherlands' AND industry = 'Technology'",
  },
  {
    id: 'multi-filter-uk-or-us',
    description: 'Return companies based in the United Kingdom or the United States that were founded after 2000.',
    expectedQuery: "SELECT * FROM companies WHERE (country = 'United Kingdom' OR country = 'United States') AND founded_year > 2000",
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
