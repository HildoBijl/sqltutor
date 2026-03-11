import { type ReactNode } from 'react'

import { useRefWithValue } from '@/utils/dom';
import { useThemeColor } from '@/theme';
import { Page, Section, Par, List, Info, Warning, Term, Em, M, DL, IDL } from '@/components';
import { type DrawingData, Drawing, Element, Curve, useRefWithBounds } from '@/components';

function DPGDL({ children }: { children: ReactNode }) {
  return <DL style={{ padding: '10px 20px' }}>{children}</DL>
}

export function Theory() {
  return <Page>
    <Section>
      <Par>We know that negation in Datalog can be tricky: we need safe queries, or we could get infinitely large outputs. Similarly recursion in Datalog is tricky: we can only evaluate it through the fixed-point algorithm. When combining negation with recursion, there are even more pitfalls. We'll study some of the problems that occur, and then see what is required to avoid them.</Par>
    </Section>

    <Section title="The problem: non-unique results – multiple models">
      <Par>Let's consider a very simple Datalog program. We have one fact – Alice is a person – and two rules – a person is happy if they're not stressed, and a person is stressed if they're not happy.</Par>
      <DL>{`
person('Alice').
happy(x) :- person(x), not stressed(x).
stressed(x) :- person(x), not happy(x).
`}</DL>
      <Par>We can evaluate this program. To evaluate programs, Datalog starts off with a set of facts – here <IDL>{`{ person('Alice') }`}</IDL> – and evaluates all rules with this set of facts to update/extend its set of facts. This is repeated until nothing changes anymore.</Par>
      <Par>When updating the set of facts, Datalog generally evaluate all rules <Em>together</Em> for this set of facts. When we apply this to our example, <Em>both</Em> rules are triggered: Alice is currently neither happy nor stressed. The updated set of facts will then be <IDL>{`{ person('Alice'), happy('Alice'), stressed('Alice') }`}</IDL>. So Alice is now both happy and stressed. We then evaluate the rules again, and this time we come back to <IDL>{`{ person('Alice') }`}</IDL>. We're back where we started. This process is repeated, and the algorithm never ends!</Par>
      <Par>You might think this procedure is silly, and we should just evaluate rules one at a time. We could do so, but which of the two rules should we then check first? If we check the first rule first, we'll end up with <IDL>{`{ person('Alice'), happy('Alice') }`}</IDL>. But if we check the second rule first, we'll wind up with <IDL>{`{ person('Alice'), stressed('Alice') }`}</IDL>. Both these sets won't change further, and are hence valid outcomes of the program. But they're different!</Par>
      <Par>We define a <Term>model</Term> as a set of facts that makes all rules true. Previously our programs always had a single model, but this program seems to have two! Having multiple models is not desirable. Which output should our program give?</Par>
    </Section>

    <Section title="The root cause: shrinking result sets – no monotonicity">
      <Par>To find out what's different, we take a step back first. Let's consider a Datalog program where we don't have problems; for instance one where we track ancestry. We start with some facts about who is a parent of who. Then we say that a person is someone's ancestor if they're their parent, or if they're an ancestor of their parent.</Par>
      <DL>{`
parent('Alice', 'Bob').
parent('Bob', 'Carla').
parent('Carla', 'Dave').
ancestor(a, b) :- parent(a, b).
ancestor(a, b) :- ancestor(a, x), parent(x, b).
`}</DL>
      <Par>Let's study how Datalog evaluates this program. Particularly, let's study the facts ending up in the <IDL>ancestor</IDL> predicate.</Par>
      <List items={[
        <>We start with no facts in the <IDL>ancestor</IDL> predicate.</>,
        <>We evaluate the rules once. This results in <IDL>{`{ ancestor('Alice', 'Bob'), ancestor('Bob', 'Carla'), ancestor('Carla', 'Dave') }`}</IDL>.</>,
        <>Given this new set of facts, we evaluate the rules again. This gives two extra facts. <IDL>{`{ ancestor('Alice', 'Carla'), ancestor('Bob', 'Dave') }`}</IDL>.</>,
        <>With the five ancestor facts we have now, we evaluate all rules again. This time we also find <IDL>{`{ ancestor('Alice', 'Dave') }`}</IDL>.</>,
        <>We evaluate the rules again, but no new entries pop up. We have found a model: a set of facts for which all rules hold true.</>,
      ]} />
      <Par>A key realization from the above example is that the set of facts <Em>only grows</Em>. We started with three parent facts, and then we kept getting more and more ancestor facts until we were done. A program where the set of facts can only grow is called <Term>monotonic</Term>.</Par>
      <Par>More mathematically, we can write the set of facts as <M>D</M> and the set of rules as a function <M>f(D)</M>. The program starts with an initial set of facts <M>D_0</M> and then derives <M>D_1 = f(D_0), D_2 = f(D_1), \ldots</M> until the set of facts stops changing: we have found a model. We now say that the rules <M>f</M> are <Term>monotonic</Term> if <M>D \subseteq f(D)</M> for all possible sets <M>D</M>. In words: applying the rules can never make us lose any fact.</Par>
      <Info>
        <Par sx={{ mb: 0.5 }}>Monotonic programs have three very important properties.</Par>
        <List items={[
          <>They are <Term>guaranteed to converge</Term>. Since the set of facts can only grow, and the set of all possible facts is finite (for safe rules), we must reach the end eventually.</>,
          <>The <Term>rule order does not matter</Term>. As long as we keep checking rules, any fact that could possibly be true, given the set of initial facts, will eventually be found.</>,
          <>There is only <Term>one model</Term>. We will always reach the maximal set of derivable facts.</>,
        ]} />
      </Info>
      <Par>To improve our intuition of what monotonicity means, let's also study a program that's non-monotonic.</Par>
      <DL>{`
person('Alice').
happy(x) :- person(x), not stressed(x).
working(x) :- person(x).
stressed(x) :- working(x).
`}</DL>
      <Par>Let's go through the same process of evaluating the rules until nothing changes.</Par>
      <List items={[
        <>Initially the set of facts is <IDL>{`{ person('Alice') }`}</IDL>.</>,
        <>After evaluating all rules once, we have <IDL>{`{ person('Alice'), happy('Alice'), working('Alice') }`}</IDL>.</>,
        <>After evaluating the rules once more, we have <IDL>{`{ person('Alice'), happy('Alice'), working('Alice'), stressed('Alice') }`}</IDL>.</>,
        <>We evaluate the rules another time and get <IDL>{`{ person('Alice'), working('Alice'), stressed('Alice') }`}</IDL>.</>,
        <>We evaluate the rules again and get exactly the same result. So we're done.</>,
      ]} />
      <Par>Crucial in this example is that, at one step, the set of facts <Em>decreases</Em>. We remove a fact! Alice used to be happy, but then she started working, wound up stressed, and this removed her happiness. This shows that the above program is <Em>not</Em> monotonic. Luckily this non-monotonic program has a single model. (We'll soon see why: it's "stratified".) But non-monotonic programs don't always have a single model, as the very first example showed.</Par>
      <Warning>Generally non-monotonic programs are harder to compute, since facts can also disappear again.</Warning>
    </Section>

    <Section title="Different Datalog types: positive, semi-positive and stratified Datalog">
      <Par>The problem of having multiple models originates from the <IDL>not</IDL> keyword. To fix those problems, we must restrict ourselves from using it. Let's study three ways in which we can do so.</Par>
      <Par>Option one is to ban <Em>all</Em> negation. This is called <Term>positive Datalog</Term>. The <IDL>not</IDL> keyword is simply not allowed.</Par>
      <Info>Positive Datalog is monotonic. Because of this, we always have a single model that we are guaranteed to find.</Info>
      <Par>Obviously, the <IDL>not</IDL> keyword is pretty useful, so this is not an ideal solution. Let's loosen the restrictions.</Par>
      <Par>Option two is to allow the <IDL>not</IDL> keyword, but <Em>only</Em> at the original tables of our database: the EDBs. This is called <Term>semi-positive Datalog</Term>. We may use <IDL>not originalFact(x)</IDL> but we can't write <IDL>not derivedPredicate(x)</IDL>.</Par>
      <Info>Semi-positive Datalog is also monotonic. After all, we never apply negation to a derived predicate, so it can never happen that a new fact of a derived predicate is negated which then removes a fact somewhere else. Because semi-positive Datalog is monotonic, it benefits from all the advantages of monotonicity: semi-positive Datalog programs are relatively easy to compute.</Info>
      <Par>As it turns out, we can loosen the restrictions a bit further. The problem of multiple models only occurs when we mix negation with recursion. The third option is to not allow any <Em>cycle</Em> with negation. This is called <Term>stratified Datalog</Term>.</Par>
      <Par>This definition may initially sound a bit vague. We can clarify it using the predicate dependency graph. Let's consider the following example program.</Par>
      <SampleNonStratifiedProgram />
      <Par>We say that a predicate <IDL>X</IDL> <Term>negatively depends</Term> on a predicate <IDL>Y</IDL> if the literal <IDL>not Y</IDL> appears in a rule for <IDL>X</IDL>. So in the above example program, <IDL>C</IDL> negatively depends on <IDL>D</IDL> and <IDL>D</IDL> negatively depends on <IDL>B</IDL>.</Par>
      <DependencyGraph />
      <Par>When drawing the dependency graph (before collapsing cycles) we always indicate negative dependencies. This is done by writing a minus sign next to the arrow. (We can also add a plus sign to all other arrows, but this is rather implicit, so it's often skipped.)</Par>
      <Par>The program is stratified if <Em>all</Em> cycles consist of <Em>only positive</Em> dependencies. If there is <Em>any</Em> cycle containing <Em>any</Em> negative dependency, then the program is <Em>not</Em> stratified. The above dependency graph shows that the example program is <Em>not</Em> stratified: there is a cycle <IDL>(C,D,E)</IDL> with a negative dependency from <IDL>C</IDL> to <IDL>D</IDL> in it. If this was a positive dependency, or if there was no cycle, the example program <Em>would</Em> be stratified.</Par>
      <Info>Stratified Datalog programs are not monotonic, which can make them harder to compute. However, stratification <Em>does</Em> guarantee a unique model. To find it, we can once more collapse the cycles into single nodes, divide the dependency graph into layers, and compute the predicates layer by layer. Since all cycles are positive, the fixed-point algorithm won't have any problems with them.</Info>
      <Par>An intuitive way to keep track of these three categories is through the following thoughts.</Par>
      <List items={[
        <><Term>Positive Datalog</Term>: You can't use negation at all.</>,
        <><Term>Semi-positive Datalog</Term>: You can negate original predicates, but not new predicates you defined yourself.</>,
        <><Term>Stratified Datalog</Term>: You can negate any predicate you like, as long as we can finish computing it beforehand.</>,
      ]} />
      <Par>Any positive Datalog program is also semi-positive and stratified, and similarly any semi-positive Datalog program is also stratisfied. The opposite doesn't always hold.</Par>
    </Section>
  </Page>;
}

export function SampleNonStratifiedProgram() {
  return <DL>{`
C(x) :- A(x), not D(x).
D(x) :- not B(x), E(x).
E(x) :- C(x).
`}</DL>
}

export function DependencyGraph() {
  const themeColor = useThemeColor()

  // Track bounds of components.
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();
  const [p1Ref, p1Bounds] = useRefWithBounds(drawingData);
  const [p2Ref, p2Bounds] = useRefWithBounds(drawingData);
  const [p3Ref, p3Bounds] = useRefWithBounds(drawingData);
  const [p4Ref, p4Bounds] = useRefWithBounds(drawingData);
  const [p5Ref, p5Bounds] = useRefWithBounds(drawingData);

  // Render the drawing.
  return <Drawing ref={drawingRef} width={200} height={210} maxWidth={200}>
    <Element ref={p1Ref} position={[40, 20]}><DPGDL>A</DPGDL></Element>
    <Element ref={p2Ref} position={[160, 20]}><DPGDL>B</DPGDL></Element>
    <Element ref={p3Ref} position={[40, 110]}><DPGDL>C</DPGDL></Element>
    <Element ref={p4Ref} position={[160, 110]}><DPGDL>D</DPGDL></Element>
    <Element ref={p5Ref} position={[100, 190]}><DPGDL>E</DPGDL></Element>

    {p1Bounds && p2Bounds && p3Bounds && p4Bounds && p5Bounds ? <>
      <Curve points={[p3Bounds.middleTop.add([0, -2]), p1Bounds.middleBottom.add([0, 2])]} endArrow={true} color={themeColor} />
      <Curve points={[p3Bounds.middleRight.add([2, 0]), p4Bounds.middleLeft.add([-2, 0])]} endArrow={true} color={themeColor} />
      <Curve points={[p4Bounds.middleTop.add([0, -2]), p2Bounds.middleBottom.add([0, 2])]} endArrow={true} color={themeColor} />
      <Curve points={[p4Bounds.bottomLeft.add([2, 0]), p5Bounds.topRight.add([-2, 0])]} endArrow={true} color={themeColor} />
      <Curve points={[p5Bounds.topLeft.add([2, 0]), p3Bounds.bottomRight.add([-2, 0])]} endArrow={true} color={themeColor} />

      <Element position={p3Bounds.middleRight.add(p4Bounds.middleLeft).divide(2).add([0, 10])} anchor={[0, 1]}><span style={{ color: themeColor, fontSize: '1.5em' }}>–</span></Element>
      <Element position={p4Bounds.middleTop.add(p2Bounds.middleBottom).divide(2).add([-5, 6])} anchor={[1, 0]}><span style={{ color: themeColor, fontSize: '1.5em' }}>–</span></Element>
    </> : null}
  </Drawing>;
}

