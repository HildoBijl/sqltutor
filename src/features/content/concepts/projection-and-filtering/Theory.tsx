import { useRef } from 'react';
import { Box } from '@mui/material';

import { useThemeColor } from '@/theme';
import { Page, Section, Par, List, Term } from '@/components';
import { type DrawingData, Drawing, Element, Line, useRefWithBounds } from '@/components/figures';
import { useConceptDatabase } from '@/shared/hooks/useDatabase';
import { useQueryResult } from '@/shared/hooks/useQuery';
import { DataTable } from '@/shared/components/DataTable';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know that databases have various tables, each with their own columns and rows. When analyzing the data, we often perform <Term>table manipulation operations</Term>: we turn the table into a new table that is in some way different. Let's check out some common operations.</Par>
    </Section>

    <Section title="Projection: choosing columns">
      <Par>Suppose that we have a table and we are only interested in a few of the columns. For instance, we only want to get an overview of the number of employees per company. In that case, we can choose to use those columns and throw out the rest. This operation is called <Term>projection</Term>.</Par>
      <Projection />
    </Section>

    <Section title="Filtering: choosing rows">
      <Par>Alternatively, we may only need a subset of the rows. For example, we want to find all companies having more than 200000 employees. In that case, we apply <Term>filtering</Term>: we set up a <Term>condition</Term> (at least 200000 employees) and only keep the rows matching this filtering condition.</Par>
      <Filtering />
    </Section>

    <Section title="Other table manipulation operations">
      <Par>Projection and filtering are the most important table manipulation operations. Other examples of operations include:</Par>
      <List items={[
        <>Renaming a column: adjusting its name.</>,
        <>Copying a column and adding it to the table.</>,
        <>Applying an operation to all values in a column. Think of doubling all the numbers, or similar.</>,
      ]} />
      <Par>And there are many more possible table manipulation operations.</Par>
    </Section>
  </Page >;
}

function Projection() {
  const themeColor = useThemeColor();
  const db = useConceptDatabase();
  const dataFull = useQueryResult(db?.database, 'SELECT * FROM companies LIMIT 6');
  const dataProjection = useQueryResult(db?.database, 'SELECT company_name, num_employees FROM companies LIMIT 6');
  const drawingRef = useRef<DrawingData>(null);

  const [t1Ref, t1Bounds] = useRefWithBounds(drawingRef);
  const [t2Ref, t2Bounds] = useRefWithBounds(drawingRef);
  const height = Math.max(t1Bounds?.height || 200, t2Bounds?.height || 200);
  const w1 = 800;
  const w2 = w1 / 6;
  const w3 = w1 / 3;
  const arrowMargin = 10;

  return <Drawing ref={drawingRef} width={w1 + w2 + w3} height={height} maxWidth={800}>
    <Element position={[0, 0]} anchor={[-1, -1]}>
      <Box sx={{ width: w1 }}>
        <DataTable ref={t1Ref} data={dataFull} showPagination={false} compact />
      </Box>
    </Element>

    <Element position={[w1 + w2, 0]} anchor={[-1, -1]}>
      <Box sx={{ width: w3 }}>
        <DataTable ref={t2Ref} data={dataProjection} showPagination={false} compact />
      </Box>
    </Element>

    <Line points={[[w1 + arrowMargin, height / 2], [w1 + w2 - arrowMargin, height / 2]]} color={themeColor} endArrow />
    <Element position={[w1 + w2 / 2, height / 2]} anchor={[0, 1]}><span style={{ fontWeight: 500, fontSize: '0.8em' }}>Projection</span></Element>
  </Drawing>;
}

function Filtering() {
  const themeColor = useThemeColor();
  const db = useConceptDatabase();
  const dataFull = useQueryResult(db?.database, 'SELECT * FROM companies LIMIT 6');
  const dataFiltering = useQueryResult(db?.database, 'SELECT * FROM (SELECT * FROM companies LIMIT 6) WHERE num_employees > 200000');
  const drawingRef = useRef<DrawingData>(null);

  const [t1Ref, t1Bounds] = useRefWithBounds(drawingRef);
  const [t2Ref, t2Bounds] = useRefWithBounds(drawingRef);
  const w = 800;
  const arrowHeight = 80;
  const arrowMargin = 10;
  const h1 = t1Bounds?.height || 200;
  const h2 = t2Bounds?.height || 200;

  return <Drawing ref={drawingRef} width={w} height={h1 + arrowHeight + h2} maxWidth={800 * 2 / 3}>
    <Element position={[0, 0]} anchor={[-1, -1]}>
      <Box sx={{ width: w }}>
        <DataTable ref={t1Ref} data={dataFull} showPagination={false} compact />
      </Box>
    </Element>

    <Element position={[0, h1 + arrowHeight]} anchor={[-1, -1]}>
      <Box sx={{ width: w }}>
        <DataTable ref={t2Ref} data={dataFiltering} showPagination={false} compact />
      </Box>
    </Element>

    <Line points={[[w / 2, h1 + arrowMargin], [w / 2, h1 + arrowHeight - arrowMargin]]} color={themeColor} endArrow />
    <Element position={[w / 2 + 6, h1 + arrowHeight / 2 - 4]} anchor={[-1, 0]}><span style={{ fontWeight: 500, fontSize: '0.8em' }}>Filtering</span></Element>
  </Drawing>;
}
