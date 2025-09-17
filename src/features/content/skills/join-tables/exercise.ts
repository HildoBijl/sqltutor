export interface ExerciseState {
  id: string;
  description: string;
  expectedQuery: string;
}

type Utils = {
  selectRandomly: <T>(items: readonly T[]) => T;
};

const scenarios: readonly ExerciseState[] = [
  {
    id: 'join-company-positions',
    description: 'List each position together with the company name using an inner join.',
    expectedQuery: 'SELECT c.company_name, p.position, p.salary FROM positions p JOIN companies c ON p.company_id = c.id',
  },
  {
    id: 'join-left',
    description: 'Show all companies and any available positions, keeping companies even if they have no positions.',
    expectedQuery: 'SELECT c.company_name, p.position FROM companies c LEFT JOIN positions p ON c.id = p.company_id',
  },
  {
    id: 'join-filtered',
    description: 'Return positions located in the Netherlands with their company name.',
    expectedQuery: "SELECT c.company_name, p.position, p.city FROM positions p JOIN companies c ON p.company_id = c.id WHERE p.country = 'Netherlands'",
  },
];

export function generate(utils: Utils): ExerciseState {
  return utils.selectRandomly(scenarios);
}

function normalize(query: string) {
  return query.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');
}

export function validate(input: string, state: ExerciseState | null, _result: unknown) {
  if (!state) return false;
  return normalize(input) === normalize(state.expectedQuery);
}

export const solutionTemplate = '{{expectedQuery}};';
