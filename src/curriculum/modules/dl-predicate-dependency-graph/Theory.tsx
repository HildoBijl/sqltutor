import { type ReactNode } from 'react'

import { useRefWithValue } from '@/utils/dom';
import { useThemeColor } from '@/theme';
import { Page, Section, Par, List, Info, Warning, Term, Em, DL, IDL } from '@/components';
import { type DrawingData, Drawing, Element, Curve, useRefWithBounds } from '@/components';

import { SQLValleySchema } from '../../utils';

function DPGDL({ children }: { children: ReactNode }) {
  return <DL style={{ padding: '10px 20px' }}>{children}</DL>
}

export function Theory() {
  return <Page>
    <Section>
      <Par>We know that Datalog programs can consist of many predicates, each having rules linking them to other predicates. We also know that, through recursion, predicates can refer to themselves.</Par>
      <Par>As Datalog programs grow larger, it helps to visualize their structure, showing which predicate depends on which other predicate. This is done through a <Term>predicate dependency graph</Term>. Let's take a look at how it works.</Par>
    </Section>

    <Section title="Predicates as nodes, dependencies as edges">
      <Par>Let's consider an example database, containing a list of products, a list of user accounts, and a list of transactions made of product sales between users.</Par>
      <SQLValleySchema tables={['products', 'accounts', 'transactions']} singular />
      <Par>We could set up (as an example) a Datalog program that finds the first and last name of every user that has sold a product and subsequently bought it back, including the product name of said product.</Par>
      <Info>It doesn't matter if you don't understand the given program just yet. The only thing to look for is which predicate depends on which predicate.</Info>
      <DL>{`
sold(v, b, p, d) :- transaction(_, v, b, p, d, _, _, _).
soldAndBoughtBack(v, p) :- sold(v, _, p, d1), sold(_, v, p, d2), d2 > d1.
withNames(fn, ln, pn) :-
        soldAndBoughtBack(v, p),
        account(v, _, _, _, fn, ln, _, _, _, _),
        product(p, pn, _, _, _).
`}</DL>
      <Par>The idea now is to make an overview of <Em>which</Em> predicate <Term>directly depends</Term> on <Em>which other</Em> predicate(s): they are referenced within the rules describing the predicate. We can see from the above program that ...</Par>
      <List items={[
        <><IDL>sold</IDL> directly depends on <IDL>transaction</IDL>.</>,
        <><IDL>soldAndBoughtBack</IDL> directly depends on <IDL>sold</IDL>.</>,
        <><IDL>withNames</IDL> directly depends on <IDL>sold</IDL>, but also on <IDL>account</IDL> and <IDL>product</IDL>.</>,
      ]} />
      <Par>All these dependencies can be drawn out in a graph. We draw every predicate as a node, and we draw an edge (including arrow) from one node to another if the first node directly depends on the second node. The result is a first (still messy) version of a <Term>predicate dependency graph</Term>.</Par>
      <FirstDependencyGraph />
      <Warning>There's a distinction between "direct dependence" and "indirect dependence". We say that <IDL>soldAndBoughtBack</IDL> <Term>directly depends</Term> on <IDL>sold</IDL>, but it only <Term>indirectly depends</Term> on <IDL>transaction</IDL>, and it does not depend at all on <IDL>withNames</IDL>. In practice, when we use the word "depends", it usually varies by context whether we mean "directly depends" or "directly or indirectly depends".</Warning>
    </Section>

    <Section title="Layers in the predicate dependency graph">
      <Par>We can structure our dependency graph further. Let's for now assume that there are no cycles in our dependency graph: recursion is not applicable here. In other words, our graph is a <Term>Directed Acyclic Graph</Term> (DAG). When this is the case, we can divide the dependency graph into <Term>layers</Term>.</Par>
      <Par>We start with all the original predicates, the so-called <Term>Extensional Database</Term> (EDB). These predicates form layer 0. It's what is known in advance, before running any program. These predicates do not depend on anything.</Par>
      <CleanedFirstDependencyGraph layer={0} />
      <Par>We then have to add the <Term>Intensional Database</Term> (IDB) to our graph: all the new predicates we defined. We will divide them over several layers. Layer 1 consists of all predicates that <Em>only</Em> depend on predicates in layer 0.</Par>
      <CleanedFirstDependencyGraph layer={1} />
      <Warning>The predicate <IDL>sold</IDL> belongs in layer 1 since it only depends on <IDL>transaction</IDL>. The predicate <IDL>withNames</IDL> depends on <IDL>account</IDL> and <IDL>product</IDL> (both from layer 0) but it <Em>also</Em> depends on <IDL>soldAndBoughtBack</IDL> (not in a layer yet) so it does not belong in layer 1.</Warning>
      <Par>We continue with layer 2. This one contains all predicates that only directly depend on predicates from layers 0 <Em>and</Em> 1.</Par>
      <CleanedFirstDependencyGraph layer={2} />
      <Par>We continue in this way until all predicates have been added to the graph. Every time, in every layer, we add all predicates that <Em>only</Em> depend on the previous layers. This gives our final dependency graph.</Par>
      <CleanedFirstDependencyGraph layer={3} />
      <Par>The above graph gives a good overview of the Datalog program. And sure, the example is a rather small script, so a fancy graph is not <Em>that</Em> valuable. But as Datalog programs get larger, a predicate dependency graph can be <Em>really</Em> helpful at understanding the program.</Par>
      <Info>The graph also shows how Datalog can evaluate predicates. It already knows everything from layer 0. It can then compute everything from layer 1 (possibly in parallel if there are multiple nodes in that layer), then everything from layer 2, and so forth.</Info>
    </Section>

    <Section title="Cycles in the predicate dependency graph">
      <Par>The previous example was of a Datalog program with no cycles. Now let's study an example <Em>with</Em> cycles. We'll use an abstract example here, to keep it simple to grasp. Let's consider a database where the EDB consists of predicates <IDL>A</IDL>, <IDL>B</IDL> and <IDL>C</IDL>. We examine the following program. (The arguments within the predicates are irrelevant, so we just call them <IDL>x</IDL>.)</Par>
      <SampleDatalogScriptForDependencyGraph />
      <Par>We could draw a predicate dependency graph for this script. The first version (without layers) looks like this.</Par>
      <SecondDependencyGraph />
      <Par>Note that there is a <Term>cycle</Term> in the dependency graph! Specifically, <IDL>E</IDL> depends on <IDL>F</IDL>, <IDL>F</IDL> depends on <IDL>G</IDL>, and <IDL>G</IDL> depends on <IDL>E</IDL>. When there is a cycle in the dependency graph, it is impossible to create layers. After all, each of these three predicates should be lower than the other one.</Par>
      <Par>To solve this, we first have to get rid of the cycles. The goal is to find a <Term>Strongly Connected Component</Term> (SCC) in our graph: a set of nodes in which <Em>every</Em> node in this component can be reached (directly or indirectly) from <Em>every</Em> other node of the component. Here we see that <IDL>(E,F,G)</IDL> is a SCC.</Par>
      <Par>When we find a SCC within our dependency graph, we <Term>collapse</Term> it into a single node. We draw this node in our graph in the place of the original nodes.</Par>
      <SecondDependencyGraph collapsed />
      <Par>We continue doing this until there are no cycles left, and we are once more left with a DAG. (Luckily our example only had one cycle.) Since we now have a DAG, we can divide the graph into layers as usual. The result is a dependency graph with layers, where some predicates are grouped together into a single node.</Par>
      <CleanedSecondDependencyGraph />
      <Info>Whenever Datalog encounters multiple predicates in a single node, it knows it has to apply the fixed-point algorithm to evaluate these predicates.</Info>
    </Section>
  </Page>;
}

