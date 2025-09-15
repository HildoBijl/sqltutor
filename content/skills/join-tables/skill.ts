export const config = {
  hints: [
    "JOIN positions to companies using company_id = id",
    "Use table aliases p and c",
  ],
};

export function generate(utils) {
  const country = utils.selectRandomly(['Netherlands', 'United States']);
  return {
    id: 'join-tables',
    description: `List position and company_name for positions at companies in ${country}.`,
    expectedQuery: `SELECT p.position, c.company_name FROM positions p JOIN companies c ON p.company_id = c.id WHERE c.country = '${country}'`,
  };
}

export function validate(input, state) {
  if (!state || !state.expectedQuery) return false;
  const normalize = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');
  return normalize(input) === normalize(state.expectedQuery);
}

export const solutionTemplate = `{{expectedQuery}};`;

