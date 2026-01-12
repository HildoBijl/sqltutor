import { Page, Section, Par, List, Term } from '@/components';
import { FigureExampleRAQuery } from '../../utils';

export function Summary() {
  return <Page>
    <Section>
      <Par>The plan for setting up a relational algebra query to extract data from a <Term>single relation</Term> consists of three steps.</Par>
      <List useNumbers items={[
        <>Determine the <Term>relation</Term> containing the desired data.</>,
        <>Apply <Term>filtering</Term> to get the desired tuples.</>,
        <>Apply <Term>projection</Term> to only extract the desired attributes.</>,
      ]} />
      <Par>By following these steps, you basically set up the query from the inside out.</Par>
      <FigureExampleRAQuery query={<>∏<sub>first_name,last_name</sub>(σ<sub>salary &gt; 200000</sub>(employees))</>} actualQuery="SELECT first_name, last_name FROM employees WHERE current_salary > 200000" tableWidth={200} />
    </Section>
  </Page>;
}
