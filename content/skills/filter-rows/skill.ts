export const config = {
  hints: [
    "Use the WHERE clause to filter rows",
    "Strings need single quotes: WHERE column = 'value'",
    "Use LIKE with % for patterns"
  ],
};

export function generate(utils) {
  const modes = ['country', 'prefix'];
  const mode = utils.selectRandomly(modes);
  if (mode === 'country') {
    const countries = ['Netherlands', 'United States', 'United Kingdom'];
    const country = utils.selectRandomly(countries);
    return {
      id: 'filter-by-country',
      description: `Find all companies from ${country}.`,
      expectedQuery: `SELECT * FROM companies WHERE country = '${country}'`,
    };
  } else {
    const letters = ['M', 'G', 'T'];
    const letter = utils.selectRandomly(letters);
    return {
      id: 'filter-with-pattern',
      description: `Find all companies whose name starts with ${letter}.`,
      expectedQuery: `SELECT * FROM companies WHERE company_name LIKE '${letter}%'`,
    };
  }
}

export function validate(input, state, result) {
  if (!state || !state.expectedQuery) return false;
  const normalize = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');
  return normalize(input) === normalize(state.expectedQuery);
}

export const solutionTemplate = `{{expectedQuery}};`;

