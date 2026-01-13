import { Page, Section, Par, List, Info, Term, Em, M } from '@/components';
import { FigureExampleRAQuery } from '../../utils';

export function Summary() {
  return <Page>
    <Section>
      <Par>Whenever we have filtering requirements that span across two tables linked with a foreign key, we can use set operators to apply this filtering. There are four steps in this process.</Par>
      <List useNumbers items={[
        <>Find the keys from the first relation that match the first requirements.</>,
        <>Identically, find the keys from the second relation that match the second requirements.</>,
        <>If the keys have different attribute names, use the <Term>rename operator</Term> <M>{`\\rho_{A \\rightarrow B}(r)`}</M> to ensure both results have the same attribute names.</>,
        <>Use the right <Term>set operator</Term> to combine the two results. <List items={[
          <>Use the <Term>intersection</Term> <M>\cap</M> to get all tuples that occur in <Em>both</Em> relations.</>,
          <>Use the <Term>union</Term> <M>\cup</M> to get all tuples that occur in <Em>either</Em> (or both) relations.</>,
          <>Use the <Term>difference</Term> <M>-</M> (the minus symbol) to get all tuples that occur in the first but <Em>not</Em> in the second relation.</>,
        ]} /></>,
      ]} />
      <Par>Through this strategy, we could for instance find all department managers earning less than 200,000 per year.</Par>
      <FigureExampleRAQuery query={<>ρ<sub>manager_id→e_id</sub>(∏<sub>manager_id</sub>(departments)) ∩ ∏<sub>e_id</sub>(σ<sub>salary &lt; 200000</sub>(employees))</>} actualQuery="SELECT manager_id AS e_id FROM departments INTERSECT SELECT e_id FROM employees WHERE current_salary < 200000" tableWidth={150} />
      <Info>Whenever you use the set operators, it is common to do so only on keys (or combinations of keys) and not on full relations.</Info>
    </Section>
  </Page>;
}
