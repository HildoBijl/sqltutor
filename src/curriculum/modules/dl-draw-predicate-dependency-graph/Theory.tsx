import { Page, Section, Par, List, Info, Warning, Em, M, Link } from '@/components';

import { SampleDatalogScriptForDependencyGraph, SecondDependencyGraph, CleanedSecondDependencyGraph } from '../dl-predicate-dependency-graph/Theory';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know what a predicate dependency graph is. Let's study the steps involved into drawing one.</Par>
    </Section>

    <Section title="Step 1: Draw a rough draft of the graph without layers">
      <Par>Let's consider a sample Datalog program. (This is the same example as used to introduce the <Link to="/concept/dl-predicate-dependency-graph">dependency graph concept</Link>.)</Par>
      <SampleDatalogScriptForDependencyGraph />
      <Par>If we want to draw a predicate dependency graph for this, the first step is always to make a rough draft showing the dependencies. Grab a piece of paper, make a node for every predicate there is, and draw an arrow if a rule describing one predicate mentions some other predicate.</Par>
      <SecondDependencyGraph />
      <Info>If a rule mentions itself, like in recursion, add an arrow from the respective node to <Em>itself</Em>.</Info>
    </Section>

    <Section title="Step 2: As long as there are cycles, merge them into single nodes">
      <Par>It may happen that there are cycles in the dependency graph. These cycles prevent the structuring of the dependency graph through layers. To tackle this, we must get rid of the cycles. Whenever there is a strongly connected component in the graph, collapse it into a single node. Do this until there are no more cycles left.</Par>
      <SecondDependencyGraph collapsed />
      <Warning>In very rare cases, we may have multiple cycles that depend on each other. In that case, we pick the largest possible SCC: the one containing <Em>all</Em> the cycles that depend on each other. We collapse that into a single (possibly large) node.</Warning>
    </Section>

    <Section title="Step 3: Structure the dependency graph using layers">
      <Par>Now that we have a graph without cycles, it is possible to structure all the nodes in layers. This is done by running the following algorithm.</Par>
      <List items={[
        <>Repeat for layers <M>n = 0, 1, \ldots</M>. Continue until all nodes have been assigned to a layer.
          <List items={[
            <>Write down "Layer <M>n</M>" where <M>n</M> is the layer we're currently building.</>,
            <>Walk through all the unassigned nodes.
              <List items={[
                <>For each node, walk through all its dependencies.
                  <List items={[
                    <>If <Em>all</Em> of them point to nodes in earlier layers, add the node to layer <M>n</M>.</>,
                    <>If <Em>any</Em> of the dependencies points to a node that is <Em>not</Em> assigned to an earlier layer, ignore this node for now.</>,
                  ]} />
                </>,
              ]} />
            </>,
          ]} />
        </>,
      ]} />
      <Par>The result will be a dependency graph with layers. We can slide the nodes within each layer a bit, to try and have as few intersecting arrows as possible.</Par>
      <CleanedSecondDependencyGraph />
      <Info>The algorithm is guaranteed to finish. After all, because there are no cycles, there is <Em>always</Em> some node that only depends on nodes in earlier layers. This means that every layer will always get at least one node. And since we only have a finite number of nodes, we <Em>will</Em> eventually run out of unassigned nodes.</Info>
    </Section>
  </Page>;
}
