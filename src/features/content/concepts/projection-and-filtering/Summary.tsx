import { Box } from '@mui/material';

import { useRefWithValue } from '@/utils/dom';
import { useThemeColor } from '@/theme';
import { Page, Section, Par, Term } from '@/components';
import { type DrawingData, Drawing, Element, Line, useRefWithBounds } from '@/components/figures';
import { useConceptDatabase } from '@/hooks/useDatabase';
import { useQueryResult } from '@/hooks/useQuery';
import { DataTable } from '@/shared/components/DataTable';

export function Summary() {
  return <Page>
    <Section>
      <Par>We can execute a <Term>table manipulation operation</Term> on a database table: an action that turns an existing table into a new one. The most common operations are <Term>projection</Term> (choosing a subset of the columns) and <Term>filtering</Term> (choosing a subset of the rows, based on a given condition).</Par>
      <FigureProjectionAndFiltering />
      <Par>Other operations include renaming columns, copying columns, and applying an operation to all the values in a column.</Par>
    </Section>
  </Page>;
}

function FigureProjectionAndFiltering() {
  const themeColor = useThemeColor();
  const db = useConceptDatabase();
  const dataFull = useQueryResult(db?.database, 'SELECT * FROM departments;');
  const dataProjection = useQueryResult(db?.database, 'SELECT d_name, nr_employees FROM departments;');
  const dataFiltering = useQueryResult(db?.database, 'SELECT * FROM departments WHERE nr_employees > 10;');
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  const [t1Ref, t1Bounds] = useRefWithBounds(drawingData);
  const [t2Ref, t2Bounds] = useRefWithBounds(drawingData);
  const [t3Ref, t3Bounds] = useRefWithBounds(drawingData);
  const w1 = 600;
  const w2 = 120;
  const w3 = 340;
  const width = w1 + w2 + w3;
  const arrowMargin = 10;
  const arrowHeight = 80;
  const h1 = Math.max(t1Bounds?.height || 200, t2Bounds?.height || 200);
  const h2 = t3Bounds?.height || 200;

  return <Drawing ref={drawingRef} width={width} height={h1 + arrowHeight + h2} maxWidth={width * 0.8}>
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

    <Element position={[0, h1 + arrowHeight]} anchor={[-1, -1]}>
      <Box sx={{ width: w1 }}>
        <DataTable ref={t3Ref} data={dataFiltering} showPagination={false} compact />
      </Box>
    </Element>

    <Line points={[[w1 + arrowMargin, h1 / 2], [w1 + w2 - arrowMargin, h1 / 2]]} color={themeColor} endArrow />
    <Element position={[w1 + w2 / 2 - 3, h1 / 2]} anchor={[0, 1]}><span style={{ fontWeight: 500, fontSize: '1em' }}>Projection</span></Element>

    <Line points={[[w1 / 2, h1 + arrowMargin], [w1 / 2, h1 + arrowHeight - arrowMargin]]} color={themeColor} endArrow />
    <Element position={[w1 / 2 + 6, h1 + arrowHeight / 2 - 4]} anchor={[-1, 0]}><span style={{ fontWeight: 500, fontSize: '1em' }}>Filtering: <code style={{ marginLeft: '4px' }}>nr_employees &gt; 10</code></span></Element>
  </Drawing>;
}
