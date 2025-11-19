import { Page, Section, Par, List, Warning, Term } from '@/components';
import { SQLDisplay } from '@/shared/components/SQLEditor';

export function Summary() {
  return <Page>
    <Section>
      <Par>We can combine <Term>projection</Term> (choosing columns) and <Term>filtering</Term> in a single query. The strategy for writing queries is usually the following.</Par>
      <List items={[
        <>Find which <Term>table</Term> we need data from: start with <SQLDisplay inline>FROM</SQLDisplay>.</>,
        <>Set up the required <Term>filter</Term>: add in <SQLDisplay inline>WHERE</SQLDisplay>.</>,
        <>Pick the specific output <Term>columns</Term>: put in a <SQLDisplay inline>SELECT</SQLDisplay> at the start (possibly with <SQLDisplay inline>DISTINCT</SQLDisplay>).</>,
      ]} />
      <Par>So even though the finished query has to start with <SQLDisplay inline>SELECT</SQLDisplay>, this part is usually only added at the end of the writing process.</Par>
      <Warning>ToDo: add the example from the Theory page.</Warning>
    </Section>
  </Page>
}
