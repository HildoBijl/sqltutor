import { Page, Section, Par, Quote, List, Info, Term, Em, M } from '@/components';

import { useQueryResult } from '@/components/sql/sqljs';
import { useTheorySampleDatabase } from '@/learning/databases';

export function Summary() {
  const db = useTheorySampleDatabase();
  const q1 = 'SELECT * FROM employees';
  const q3 = 'SELECT first_name, last_name FROM employees WHERE current_salary >= 200000';
  const data1 = useQueryResult(db?.database, q1);
  const data3 = useQueryResult(db?.database, q3);

  if (!data1 || !data3)
    return null

  return <Page>
    <Section>
      <Par>A <Term>recursive query</Term> is a query that refers to itself in its definition. Such a definition has two parts.</Par>
      <List items={[
        <>
          <Par><Term>Initialization</Term>: Define the first link(s) of the chain, being the <Term>base case</Term>/<Term>anchor</Term>.</Par>
          <Quote>We say that a person A <strong>received money</strong> from person B, if person A <strong>sold</strong> something to person B.</Quote>
        </>,
        <>
          <Par><Term>Recursion</Term>: Define how to find more links of the chain, <Em>given</Em> earlier links.</Par>
          <Quote>We also say that a person A <strong>received money</strong> from person B, if there is some person X where person A <strong>received money</strong> from person X and person X <strong>sold</strong> something to person B.</Quote>
        </>,
      ]} />
      <Info>Recursive queries are often used to following successive links (so-called <Term>chains</Term>) between tables. Without recursive queries, you can only find chains of a <Em>fixed</Em> length. Recursive queries allow you to find chains of <Em>any</Em> length. This would be <Em>impossible</Em> without recursion, so any query language that supports recursion is inherently more powerful than a query language that does not.</Info>
      <Par>Recursive queries are evaluated using the <Term>Fixed-Point Algorithm</Term>. This algorithm tracks a <Term>result set</Term> <M>R</M> and a <Term>delta set</Term> <M>\Delta</M>. Initially both are filled with the base case/anchor. Then the following <Term>iteration</Term> steps are repeated.</Par>
      <List items={[
        <><M>\Delta \leftarrow f(\Delta)</M>: use the previous delta set and the recursion definition <M>f</M> to try and find new cases.</>,
        <><M>\Delta \leftarrow \Delta - R</M>: only keep cases we have not found before.</>,
        <><M>R \leftarrow R \cup \Delta</M>: add these new cases (if any) to the result set.</>,
      ]} />
      <Par>This is continued until the delta set <M>\Delta</M> ends up empty. The final result set <M>R</M> is then the output of the recursive query.</Par>
    </Section>
  </Page>;
}