export function SampleDatalogScriptForDependencyGraph() {
  return <DL>{`
D(x) :- A(x), B(x).
E(x) :- C(x), F(x).
F(x) :- G(x).
G(x) :- D(x), E(x).
H(x) :- D(x), B(x).
I(x) :- G(x), H(x).
`}</DL>
}

export function FirstDependencyGraph() {
  const themeColor = useThemeColor()

  // Track bounds of components.
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();
  const [p1Ref, p1Bounds] = useRefWithBounds(drawingData);
  const [p2Ref, p2Bounds] = useRefWithBounds(drawingData);
  const [p3Ref, p3Bounds] = useRefWithBounds(drawingData);
  const [p4Ref, p4Bounds] = useRefWithBounds(drawingData);
  const [p5Ref, p5Bounds] = useRefWithBounds(drawingData);
  const [p6Ref, p6Bounds] = useRefWithBounds(drawingData);

  // Render the drawing.
  return <Drawing ref={drawingRef} width={500} height={250} maxWidth={500}>
    <Element ref={p1Ref} position={[80, 80]}><DPGDL>product</DPGDL></Element>
    <Element ref={p2Ref} position={[240, 20]}><DPGDL>account</DPGDL></Element>
    <Element ref={p3Ref} position={[420, 80]}><DPGDL>transaction</DPGDL></Element>
    <Element ref={p4Ref} position={[80, 170]}><DPGDL>sold</DPGDL></Element>
    <Element ref={p5Ref} position={[420, 170]}><DPGDL>soldAndBoughtBack</DPGDL></Element>
    <Element ref={p6Ref} position={[240, 230]}><DPGDL>withNames</DPGDL></Element>

    {p1Bounds && p2Bounds && p3Bounds && p4Bounds && p5Bounds && p6Bounds ? <>
      <Curve points={[p4Bounds.topRight.add([2, 3]), p3Bounds.bottomLeft.add([-2, -1])]} endArrow={true} color={themeColor} />
      <Curve points={[p5Bounds.middleLeft.add([-3, 0]), p4Bounds.middleRight.add([3, 0])]} endArrow={true} color={themeColor} />
      <Curve points={[p6Bounds.topRight.add([-1, 0]), p5Bounds.bottomLeft.add([0, -2])]} endArrow={true} color={themeColor} />
      <Curve points={[p6Bounds.topMiddle.add([-40, -4]), p1Bounds.bottomRight.add([0, 0])]} endArrow={true} color={themeColor} />
      <Curve points={[p6Bounds.topMiddle.add([0, -3]), p2Bounds.bottomMiddle.add([0, 3])]} endArrow={true} color={themeColor} />
    </> : null}
  </Drawing>;
}

