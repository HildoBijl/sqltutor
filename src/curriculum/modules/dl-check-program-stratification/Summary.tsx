import { Page, Section, Par, List, Em } from '@/components';

import { DependencyGraph } from '../dl-semi-positive-and-stratified-datalog/Theory';

export function Summary() {
  return <Page>
    <Section>
      <Par>Checking whether or not a Datalog program is positive, semi-positive and/or stratified is done through two steps.</Par>
      <List useNumbers items={[
        <>
          <Par sx={{ mb: 1 }}>Draw a predicate dependency graph. Don't collapse cycles yet, but do indicate which dependencies are negative.</Par>
          <DependencyGraph />
        </>,
        <>
          <Par sx={{ mb: 0.5 }}>Use the dependency graph to check the requirements.</Par>
          <List items={[
            <>If there is <Em>any</Em> negative dependency, the program is <Em>not</Em> positive. Otherwise it <Em>is</Em> positive.</>,
            <>If there is <Em>any</Em> negative dependency pointing to a node that in turn depends on another node, the program is <Em>not</Em> semi-positive. Otherwise it <Em>is</Em> semi-positive.</>,
            <>If there is <Em>any</Em> cycle containing a negative dependency, the program is <Em>not</Em> stratified. Otherwise it <Em>is</Em> stratified.</>,
          ]} />
        </>,
      ]} />
    </Section>
  </Page>;
}
