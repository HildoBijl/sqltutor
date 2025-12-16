import { useRef } from 'react';
import { Box } from '@mui/material';

import { useThemeColor } from '@/theme';
import { Page, Section, Par, Info, Term, Em } from '@/components';
import { type DrawingData, Drawing, Element, Curve, Rectangle, useTextNodeBounds, useRefWithBounds } from '@/components/figures';
import { useConceptDatabase } from '@/shared/hooks/useDatabase';
import { useQueryResult } from '@/shared/hooks/useQuery';
import { DataTable } from '@/shared/components/DataTable';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know that a database is basically a collection of tables. Let's study one such table. What parts does it have and, more importantly, what do we call these parts?</Par>
    </Section>

    <Section title="Basic table terminology">
      <Par>When talking about database tables, we often use the terminology you are probably already familiar with. A <Term>table</Term> has various <Term>columns</Term>, each having a unique <Term>column name</Term>. The <Term>table contents</Term> consists of any number of <Term>rows</Term>, where each row consists of one <Term>cell</Term> for each column. Each cell contains a <Term>value</Term>.</Par>
      <FigureTerminology terminology={{
        table: 'Table',
        contents: 'Contents',
        column: 'Column',
        columnNames: 'Column names',
        row: 'Row',
        cell: 'Cell',
      }} />
      <Info>In database tables columns have names, but rows do not. They don't even have an index or ID. Of course you <Em>can</Em> set up a column named "ID" or similar. This is actually common practice.</Info>
    </Section>

    <Section title="Rows as objects">
      <Par>In database tables, a table row often represents some kind of real-life object. When this is the case, another set of terminology is often used. Columns are called <Term>properties</Term> or <Term>attributes</Term>, and they have a <Term>property name</Term>. Rows represents <Term>records</Term>, and they have various <Term>fields</Term>/<Term>property values</Term>.</Par>
      <FigureTerminology terminology={{
        table: 'Table',
        contents: 'Records',
        column: 'Property/Attribute',
        columnNames: 'Property/Attribute names',
        row: 'Record',
        cell: 'Field',
      }} />
    </Section>

    <Section title="Mathematical analysis of databases">
      <Par>When mathematicians analyse databases, they view tables from the viewpoint of set theory. In this case, a fully different terminology is used. A table (its design/set-up) is known as a <Term>relation</Term>, with the table contents being the <Term>relation instance</Term>. A column is an <Term>attribute</Term> and a single row is a <Term>tuple</Term> containing various <Term>values</Term>.</Par>
      <FigureTerminology terminology={{
        table: 'Relation',
        contents: 'Relation instance',
        column: 'Attribute',
        columnNames: 'Attribute names',
        row: 'Tuple',
        cell: 'Value',
      }} />
      <Info>As you see, the field of databases has different branches. Every subfield has its own local language. On SQL Valley, we use whatever terminology is most appropriate for the respective topic.</Info>
    </Section>
  </Page>;
}

export function FigureTerminology({ terminology }: { terminology?: { [key: string]: React.ReactNode } }) {
  const themeColor = useThemeColor();

  // Get data.
  const db = useConceptDatabase();
  const data = useQueryResult(db?.database, 'SELECT * FROM departments;');

  // Set up reference to the table.
  const drawingRef = useRef<DrawingData>(null);
  const [tRef, tBounds, table] = useRefWithBounds(drawingRef);

  // Find the text nodes.
  const text = data && data.values[2][1] || '';
  const textNodeBounds = useTextNodeBounds(table, text, drawingRef, 0, 1);
  const columnNameNodeBounds = useTextNodeBounds(table, 'd_id', drawingRef, 0, 1);

  // Define coordinates.
  const x = 180;
  const y = 60;
  const w = 700;
  const r = 10;

  // Render the drawing.
  return <Drawing ref={drawingRef} width={w} height={y + (tBounds?.height || 200)} maxWidth={w} disableSVGPointerEvents>
    {/* Table. */}
    <Element position={[x, y]} anchor={[-1, -1]} scale={0.8} behind>
      <Box sx={{ width: (w - x) / 0.8 }}>
        <DataTable ref={tRef} data={data} showPagination={false} compact />
      </Box>
    </Element>

    {tBounds && textNodeBounds && columnNameNodeBounds ? <>
      {/* Table marker. */}
      <Element position={[x + (w - x) / 2, y - 38]} anchor={[0, 1]}><span style={{ color: themeColor, fontWeight: 500, fontSize: '0.8em' }}>{terminology?.table}</span></Element>
      <Curve points={[[x, y - 40 + r], [x, y - 40], [w, y - 40], [w, y - 40 + r]]} curveDistance={r} color={themeColor} size={2} />

      {/* Contents marker. */}
      <Element position={[x - 80, (columnNameNodeBounds.bottom + tBounds.bottom) / 2]} anchor={[1, 0]}><span style={{ color: themeColor, fontWeight: 500, fontSize: '0.8em' }}>{terminology?.contents}</span></Element>
      <Curve points={[[x - 75 + r, columnNameNodeBounds.bottom + 2], [x - 75, columnNameNodeBounds.bottom + 2], [x - 75, tBounds.bottom], [x - 75 + r, tBounds.bottom]]} curveDistance={r} color={themeColor} size={2} />

      {/* Column marker. */}
      <Element position={[textNodeBounds.middle.x, y - 12]} anchor={[0, 1]}><span style={{ color: themeColor, fontWeight: 500, fontSize: '0.8em' }}>{terminology?.column}</span></Element>
      <Curve points={[[textNodeBounds.left, y - 13 + r], [textNodeBounds.left, y - 13], [textNodeBounds.right, y - 13], [textNodeBounds.right, y - 13 + r]]} curveDistance={r} color={themeColor} size={2} />

      {/* Column names marker. */}
      <Element position={[x - 25, columnNameNodeBounds.middle.y - 3]} anchor={[1, 0]}><span style={{ color: themeColor, fontWeight: 500, fontSize: '0.8em' }}>{terminology?.columnNames}</span></Element>
      <Curve points={[[x - 20 + r, columnNameNodeBounds.top], [x - 20, columnNameNodeBounds.top], [x - 20, columnNameNodeBounds.bottom], [x - 20 + r, columnNameNodeBounds.bottom]]} curveDistance={r} color={themeColor} size={2} />

      {/* Row marker. */}
      <Element position={[x - 25, textNodeBounds.middle.y]} anchor={[1, 0]}><span style={{ color: themeColor, fontWeight: 500, fontSize: '0.8em' }}>{terminology?.row}</span></Element>
      <Curve points={[[x - 20 + r, textNodeBounds.top], [x - 20, textNodeBounds.top], [x - 20, textNodeBounds.bottom], [x - 20 + r, textNodeBounds.bottom]]} curveDistance={r} color={themeColor} size={2} />

      {/* Cell marker. */}
      <Element position={textNodeBounds.topRight.add([-8, 3])} anchor={[1, 1]}><span style={{ color: themeColor, fontWeight: 500, fontSize: '0.8em' }}>{terminology?.cell}</span></Element>
      <Rectangle dimensions={textNodeBounds} cornerRadius={r} style={{ stroke: themeColor, strokeWidth: 2, fill: 'none' }} />
    </> : null}
  </Drawing>;
}
