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
    id: 'pivot-country-counts',
    description: 'Build a pivot that counts companies per industry for the Netherlands and the United States.',
    expectedQuery: "SELECT industry, SUM(CASE WHEN country = 'Netherlands' THEN 1 ELSE 0 END) AS nl_companies, SUM(CASE WHEN country = 'United States' THEN 1 ELSE 0 END) AS us_companies FROM companies GROUP BY industry",
  },
  {
    id: 'pivot-employee-sum',
    description: 'Pivot the total number of employees per industry comparing the Netherlands and United Kingdom.',
    expectedQuery: "SELECT industry, SUM(CASE WHEN country = 'Netherlands' THEN num_employees ELSE 0 END) AS nl_employees, SUM(CASE WHEN country = 'United Kingdom' THEN num_employees ELSE 0 END) AS uk_employees FROM companies GROUP BY industry",
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
