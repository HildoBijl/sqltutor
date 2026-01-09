import { Page, Section, Par, List, Info, Term } from '@/components';

export function Summary() {
  return <Page>
    <Section>
      <Par>In relational algebra, we study how to mathematically describe "tables" (in this field of study called <Term>relations</Term>) and how to perform operations on them. There are various definitions and notations to be aware of.</Par>
      <List items={[
        <>An <Term>attribute</Term> is a combination of a name and a domain. If an attribute is named {`A`}, its domain is denoted by {`dom(A)`}. The <Term>domain</Term> is the set of all possible values which this attribute may take values from.</>,
        <>A <Term>relation schema</Term> {`R = {A1, A2, A3, ...}`} is a set of attributes.</>,
        <>A <Term>tuple</Term> {`t = ("John", "Doe", 42, ...)`} is a combination of values. Tuples are name-based: to find attribute values, use the name of the respective attribute. Common notations include {`t[A3] = 42`} and {`t.A3 = 42`}.</>,
        <>A <Term>relation instance</Term> {`r = {t1, t2, ...}`} is a set of tuples.</>,
      ]} />
      <Info>We often write {`r(R)`} instead of just {`r`} to show that {`r`} satisfies the schema {`R`}. This means that, for every tuple {`t in r(R)`} and for every attribute {`Ai in R`} we have {`t[Ai] in dom(Ai)`}.</Info>
      <Par>Because relation instances are sets, it means they have no ordering and cannot have duplicate tuples. If there would be duplicates, the excess tuples are implicitly removed.</Par>
    </Section>
  </Page>;
}
