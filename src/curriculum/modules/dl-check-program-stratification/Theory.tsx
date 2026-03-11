import { Page, Section, Par, List, Info, Em, IDL, Link } from '@/components';

import { SampleNonStratifiedProgram, DependencyGraph } from '../dl-semi-positive-and-stratified-datalog/Theory';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know what positive, semi-positive and stratified Datalog programs are. We also know how to draw predicate dependency graphs. If we combine these two things, we can find a relatively easy way to check <Em>if</Em> Datalog programs are positive, semi-positive and/or stratified. Let's take a look at how it works.</Par>
    </Section>

    <Section title="Step 1: Draw the predicate dependency graph and indicate negative dependencies">
      <Par>Let's consider a sample Datalog program. (This is the same example as used to introduce the <Link to="/concept/dl-semi-positive-and-stratified-datalog">stratified Datalog</Link> ideas.)</Par>
      <SampleNonStratifiedProgram />
      <Par>If we want to check if this program is positive, semi-positive and/or stratified, it always helps to draw a dependency graph for it. When doing so, we don't collapse cycles just yet. We only draw the dependencies, and we indicate which of the dependencies are negative.</Par>
      <DependencyGraph />
    </Section>

    <Section title="Step 2: Check where the negative dependencies occur">
      <Par>Based on the dependency graph, it is relatively straightforward to see if the Datalog program is positive, semi-positive and/or stratified.</Par>
      <List items={[
        <>
          <Par sx={{ mb: 0.5 }}>Are there <Em>any</Em> negative dependencies? If so, the program is <Em>not</Em> positive. Otherwise it <Em>is</Em> positive.</Par>
          <Par>In the example, there are negative dependencies, so this is definitely not a positive Datalog program.</Par>
        </>,
        <>
          <Par sx={{ mb: 0.5 }}>Are there <Em>any</Em> negative dependencies that point to a node that in turn depends on another node? If so, the program is <Em>not</Em> semi-positive. Otherwise it <Em>is</Em> semi-positive.</Par>
          <Par>In the example, the negative dependency from <IDL>C</IDL> to <IDL>D</IDL> points to <IDL>D</IDL>, which in turn depends on other nodes. Because <IDL>D</IDL> is not an EDB, the program is not semi-positive. (Note that the negative dependency of <IDL>D</IDL> to <IDL>B</IDL> is OK here, since <IDL>B</IDL> does <Em>not</Em> depend on any other nodes: it's an EDB.)</Par>
        </>,
        <>
          <Par sx={{ mb: 0.5 }}>Are there <Em>any</Em> cycles that contain a negative dependency? If so, the program is <Em>not</Em> stratified. Otherwise it <Em>is</Em> stratified.</Par>
          <Par>In the example, there is only one cycle: <IDL>(C,D,E)</IDL>. This cycle contains a negative dependency: the one from <IDL>C</IDL> to <IDL>D</IDL>. Because of this, the program is not stratified.</Par>
        </>,
      ]} />
      <Info>With some practice, you will also be able to check if a program is positive/semi-positive/stratified <Em>without</Em> drawing a dependency graph. For now, it's recommend to draw one anyway, just to get familiar with how it all works.</Info>
    </Section>
  </Page>;
}
