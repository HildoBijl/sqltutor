export const config = {
  hints: [
    "Use ORDER BY column ASC/DESC",
    "Use LIMIT to restrict rows",
  ],
};

export function generate(utils) {
  const order = utils.selectRandomly(['ASC', 'DESC']);
  return {
    id: 'sort-rows',
    description: `List the top 5 companies by num_employees (${order}).`,
    expectedQuery: `SELECT * FROM companies ORDER BY num_employees ${order} LIMIT 5`,
  };
}

export function validate(input, state) {
  if (!state || !state.expectedQuery) return false;
  const normalize = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');
  return normalize(input) === normalize(state.expectedQuery);
}

export const solutionTemplate = `{{expectedQuery}};`;

