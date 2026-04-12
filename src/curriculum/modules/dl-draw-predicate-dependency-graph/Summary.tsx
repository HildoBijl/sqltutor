import { Page, Section, Par, List, Term } from '@/components';

import { CleanedSecondDependencyGraph } from '../dl-predicate-dependency-graph/Theory';

export function Summary() {
  return <Page>
    <Section>
      <Par>There are three steps in drawing a predicate dependency graph.</Par>
      <List useNumbers items={[
        <>We draw a <Term>rough draft</Term> of the graph without layers. We simply draw a node for each predicate, and draw an arrow if the predicate depends on another predicate.</>,
        <>As long as there are cycles in the graph, we <Term>merge the cycles</Term> into single nodes. Or to be precise, we collapse any strongly connected component into a single node.</>,
        <>We <Term>set up layers</Term> to structure the dependency graph. We walk through the nodes and assign each one to the earliest layer such that all the node's dependencies are from earlier layers.</>,
      ]} />
      <Par>By following these three steps, we are guaranteed to end up with a dependency graph with layers. It can help us understand the Datalog program and evaluate the predicates within.</Par>
      <CleanedSecondDependencyGraph />
    </Section>
  </Page>;
}
