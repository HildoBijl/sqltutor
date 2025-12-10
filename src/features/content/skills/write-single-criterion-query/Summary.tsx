import { Page, Section, Par, List, Warning, Term } from '@/components';
import { ISQL } from '@/shared/components/SQLEditor';

export function Summary() {
  return <Page>
    <Section>
      <Par>We can combine <Term>projection</Term> (choosing columns) and <Term>filtering</Term> in a single query. The strategy for writing queries is usually the following.</Par>
      <List items={[
        <>Find which <Term>table</Term> we need data from: start with <ISQL>FROM</ISQL>.</>,
        <>Set up the required <Term>filter</Term>: add in <ISQL>WHERE</ISQL>.</>,
        <>Pick the specific output <Term>columns</Term>: put in a <ISQL>SELECT</ISQL> at the start (possibly with <ISQL>DISTINCT</ISQL>).</>,
      ]} />
      <Par>So even though the finished query has to start with <ISQL>SELECT</ISQL>, this part is usually only added at the end of the writing process.</Par>
      <Warning>ToDo: add the example from the Theory page.</Warning>
    </Section>
  </Page>
}