export function CleanedFirstDependencyGraph({ layer = 3 }) {
  const themeColor = useThemeColor()

  // Track bounds of components.
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();
  const [p1Ref, p1Bounds] = useRefWithBounds(drawingData);
  const [p2Ref, p2Bounds] = useRefWithBounds(drawingData);
  const [p3Ref, p3Bounds] = useRefWithBounds(drawingData);
  const [p4Ref, p4Bounds] = useRefWithBounds(drawingData);
  const [p5Ref, p5Bounds] = useRefWithBounds(drawingData);
  const [p6Ref, p6Bounds] = useRefWithBounds(drawingData);

  // Render the drawing.
  return <Drawing ref={drawingRef} width={500} height={40 + 80 * layer} maxWidth={500}>
    <Element position={[0, 20]}><strong>Layer 0:</strong></Element>
    <Element ref={p1Ref} position={[120, 20]}><DPGDL>product</DPGDL></Element>
    <Element ref={p2Ref} position={[265, 20]}><DPGDL>account</DPGDL></Element>
    <Element ref={p3Ref} position={[420, 20]}><DPGDL>transaction</DPGDL></Element>

    {layer >= 1 ? <>
      <Element position={[0, 100]}><strong>Layer 1:</strong></Element>
      <Element ref={p4Ref} position={[420, 100]}><DPGDL>sold</DPGDL></Element>
      {p3Bounds && p4Bounds ? <Curve points={[p4Bounds.middleTop.add([0, -3]), p3Bounds.middleBottom.add([0, 2])]} endArrow={true} color={themeColor} /> : null}
    </> : null}

    {layer >= 2 ? <>
      <Element position={[0, 180]}><strong>Layer 2:</strong></Element>
      {p5Bounds && p4Bounds ? <Curve points={[p5Bounds.middleTop.add([0, -3]), p4Bounds.middleBottom.add([0, 2])]} endArrow={true} color={themeColor} /> : null}
      <Element ref={p5Ref} position={[420, 180]}><DPGDL>soldAndBoughtBack</DPGDL></Element>
    </> : null}

    {layer >= 3 ? <>
      <Element position={[0, 260]}><strong>Layer 3:</strong></Element>
      <Element ref={p6Ref} position={[265, 260]}><DPGDL>withNames</DPGDL></Element>
      {p6Bounds && p5Bounds ? <Curve points={[p6Bounds.topMiddle.add([30, -2]), p5Bounds.bottomLeft.add([20, 2])]} endArrow={true} color={themeColor} /> : null}
      {p6Bounds && p1Bounds ? <Curve points={[p6Bounds.topMiddle.add([-30, -2]), p1Bounds.bottomMiddle.add([20, 2])]} endArrow={true} color={themeColor} /> : null}
      {p6Bounds && p2Bounds ? <Curve points={[p6Bounds.topMiddle.add([0, -3]), p2Bounds.bottomMiddle.add([0, 3])]} endArrow={true} color={themeColor} /> : null}
    </> : null}
  </Drawing>;
}

