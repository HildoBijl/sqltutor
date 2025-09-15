export const config = {
  hints: [
    "List columns after SELECT",
    "Use AS to rename columns",
  ],
};

export function generate(utils) {
  const options = [
    ['company_name', 'country'],
    ['company_name', 'founded_year'],
    ['company_name', 'num_employees'],
  ];
  const cols = utils.selectRandomly(options);
  const select = cols.join(', ');
  return {
    id: 'choose-columns',
    description: `Select the columns ${cols.join(' and ')} from the companies table.`,
    expectedQuery: `SELECT ${select} FROM companies`,
  };
}

export function validate(input, state) {
  if (!state || !state.expectedQuery) return false;
  const normalize = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');
  return normalize(input) === normalize(state.expectedQuery);
}

export const solutionTemplate = `{{expectedQuery}};`;

