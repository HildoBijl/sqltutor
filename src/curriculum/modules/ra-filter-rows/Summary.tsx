import { Page, Section, Par, Term, M, BM, IRA } from '@/components';
import { FigureExampleRAQuery } from '../../utils';

export function Summary() {
  return <Page>
    <Section>
      <Par>The <Term>filtering operator</Term> in relational algebra is formally defined as</Par>
      <BM>{`\\sigma_p(r) := \\{t \\, | \\, t \\in r \\, \\textrm{and} \\, p(t) \\}.`}</BM>
      <Par>It applies filtering to a given relation, and returns the relation with only the tuples satisfying the given <Term>predicate</Term>/<Term>condition</Term>.</Par>
      <FigureExampleRAQuery query={<>σ<sub>nr_employees &gt; 10</sub>(departments)</>} actualQuery="SELECT * FROM departments WHERE nr_employees > 10" tableWidth={500} />
      <Par>A condition is always of the form <IRA>[value] [comparator] [value]</IRA>. Each value can be a predefined constant or an attribute value. For text, the <Term>comparator</Term> can only be <M>=</M> or <M>\neq</M>, but for numbers it can also be <M>{`>`}</M>, <M>{`<`}</M>, <M>\geq</M> or <M>\leq</M>.</Par>
      <Par>Multiple conditions can be combined into one predicate using the <Term>and</Term> (<M>\wedge</M>), the <Term>or</Term> (<M>\vee</M>), or the <Term>not</Term> (<M>\neg</M>) <Term>connectives</Term>. When using different connectives together, make sure to use brackets to prevent confusion in the evaluation order.</Par>
      <FigureExampleRAQuery query={<>σ<sub>¬(nr_employees &gt; 6 ∧ nr_employees &lt; 20)</sub>(departments)</>} actualQuery="SELECT * FROM departments WHERE NOT (nr_employees > 6 AND nr_employees < 20)" tableWidth={500} />
    </Section>
  </Page>;
}
