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
    id: 'choose-columns-basic',
    description: 'Return company name and industry from the companies table.',
    expectedQuery: 'SELECT company_name, industry FROM companies',
  },
  {
    id: 'choose-columns-alias',
    description: 'Select company name and number of employees, renaming the numeric column to employees.',
    expectedQuery: 'SELECT company_name, num_employees AS employees FROM companies',
  },
  {
    id: 'choose-columns-location',
    description: 'Retrieve company name together with country and founded year.',
    expectedQuery: 'SELECT company_name, country, founded_year FROM companies',
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
