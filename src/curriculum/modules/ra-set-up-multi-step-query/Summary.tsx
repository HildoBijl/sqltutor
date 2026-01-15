import { Page, Section, Par, List, Term, M } from '@/components';
import { FigureExampleRAQuery } from '../../utils';

export function Summary() {
  return <Page>
    <Section>
      <Par>As data requests get more complex, relational algebra queries get larger. To structure them, we can use the <Term>assignment operator</Term> <M>\leftarrow</M>. It temporarily creates a new relation that we can then use within our query. We can for example find all department managers earning less than 200,000 per year.</Par>
      <FigureExampleRAQuery query={<>
        department_managers ← ρ<sub>manager_id→e_id</sub>(∏<sub>manager_id</sub>(departments))<br />
        low_earners ← ∏<sub>e_id</sub>(σ<sub>salary &lt; 200000</sub>(employees))<br />
        low_earning_managers ← department_managers ∩ low_earners<br />
        ∏<sub>first_name,last_name,salary</sub>(low_earning_managers ⋈ employees)
      </>} actualQuery="SELECT first_name, last_name, current_salary FROM employees NATURAL JOIN (SELECT manager_id AS e_id FROM departments INTERSECT SELECT e_id FROM employees WHERE current_salary < 200000)" tableWidth={280} tableScale={0.8} />
      <Par>The relational algebra query has turned into a <Term>relational algebra script</Term>, where the last line (without assignment) gives the output of the script.</Par>
      <Par>When tackling tough data requests, there are a few tips and tricks that can help.</Par>
      <List useNumbers items={[
        <Par>First <Term>execute the request manually</Term> (for a few tuples) to gain some intuition of the data and the steps need to tackle the request.</Par>,
        <Par>Set up the script, keeping assigned relations <Term>intuitive</Term> and <Term>based on keys</Term>.</Par>,
        <Par>When the request has the words "never" or "every", first <Term>do the opposite</Term> and then flip the result around.</Par>,
      ]} />
    </Section>
  </Page>;
}
