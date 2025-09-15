export const config = {
  hints: [
    "Combine conditions with AND/OR",
    "Use > for numeric comparisons",
  ],
};

export function generate(utils) {
  const countries = ['United States', 'Netherlands'];
  const country = utils.selectRandomly(countries);
  const minSalary = utils.generateRandomNumber(90000, 140000);
  return {
    id: 'filter-multi',
    description: `Find all positions in ${country} with salary greater than ${minSalary}.`,
    expectedQuery: `SELECT * FROM positions WHERE country = '${country}' AND salary > ${minSalary}`,
  };
}

export function validate(input, state, result) {
  if (!state || !state.expectedQuery) return false;
  const normalize = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');
  return normalize(input) === normalize(state.expectedQuery);
}

export const solutionTemplate = `{{expectedQuery}};`;

