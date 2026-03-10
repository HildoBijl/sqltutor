import { Page, Section, Par, Info, Term, Em, IDL, DL } from '@/components';

import { SampleDatalogScriptForDependencyGraph, CleanedFirstDependencyGraph, CleanedSecondDependencyGraph } from './Theory';

export function Summary() {
  return <Page>
    <Section>
      <Par>A <Term>predicate dependency graph</Term> shows which predicates <Term>directly depend</Term> on each other: the second predicate is mentioned in a rule describing the first predicate. Dependency graphs are usually ordered in <Term>layers</Term>, where the nodes in each layer <Em>only</Em> depend on nodes in earlier layers.</Par>
      <SampleDatalogScriptForDependencyGraph />
      <CleanedFirstDependencyGraph layer={3} />
      <Par>It may happen that there are <Term>cycles</Term> in the dependency graph: there is <Term>recursion</Term>. In this case, the idea is to find a <Term>Strongly Connected Component</Term> (SCC) in the graph: a set of nodes in which every node can reach every other node. Those SCCs are <Term>collapsed</Term> into a single node. If we repeat this until there are no cycles left, we can once more draw the graph using layers.</Par>
      <DL>{`
D(x) :- A(x), B(x).
E(x) :- C(x), F(x).
F(x) :- G(x).
G(x) :- D(x), E(x).
H(x) :- D(x), B(x).
I(x) :- G(x), H(x).
`}</DL>
      <CleanedSecondDependencyGraph />
      <Info>Datalog internally uses the dependency graph to know in which order it can evaluate predicates. Everything within a layer can be done at the same time, in parallel. If there is a node containing a cycle, like at node <IDL>(E,F,G)</IDL>, the fixed-point algorithm is needed to handle this cycle.</Info>
    </Section>
  </Page>;
}
