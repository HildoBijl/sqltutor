import { Page, Section, Par, Term } from '@/components';

import { FigureQueryExample } from './Theory';

export function Summary() {
  return <Page>
    <Section>
      <Par>The usual way of interacting with a database is by sending a <Term>query</Term> to the Database Management System (DBMS). A query is a structured command to extract/adjust data. Examples include "Create a new table", "Add a record" or "Find all records satisfying some condition".</Par>
      <FigureQueryExample />
      <Par>Since DBMSs do not speak English, queries usually look like a piece of computer code. An example (in SQL) is </Par>
      <Par><pre><code>{`SELECT first_name, last_name
FROM employees
WHERE current_salary > 200000
`}</code></pre></Par>
      <Par>The <Term>query language</Term> describes the exact way in which a query has to be set up. Every DBMS has its own query language, although the most commonly used databases use (some dialect of) the query language SQL.</Par>
    </Section>
  </Page>;
}
