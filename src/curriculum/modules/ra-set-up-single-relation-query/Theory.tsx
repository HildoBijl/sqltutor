import { Page, Par, List, Section, Term, Em, RA, RelationName } from '@/components';
import { FigureExampleRAQuery } from '../../utils';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know how to apply projection to relations and how to filter their tuples. By combining these actions, we can set up basic queries extracting data from relations.</Par>
    </Section>

    <Section title="The plan of setting up a query">
      <Par>Suppose that we want to find the names (first and last) of all the employees earning more than 200,000 per year. How would we do this?</Par>
      <Par>The first thing we should note is that all the data we need is in a <Em>single</Em> relation. In that case, we can simply set up a <Term>single-relation query</Term>. The plan/steps for that are as follows.</Par>
      <List useNumbers items={[
        <>
          <Par>Determine the <Term>relation</Term> that has the required data. For us that's the <RelationName>employees</RelationName> relation. We can write it down for our query as</Par>
          <RA style={{ marginTop: 8, marginBottom: 8 }}>employees</RA>
        </>,
        <>
          <Par>Apply <Term>filtering</Term> to only get the required tuples. This turns the query into</Par>
          <RA style={{ marginTop: 8, marginBottom: 8 }}>σ<sub>salary &gt; 200000</sub>(employees)</RA>
        </>,
        <>
          <Par>Apply <Term>projection</Term> to only extract the required attributes. This gives the final result</Par>
          <RA style={{ marginTop: 8, marginBottom: 8 }}>∏<sub>first_name,last_name</sub>(σ<sub>salary &gt; 200000</sub>(employees))</RA>
        </>,
      ]} />
      <Par>We basically build up the query from inside to outside, every time adding an operator <Em>around</Em> what we already have. This is a very common way of setting up relational algebra queries.</Par>
      <FigureExampleRAQuery query={<>∏<sub>first_name,last_name</sub>(σ<sub>salary &gt; 200000</sub>(employees))</>} actualQuery="SELECT first_name, last_name FROM employees WHERE current_salary > 200000" tableWidth={200} />
    </Section>
  </Page>;
}
