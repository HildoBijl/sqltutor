import { Page, Section, Par, Quote, List, Info, Warning, Term, DL } from '@/components';

export function Summary() {
  return <Page>
    <Section>
      <Par>Setting up a <Term>recursive predicate</Term> in Datalog is always done by defining two rules for the same predicate.</Par>
      <List items={[
        <>
          <Par>The <Term>base case rule</Term> defines the initial tuples to start the recursion from.</Par>
          <DL>receivedMoneyFrom(v, b) :- transactions(_, v, b, _, _, _, _, _).</DL>
        </>,
        <>
          <Par>The <Term>recursion rule</Term> describes how to find extra tuples for the predicate given existing tuples.</Par>
          <DL>receivedMoneyFrom(v, b) :- receivedMoneyFrom(v, x), transactions(_, x, b, _, _, _, _, _).</DL>
        </>,
      ]} />
      <Quote>A person v received money from a person b, if v sold something to b.<br />A person v also received money from a person b, if there is some person x such that v received money from x, and x sold something to b.</Quote>
      <Par>Datalog notices the circular reference in the recursion rule and will apply the fixed-point algorithm to evaluate it.</Par>
      <Info>The recursion rule generally uses the original predicate once and the recursive predicate once. Using the recursive predicate twice does work, but it is inefficient.</Info>
      <Par>In case the number of links matters, we can add a <Term>recursion counter</Term> to the predicate.</Par>
      <DL>{`
receivedMoneyInSteps(v, b, 1) :- transaction(_, v, b, _, _, _, _, _).
receivedMoneyInSteps(v, b, n) :- receivedMoneyInSteps(v, x, m), transaction(_, x, b, _, _, _, _, _), n = m + 1.      
`}</DL>
      <Warning>Recursion counters are technically unsafe: if there are cycles in the links, the resulting predicate will become infinitely large. Solving this issue requires Datalog techniques we have not mastered yet, so for now we'll have to assume there are no cycles in the links.</Warning>
    </Section>
  </Page>;
}
