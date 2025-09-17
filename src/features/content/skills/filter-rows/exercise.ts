export interface ExerciseState {
  id: string;
  description: string;
  expectedQuery: string;
}

type Utils = {
  selectRandomly: <T>(items: readonly T[]) => T;
};

export function generate(utils: Utils): ExerciseState {
  const modes = ['country', 'prefix'] as const;
  const mode = utils.selectRandomly(modes);
  if (mode === 'country') {
    const countries = ['Netherlands', 'United States', 'United Kingdom'];
    const country = utils.selectRandomly(countries);
    return {
      id: 'filter-by-country',
      description: 'Find all companies from ' + country + '.',
      expectedQuery: "SELECT * FROM companies WHERE country = '" + country + "'",
    };
  }

  const letters = ['M', 'G', 'T'] as const;
  const letter = utils.selectRandomly(letters);
  return {
    id: 'filter-with-pattern',
    description: 'Find all companies whose name starts with ' + letter + '.',
    expectedQuery: "SELECT * FROM companies WHERE company_name LIKE '" + letter + "%'",
  };
}

export function validate(input: string, state: ExerciseState | null, _result: unknown) {
  if (!state?.expectedQuery) return false;
  const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');
  return normalize(input) === normalize(state.expectedQuery);
}

export const solutionTemplate = '{{expectedQuery}};';
