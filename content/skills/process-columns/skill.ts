export const config = {
  hints: [
    "Use expressions in SELECT",
    "Alias computed columns with AS",
  ],
};

export function generate(utils) {
  return {
    id: 'process-columns',
    description: 'Select company_name, salary and a computed column double_salary (salary * 2) from positions.',
    expectedQuery: 'SELECT company_name, salary, salary * 2 AS double_salary FROM positions',
  };
}

export function validate(input, state) {
  if (!state || !state.expectedQuery) return false;
  const normalize = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');
  return normalize(input) === normalize(state.expectedQuery);
}

export const solutionTemplate = `{{expectedQuery}};`;