export function SecondDependencyGraph({ collapsed = false }) {
  const themeColor = useThemeColor()

  // Track bounds of components.
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();
  const [p1Ref, p1Bounds] = useRefWithBounds(drawingData);
  const [p2Ref, p2Bounds] = useRefWithBounds(drawingData);
  const [p3Ref, p3Bounds] = useRefWithBounds(drawingData);
  const [p4Ref, p4Bounds] = useRefWithBounds(drawingData);
  const [p5Ref, p5Bounds] = useRefWithBounds(drawingData);
  const [p6Ref, p6Bounds] = useRefWithBounds(drawingData);
  const [p7Ref, p7Bounds] = useRefWithBounds(drawingData);
  const [p8Ref, p8Bounds] = useRefWithBounds(drawingData);
  const [p9Ref, p9Bounds] = useRefWithBounds(drawingData);
  const [p567Ref, p567Bounds] = useRefWithBounds(drawingData);

  // Render the drawing.
  return <Drawing ref={drawingRef} width={500} height={220} maxWidth={500}>
    <Element ref={p1Ref} position={[80, 20]}><DPGDL>A</DPGDL></Element>
    <Element ref={p2Ref} position={[240, 20]}><DPGDL>B</DPGDL></Element>
    <Element ref={p3Ref} position={[420, 20]}><DPGDL>C</DPGDL></Element>
    <Element ref={p4Ref} position={[80, 110]}><DPGDL>D</DPGDL></Element>
    <Element ref={p8Ref} position={[240, 110]}><DPGDL>H</DPGDL></Element>
    <Element ref={p9Ref} position={[80, 200]}><DPGDL>I</DPGDL></Element>

    {collapsed ? <>
      <Element ref={p567Ref} position={[420, 200]}><DPGDL>(E,F,G)</DPGDL></Element>
    </> : <>
      <Element ref={p5Ref} position={[420, 110]}><DPGDL>E</DPGDL></Element>
      <Element ref={p6Ref} position={[420, 200]}><DPGDL>F</DPGDL></Element>
      <Element ref={p7Ref} position={[240, 200]}><DPGDL>G</DPGDL></Element>
    </>}

    {p1Bounds && p2Bounds && p3Bounds && p4Bounds && p8Bounds && p9Bounds ? <>
      <Curve points={[p4Bounds.middleTop.add([0, -2]), p1Bounds.middleBottom.add([0, 2])]} endArrow={true} color={themeColor} />
      <Curve points={[p4Bounds.topRight.add([0, 0]), p2Bounds.bottomLeft.add([0, 0])]} endArrow={true} color={themeColor} />
      <Curve points={[p8Bounds.middleTop.add([0, -2]), p2Bounds.middleBottom.add([0, 2])]} endArrow={true} color={themeColor} />
      <Curve points={[p8Bounds.middleLeft.add([-2, 0]), p4Bounds.middleRight.add([2, 0])]} endArrow={true} color={themeColor} />
      <Curve points={[p9Bounds.topRight.add([0, 0]), p8Bounds.bottomLeft.add([0, 0])]} endArrow={true} color={themeColor} />

      {collapsed ? <>
        {p567Bounds ? <>
          <Curve points={[p567Bounds.topLeft.add([-2, 1]), p4Bounds.bottomRight.add([1, -2])]} endArrow={true} color={themeColor} />
          <Curve points={[p9Bounds.middleRight.add([2, 0]), p567Bounds.middleLeft.add([-2, 0])]} endArrow={true} color={themeColor} />
          <Curve points={[p567Bounds.middleTop.add([0, -2]), p3Bounds.middleBottom.add([0, 2])]} endArrow={true} color={themeColor} />
        </> : null}
      </> : <>
        {p5Bounds && p6Bounds && p7Bounds ? <>
          <Curve points={[p7Bounds.topLeft.add([0, 0]), p4Bounds.bottomRight.add([0, 0])]} endArrow={true} color={themeColor} />
          <Curve points={[p9Bounds.middleRight.add([2, 0]), p7Bounds.middleLeft.add([-2, 0])]} endArrow={true} color={themeColor} />
          <Curve points={[p5Bounds.middleTop.add([0, -2]), p3Bounds.middleBottom.add([0, 2])]} endArrow={true} color={themeColor} />
          <Curve points={[p7Bounds.topRight.add([0, 0]), p5Bounds.bottomLeft.add([0, 0])]} endArrow={true} color={themeColor} />
          <Curve points={[p5Bounds.middleBottom.add([0, 2]), p6Bounds.middleTop.add([0, -2])]} endArrow={true} color={themeColor} />
          <Curve points={[p6Bounds.middleLeft.add([-2, 0]), p7Bounds.middleRight.add([2, 0])]} endArrow={true} color={themeColor} />
        </> : null}
      </>}
    </> : null}
  </Drawing>;
}

