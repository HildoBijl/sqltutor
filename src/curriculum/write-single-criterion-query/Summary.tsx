import { Page, Section, Par, List, Term } from '@/components';
import { ISQL } from '@/components';

import { FigureExampleQuery } from '../queryFigures';

export function Summary() {
  return <Page>
    <Section>
      <Par>We can combine <Term>projection</Term> (choosing columns) and <Term>filtering</Term> (selecting rows) in a single query. The strategy for writing queries is usually the following.</Par>
      <List items={[
        <>Find which <Term>table</Term> we need data from: start with <ISQL>FROM</ISQL>.</>,
        <>Set up the required <Term>filter</Term>: add in <ISQL>WHERE</ISQL>.</>,
        <>Pick the specific output <Term>columns</Term>: put in a <ISQL>SELECT</ISQL> at the start (possibly with <ISQL>DISTINCT</ISQL>).</>,
      ]} />
      <Par>So even though the finished query has to start with <ISQL>SELECT</ISQL>, this part is usually only added at the end of the writing process.</Par>
      <FigureExampleQuery query={`
SELECT DISTINCT city
FROM employees
WHERE hire_date < '2025-01-01';`} tableWidth={160} />
    </Section>
  </Page>
}
