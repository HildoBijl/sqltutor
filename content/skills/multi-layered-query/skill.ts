export const config = {
  hints: [
    "Use a subquery to compute an aggregate",
    "Compare salary against a subquery result",
  ],
};

export function generate(utils) {
  return {
    id: 'multi-layered',
    description: 'Select positions with salary greater than the average salary.',
    expectedQuery: 'SELECT * FROM positions WHERE salary > (SELECT AVG(salary) FROM positions)',
  };
}

export function validate(input, state) {
  if (!state || !state.expectedQuery) return false;
  const normalize = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');
  return normalize(input) === normalize(state.expectedQuery);
}

export const solutionTemplate = `{{expectedQuery}};`;

