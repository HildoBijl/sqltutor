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
    id: 'single-criterion-country',
    description: 'Show company name and country for organisations based in the Netherlands.',
    expectedQuery: "SELECT company_name, country FROM companies WHERE country = 'Netherlands'",
  },
  {
    id: 'single-criterion-founded',
    description: 'Retrieve all companies founded before 1980.',
    expectedQuery: 'SELECT * FROM companies WHERE founded_year < 1980',
  },
  {
    id: 'single-criterion-industry',
    description: 'List technology companies with their employee counts.',
    expectedQuery: "SELECT company_name, num_employees FROM companies WHERE industry = 'Technology'",
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
