import { Page, Section, Par, List, Info, Warning, Term, Em, M, Link, IDL } from '@/components';

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
				<>Set up a <Term>set of unassigned nodes</Term> <M>S</M>, which initially contains all nodes.</>,
				<>Apply the following steps, using a counter <M>i = 0, 1, \ldots</M>, until <M>S</M> is empty.
					<List items={[
						<>Set up a set <M>L_i</M> for layer <M>i</M>, which is initially empty.</>,
						<>Walk through all the nodes in <M>S</M>: all unassigned nodes.
							<List items={[
								<>If <Em>all</Em> of the dependencies (excluding dependencies pointing to itself) point to nodes that have been assigned in earlier layers <M>{`L_0, L_1, \\ldots, L_{i-1}`}</M>, then move the node out of <M>S</M> and into <M>L_i</M>: assign it to layer <M>i</M>.</>,
								<>Reversely, if <Em>any</Em> of the dependencies points to a node that is <Em>not</Em> assigned to an earlier layer, ignore this node for now.</>,
							]} />
						</>,
					]} />
				</>,
			]} />
			<Par>In the end each set <M>L_i</M> contains the nodes belonging to layer <M>i</M>,</Par>
			<CleanedSecondDependencyGraph />
			<Par>To see how this algorithm works, we can apply it to our example. This generates the above graph.</Par>
			<List items={[
				<>Initially there are no assigned nodes. However, nodes <IDL>A</IDL>, <IDL>B</IDL> and <IDL>C</IDL> also have no dependencies, so for them it holds that <Em>all</Em> their dependencies have been assigned. We move these nodes into <M>L_0</M>.</>,
				<>For the remaining nodes, only <IDL>D</IDL> has <Em>all</Em> its dependencies already assigned: it depends on <IDL>A</IDL> and <IDL>B</IDL>. (Though <IDL>H</IDL> depends on <IDL>B</IDL>, it also depends on <IDL>D</IDL> which has not been assigned yet.) So we move <IDL>D</IDL> to <M>L_1</M>.</>,
				<>For the remaining nodes, <IDL>H</IDL> and <IDL>(E,F,G)</IDL> have all of its dependencies assigned. We move those into <M>L_2</M>.</>,
				<>Now only <IDL>I</IDL> is remaining. Not surprisingly, it now also has all its dependencies assigned. We move it into <M>L_3</M>.</>,
			]} />
			<Par>In the end, we can still make the graph a bit prettier by shifting nodes horizontally along its layer, but mathematically that's all not so relevant.</Par>
			<Info>
				<Par sx={{ mb: 0.5 }}>The algorithm is guaranteed to finish.</Par>
				<List items={[
					<>Because there are no cycles, there is <Em>always</Em> some node that only depends on nodes in earlier layers.</>,
					<>Hence, at every iteration, we will move at least one node out of the set of unassigned nodes and into a layer.</>,
					<>Because we start with a finite set of nodes, we <Em>will</Em> run out of unassigned nodes.</>,
				]} /></Info>
		</Section>
	</Page>;
}
