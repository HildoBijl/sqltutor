import { Page, Section, Par, Term, BM } from '@/components';
import { FigureExampleRAQuery } from '../../utils';

export function Summary() {
  return <Page>
    <Section>
      <Par>The <Term>projection operator</Term> in relational algebra is formally defined as</Par>
      <BM>{`\\Pi_{A_1, \\ldots, A_n}(r) := \\{ t[S] \\, | \\, t \\in r, S = \\{A_1, \\ldots, A_n\\} \\}.`}</BM>
      <Par>It applies projection to a given relation, and returns the relation with only the specified attributes.</Par>
      <FigureExampleRAQuery query={<>∏<sub>d_name, nr_employees</sub>(departments)</>} actualQuery="SELECT d_name, nr_employees FROM departments" />
    </Section>
  </Page>;
}