export function CleanedSecondDependencyGraph() {
  const themeColor = useThemeColor()

  // Track bounds of components.
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();
  const [p1Ref, p1Bounds] = useRefWithBounds(drawingData);
  const [p2Ref, p2Bounds] = useRefWithBounds(drawingData);
  const [p3Ref, p3Bounds] = useRefWithBounds(drawingData);
  const [p4Ref, p4Bounds] = useRefWithBounds(drawingData);
  const [p567Ref, p567Bounds] = useRefWithBounds(drawingData);
  const [p8Ref, p8Bounds] = useRefWithBounds(drawingData);
  const [p9Ref, p9Bounds] = useRefWithBounds(drawingData);

  // Render the drawing.
  return <Drawing ref={drawingRef} width={500} height={280} maxWidth={500}>
    <Element position={[0, 20]}><strong>Layer 0:</strong></Element>
    <Element ref={p1Ref} position={[120, 20]}><DPGDL>A</DPGDL></Element>
    <Element ref={p2Ref} position={[270, 20]}><DPGDL>B</DPGDL></Element>
    <Element ref={p3Ref} position={[420, 20]}><DPGDL>C</DPGDL></Element>

    <Element position={[0, 100]}><strong>Layer 1:</strong></Element>
    <Element ref={p4Ref} position={[185, 100]}><DPGDL>D</DPGDL></Element>

    <Element position={[0, 180]}><strong>Layer 2:</strong></Element>
    <Element ref={p8Ref} position={[205, 180]}><DPGDL>H</DPGDL></Element>
    <Element ref={p567Ref} position={[345, 180]}><DPGDL>(E,F,G)</DPGDL></Element>

    <Element position={[0, 260]}><strong>Layer 3:</strong></Element>
    <Element ref={p9Ref} position={[270, 260]}><DPGDL>I</DPGDL></Element>

    {p1Bounds && p2Bounds && p3Bounds && p4Bounds && p567Bounds && p8Bounds && p9Bounds ? <>
      <Curve points={[p4Bounds.topLeft.add([5, -3]), p1Bounds.bottomRight.add([-5, 3])]} endArrow={true} color={themeColor} />
      <Curve points={[p4Bounds.topRight.add([0, -2]), p2Bounds.bottomLeft.add([0, 2])]} endArrow={true} color={themeColor} />
      <Curve points={[p8Bounds.topRight.add([-2, -1]), p2Bounds.middleBottom.add([-10, 4])]} endArrow={true} color={themeColor} />
      <Curve points={[p8Bounds.middleTop.add([-5, -3]), p4Bounds.middleBottom.add([5, 2])]} endArrow={true} color={themeColor} />
      <Curve points={[p567Bounds.middleTop.add([20, -4]), p3Bounds.bottomLeft.add([10, 3])]} endArrow={true} color={themeColor} />
      <Curve points={[p567Bounds.topLeft.add([-2, 1]), p4Bounds.bottomRight.add([1, -2])]} endArrow={true} color={themeColor} />
      <Curve points={[p9Bounds.topLeft.add([5, -3]), p8Bounds.bottomRight.add([-5, 3])]} endArrow={true} color={themeColor} />
      <Curve points={[p9Bounds.topRight.add([-10, -4]), p567Bounds.bottomLeft.add([10, 4])]} endArrow={true} color={themeColor} />
    </> : null}
  </Drawing>;
}
