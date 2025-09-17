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
    id: 'processed-columns-employees',
    description: 'Show company name and employees expressed in thousands (round down to one decimal place).',
    expectedQuery: 'SELECT company_name, ROUND(num_employees / 1000.0, 1) AS employees_in_thousands FROM companies',
  },
  {
    id: 'processed-columns-age',
    description: 'List company name together with its age in years, assuming the current year is 2024.',
    expectedQuery: 'SELECT company_name, 2024 - founded_year AS age FROM companies',
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
