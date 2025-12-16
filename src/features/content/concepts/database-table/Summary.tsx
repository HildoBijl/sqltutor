import { Page, Section, Par, Info, Term } from '@/components';

import { FigureTerminology } from './Theory';

export function Summary() {
  return <Page>
    <Section>
      <Par>A database is a collection of <Term>tables</Term>, each having <Term>columns</Term> (with a name), <Term>rows</Term> and <Term>cells</Term>/<Term>fields</Term>. If we see the rows as objects, we can also say a table consists of <Term>records</Term>, each having various <Term>properties</Term>/<Term>attributes</Term>.</Par>
      <FigureTerminology terminology={{
        table: 'Table',
        contents: <p style={{ textAlign: 'right', lineHeight: 1.2, margin: 0 }}>Contents/<br/>Records</p>,
        column: 'Column/Property/Attribute',
        columnNames: 'Column names',
        row: <p style={{ textAlign: 'right', lineHeight: 1.2, margin: 0 }}>Row/<br />Record</p>,
        cell: 'Cell/Field',
      }} />
      <Info>The terminology used varies a bit, depending on what subfield of database studies you're in. Make sure you know your local language.</Info>
    </Section>
  </Page>;
}
