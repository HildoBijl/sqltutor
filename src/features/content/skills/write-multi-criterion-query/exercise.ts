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
    id: 'multi-criterion-europe',
    description: 'Find consulting companies in the Netherlands with more than 50000 employees.',
    expectedQuery: "SELECT * FROM companies WHERE country = 'Netherlands' AND industry = 'Consulting' AND num_employees > 50000",
  },
  {
    id: 'multi-criterion-tech-regions',
    description: 'List technology companies from the Netherlands or United States that were founded after 1995.',
    expectedQuery: "SELECT * FROM companies WHERE industry = 'Technology' AND (country = 'Netherlands' OR country = 'United States') AND founded_year > 1995",
  },
  {
    id: 'multi-criterion-older',
    description: 'Show companies founded before 1980 that are not based in the United States.',
    expectedQuery: "SELECT company_name, country FROM companies WHERE founded_year < 1980 AND country <> 'United States'",
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
