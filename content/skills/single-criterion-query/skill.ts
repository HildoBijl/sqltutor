export const config = {
  hints: [
    "List columns after SELECT",
    "Add WHERE to filter rows",
  ],
};

export function generate(utils) {
  const countries = ['Netherlands', 'United States'];
  const country = utils.selectRandomly(countries);
  return {
    id: 'single-criterion',
    description: `Select company_name and country for companies in ${country}.`,
    expectedQuery: `SELECT company_name, country FROM companies WHERE country = '${country}'`,
  };
}

export function validate(input, state) {
  if (!state || !state.expectedQuery) return false;
  const normalize = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');
  return normalize(input) === normalize(state.expectedQuery);
}

export const solutionTemplate = `{{expectedQuery}};`;

