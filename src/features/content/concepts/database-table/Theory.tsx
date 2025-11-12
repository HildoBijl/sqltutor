import { Page, Section, Par, Warning, Info, Term } from '@/components';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know that a database is basically a collection of tables. Let's study one such table. What parts does it have and, more importantly, what do we call these parts?</Par>
    </Section>
    <Section title="Basic table terminology">
      <Par>When talking about database tables, we often use the terminology you are probably already familiar with. A <Term>table</Term> has various <Term>columns</Term>, each having a unique <Term>column name</Term>. The <Term>table contents</Term> consists of any number of <Term>rows</Term>, where each row consists of one <Term>cell</Term> for each column. Each cell contains a <Term>value</Term>.</Par>
      <Warning>ToDo: add image</Warning>
      <Info>In database tables columns have names, but rows do not.</Info>
    </Section>
    <Section title="Rows as objects">
      <Par>In database tables, a table row often represents an object. When this is the case, another set of terminology is often used. Columns are called <Term>properties</Term> or <Term>attributes</Term>, and they have a <Term>property name</Term>. Rows represents <Term>records</Term>, and they have various <Term>fields/property values</Term>.</Par>
      <Warning>ToDo: add image</Warning>
    </Section>
    <Section title="Mathematical analysis of databases">
      <Par>When mathematicians analyse databases, they view tables from the viewpoint of set theory. In this case, a fully different terminology is used. A table (its design/set-up) is known as a <Term>relation</Term>, with the table contents being the <Term>relation instance</Term>. A column is an <Term>attribute</Term> and a single row is a <Term>tuple</Term> containing various <Term>values</Term>.</Par>
      <Warning>ToDo: add image</Warning>
      <Info>As you see, the field of databases has different branches. Every subfield has its own local language. On SQL Valley, we use whatever terminology is most appropriate for the respective topic.</Info>
    </Section>
  </Page>;
}
