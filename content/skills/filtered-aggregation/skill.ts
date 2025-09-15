export const config = {
  hints: [
    "Filter rows before GROUP BY with WHERE",
    "Filter groups after aggregation with HAVING",
    "Use COUNT/SUM with aliases (AS)",
    "Use CASE inside SUM for conditional counts",
  ],
};

export function generate(utils) {
  const modes = ["highPayingPerCompany", "remotePerCompanyUS"];
  const mode = utils.selectRandomly(modes);

  if (mode === "highPayingPerCompany") {
    const salary = utils.generateRandomNumber(110000, 150000);
    const minCount = utils.selectRandomly([2, 3]);
    return {
      id: "filtered-aggregation-high-salary",
      description: `List each company with more than ${minCount - 1} openings where salary > ${salary}. Show company_name and count as openings.`,
      expectedQuery: `SELECT company_name, COUNT(*) AS openings FROM positions WHERE salary > ${salary} GROUP BY company_name HAVING COUNT(*) >= ${minCount}`,
    };
  }

  // remotePerCompanyUS: conditional aggregation + WHERE pre-filter
  const minRemote = utils.selectRandomly([2, 3]);
  return {
    id: "filtered-aggregation-remote-us",
    description: `For United States positions only, list companies with at least ${minRemote} remote openings. Show company_name and remote_openings.`,
    expectedQuery: `SELECT company_name, SUM(CASE WHEN remote_allowed = 1 THEN 1 ELSE 0 END) AS remote_openings FROM positions WHERE country = 'United States' GROUP BY company_name HAVING SUM(CASE WHEN remote_allowed = 1 THEN 1 ELSE 0 END) >= ${minRemote}`,
  };
}

export function validate(input, state) {
  if (!state || !state.expectedQuery) return false;
  const normalize = (s) => s
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/;$/, '');
  return normalize(input) === normalize(state.expectedQuery);
}

export const solutionTemplate = `{{expectedQuery}};`;
