export const config = {
  hints: [
    "JOIN on company_id",
    "Group by the joined column",
  ],
};

export function generate(utils) {
  return {
    id: 'multi-table',
    description: 'Count positions per company country using a join.',
    expectedQuery: 'SELECT c.country, COUNT(*) AS total FROM positions p JOIN companies c ON p.company_id = c.id GROUP BY c.country',
  };
}

export function validate(input, state) {
  if (!state || !state.expectedQuery) return false;
  const normalize = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');
  return normalize(input) === normalize(state.expectedQuery);
}

export const solutionTemplate = `{{expectedQuery}};`;

