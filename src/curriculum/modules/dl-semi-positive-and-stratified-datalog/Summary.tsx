import { Page, Section, Par, List, Term, Em } from '@/components';

import { DatalogTypeVennDiagram } from './Theory';

export function Summary() {
  return <Page>
    <Section>
      <Par>A <Term>model</Term> is a set of facts such that <Em>all</Em> rules of a Datalog program hold true. Usually Datalog programs have a single unique model, but when we mix negation with recursion, we run the risk of having multiple possible models.</Par>
      {/* <DL>{`
person('Alice').
happy(x) :- person(x), not stressed(x).
stressed(x) :- person(x), not happy(x).
`}</DL>
<Warning>In this example, both <IDL>{`{ person('Alice'), happy('Alice') }`}</IDL> and <IDL>{`{ person('Alice'), stressed('Alice') }`}</IDL> are valid models.</Warning> */}
      <Par>To prevent getting multiple models, we must limit the use of negation. There are three options.</Par>
      <List items={[
        <>In <Term>positive Datalog</Term> negation may not be used at all.</>,
        <>In <Term>semi-positive Datalog</Term> negation may only be applied to the original database tables: the EDBs.</>,
        <>In <Term>stratified Datalog</Term> negation may not appear in any dependency cycle. In other words, if you draw the predicate dependency graph and mark negative dependencies with a minus sign, there may not be a cycle containing a minus sign.</>,
      ]} />
      {/* <DependencyGraph />
      <Warning>In the example figure above, the negative dependency from <IDL>C</IDL> to <IDL>D</IDL> is part of a cycle: it shows the program is <Em>not</Em> stratified. If it was a positive dependency, the program <Em>would be</Em> stratified. It would then also be semi-positive, because <IDL>B</IDL> is an EDB.</Warning> */}
      <Par>All of the three categories (positive/semi-positive/stratified) guarantee a <Term>unique model</Term>. On top of that, positive and semi-positive Datalog programs are <Term>monotonic</Term>: while evaluating the program, the set of known facts can only grow. This property makes monotonic programs relatively easy to compute.</Par>
      <DatalogTypeVennDiagram />
    </Section>
  </Page>;
}
