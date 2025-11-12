import { Page, Section, Par, Warning, Info, Term } from '@/components';

export function Summary() {
  return <Page>
    <Section>
      <Par>A database is a collection of <Term>tables</Term>, each having <Term>columns</Term> (with a name), <Term>rows</Term> and <Term>cells/fields</Term>. If we see the rows as objects, we can also say a table consists of <Term>records</Term>, each having various <Term>properties/attributes</Term>.</Par>
      <Warning>ToDo: add image.</Warning>
      <Info>The terminology used varies a bit, depending on what subfield of database studies you're in. Make sure you know your local language.</Info>
    </Section>
  </Page>;
}
