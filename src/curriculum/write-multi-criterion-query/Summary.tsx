import { Page, Section, Par, Quote, List, Term } from '@/components';
import { ISQL } from '@/components';

import { FigureExampleQuery } from '../components';

export function Summary() {
  return <Page>
    <Section>
      <Par>To set up a complex multi-criterion query for a single table, there are five steps to follow. At first these steps add data, and then they start removing it, to end up with the data we need.</Par>
      <List useNumbers items={[
        <>Select all columns and where needed <Term>create extra columns</Term>.</>,
        <>Set up the <Term>filter</Term> to only get the entries required.</>,
        <>If needed, <Term>sort and limit</Term> the entries.</>,
        <><Term>Cut columns</Term> to only get the required output.</>,
        <><Term>Remove duplicates</Term> if required.</>
      ]} />
      <Par>It is also possible to use processed column values in the <ISQL>WHERE</ISQL> and <ISQL>ORDER BY</ISQL> clauses.</Par>
      <Quote>Find the income taxes paid per position, but only for contracts that lasted exactly one year, and only for the top 5 performance scores.</Quote>
      <FigureExampleQuery query={`SELECT
  position,
  0.3*salary AS taxes
FROM emp_data
WHERE JULIANDAY(end_date) - JULIANDAY(start_date) BETWEEN 365 AND 366
ORDER BY perf_score DESC
LIMIT 5;`} tableWidth={240} tableScale={0.7} />
    </Section>
  </Page>;
}
