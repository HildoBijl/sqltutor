import { Page, Section, Par, List, Info, Term, M } from '@/components';

export function Summary() {
  return <Page>
    <Section>
      <Par>In relational algebra, we study how to mathematically describe "tables" (in this field of study called <Term>relations</Term>) and how to perform operations on them. There are various definitions and notations to be aware of.</Par>
      <List items={[
        <>An <Term>attribute</Term> is a combination of a name and a domain. If an attribute is named <M>A</M>, its domain is denoted by <M>{`\\textrm{dom}(A)`}</M>. The <Term>domain</Term> is the set of all possible values which this attribute may take values from.</>,
        <>A <Term>relation schema</Term> <M>{`R = \\{A_1, A_2, A_3, \\ldots\\}`}</M> is a set of attributes.</>,
        <>A <Term>tuple</Term> <M>t = \,\,</M>("John", "Doe", 42, ...) is a combination of values. Tuples are name-based: to find attribute values, use the name of the respective attribute. Common notations include <M>t.A_3 = 42</M> and <M>t[A_3] = 42</M>.</>,
        <>A <Term>relation instance</Term> <M>{`r = \\{t_1, t_2, \\ldots\\}`}</M> is a set of tuples.</>,
      ]} />
      <Info>We often write <M>r(R)</M> instead of just <M>r</M> to show that <M>r</M> satisfies the schema <M>R</M>. This means that, for every tuple <M>t \in r(R)</M> and for every attribute <M>A_i \in R</M>, we have <M>{`t.A_i \\in \\textrm{dom}(A_i)`}</M>.</Info>
      <Par>Because relation instances are sets, it means they have no ordering and cannot have duplicate tuples. If there would be duplicates, the excess tuples are implicitly removed.</Par>
    </Section>
  </Page>;
}
