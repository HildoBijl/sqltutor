import { Page, Par, List, Section, Term, Em, M, BM } from '@/components';
import { FigureExampleRAQuery } from '../../utils';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know that <Term>projection</Term> comes down to selecting various columns from a relation. How do we do so using Relational Algebra?</Par>
    </Section>

    <Section title="Select columns (projection)">
      <Par>Suppose that we have a list of departments of a company, but we only want an overview of the number of employees for each department. To generate this overview, we apply projection. In relational algebra we can do so through</Par>
      <FigureExampleRAQuery query={<>∏<sub>d_name, nr_employees</sub>(departments)</>} actualQuery="SELECT d_name, nr_employees FROM departments" />
      <Par>Note that the projection operator <M>\Pi</M> (the Greek capital letter Pi) expects some relation within its brackets. As subscript, it expects the names of the attributes that should appear within the projection. As output, the operator returns the given relation, but only with the specified attributes.</Par>
    </Section>

    <Section title="The definition of the projection operator">
      <Par>Now that we intuitively know what the projection operator does, let's study the formal definition. After all, relational algebra is a mathematical language, so every operator is formally defined.</Par>
      <Par>The projection operator is defined as</Par>
      <BM>{`\\Pi_{A_1, \\ldots, A_n}(r) := \\{ t[S] \\, | \\, t \\in r, S = \\{A_1, \\ldots, A_n\\} \\}.`}</BM>
      <Par>Let's walk through the definition piece by piece to understand what it means.</Par>
      <List items={[
        <>On the left we have the projection we are defining. It shows that, when we use projection, we must provide some attribute names <M>A_1, \ldots, A_n</M> and some relation <M>r</M>.</>,
        <>The "<M>:=</M>" part stands for "is defined as". The colon shows it is a definition.</>,
        <>On the right, we have the actual definition of the projection. In words, you can read it as "The set of all tuples <M>t[S]</M>, where the tuple <M>t</M> comes from the given relation <M>r</M> and <M>S</M> is the set consisting of the given attributes <M>A_1, \ldots, A_n</M>."</>,
        <>The notation <M>t[S]</M> is a shorthand for the tuple <M>(t[A_1], \ldots, t[A_n])</M>. (Given that <M>{`S = \\{A_1, \\ldots, A_n\\}`}</M>.) So <M>t[S]</M> is the tuple we get when we pick the given attributes <Em>from the tuple <M>t</M></Em>.</>,
      ]} />
      <Par>So altogether the above definition says: "The projection of the relation <M>r</M> onto the attributes <M>A_1, \ldots, A_n</M> is defined as the set of all possible tuples <M>(t[A_1], \ldots, t[A_n])</M>, where <M>t</M> comes from the relation <M>r</M>."</Par>
    </Section>
  </Page>;
}
