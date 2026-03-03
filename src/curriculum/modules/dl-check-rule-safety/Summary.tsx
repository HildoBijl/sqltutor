import { Page, Section, Par, Info, List, Em } from '@/components';

export function Summary() {
  return <Page>
    <Section>
      <Par>A Datalog rule is safe if <Em>every</Em> variable in the rule appears in at least one positive non-arithmetic predicate in the rule body. To check if a rule is safe, there are two simple steps.</Par>
      <List useNumbers items={[
        <>Set up a list of all variables that appear anywhere in the rule.</>,
        <>Check that each variable is bound: that it appears in a positive non-arithmetic literal.</>,
      ]} />
      <Info>You may ignore negative literals and arithmetic literals when checking for rule safety.</Info>
      <Par>In practice, the positive non-arithmetic literals are the predicates. In other words, each variable must at some point take its value from an already existing table.</Par>
    </Section>
  </Page>;
}
