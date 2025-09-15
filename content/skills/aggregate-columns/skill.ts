export const config = {
  hints: [
    "Use GROUP BY and COUNT",
    "Alias aggregates with AS",
  ],
};

export function generate(utils) {
  return {
    id: 'aggregate-columns',
    description: 'Count positions per country.',
    expectedQuery: 'SELECT country, COUNT(*) AS total FROM positions GROUP BY country',
  };
}

export function validate(input, state) {
  if (!state || !state.expectedQuery) return false;
  const normalize = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');
  return normalize(input) === normalize(state.expectedQuery);
}

export const solutionTemplate = `{{expectedQuery}};`;

