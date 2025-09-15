export const config = {
  hints: [
    "Combine conditions with AND",
    "Order results with ORDER BY",
  ],
};

export function generate(utils) {
  const country = 'United States';
  const minSalary = utils.generateRandomNumber(110000, 140000);
  return {
    id: 'multi-criterion',
    description: `List company_name and salary for positions in ${country} with salary greater than ${minSalary}, ordered by salary descending.`,
    expectedQuery: `SELECT company_name, salary FROM positions WHERE country = '${country}' AND salary > ${minSalary} ORDER BY salary DESC`,
  };
}

export function validate(input, state) {
  if (!state || !state.expectedQuery) return false;
  const normalize = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');
  return normalize(input) === normalize(state.expectedQuery);
}

export const solutionTemplate = `{{expectedQuery}};`;

