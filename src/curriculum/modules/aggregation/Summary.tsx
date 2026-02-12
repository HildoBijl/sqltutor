import { Box } from '@mui/material';

import { useRefWithValue } from '@/utils/dom';
import { useThemeColor } from '@/theme';
import { Page, Section, Par, List, Term } from '@/components';
import { type DrawingData, Drawing, Element, Curve, useRefWithBounds } from '@/components';
import { useTheorySampleDatabase } from '@/learning/databases';
import { useQueryResult } from '@/components/sql/sqljs';
import { DataTable } from '@/components';

export function Summary() {
  return <Page>
    <Section>
      <Par><Term>Aggregation</Term> is a table manipulation operation in which groups of rows in a table are squashed together into one or more statistics.</Par>
      <List items={[
        <>We <Term>group</Term> the rows according to <Term>grouping attribute(s)</Term>: rows with equal grouping attributes are grouped together.</>,
        <>For each group, we combine all rows into one or more <Term>aggregated statistics</Term>.</>,
      ]} />
      <FigureAggregation />
      <Par>The <Term>aggregated table</Term> usually has the grouping attributes on the left, and the aggregated statistics on the right. Common aggregation methods are the <Term>total</Term> value, the <Term>highest</Term> value, or the <Term>number</Term> of values, but you could even aggregate text values if desired.</Par>
    </Section>
  </Page>;
}

function FigureAggregation() {
  const themeColor = useThemeColor();
  const db = useTheorySampleDatabase();
  const dataFull = useQueryResult(db?.database, 'SELECT * FROM quarterly_performance;');
  const dataAggregated = useQueryResult(db?.database, 'SELECT fiscal_year, SUM(revenue) AS total_revenue, AVG(revenue) AS average_revenue, MAX(revenue) as highest_revenue, COUNT(1) AS num_quarters FROM quarterly_performance GROUP BY fiscal_year;');
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  const [t1Ref, t1Bounds] = useRefWithBounds(drawingData);
  const [t2Ref, t2Bounds] = useRefWithBounds(drawingData);
  const w1 = 900;
  const w2 = 500;
  const delta = 20;
  const arrowMargin = 5;
  const h1 = t1Bounds?.height ?? 200;
  const h2 = t2Bounds?.height ?? 200;

  return <Drawing ref={drawingRef} width={w1} height={h1 + delta + h2} maxWidth={w1 * 0.8}>
    <Element position={[0, 0]} anchor={[-1, -1]}>
      <Box sx={{ width: w1 }}>
        <DataTable ref={t1Ref} data={dataFull} showPagination={false} compact />
      </Box>
    </Element>

    <Element position={[w1, h1 + delta]} anchor={[1, -1]}>
      <Box sx={{ width: w2 }}>
        <DataTable ref={t2Ref} data={dataAggregated} showPagination={false} compact />
      </Box>
    </Element>

    <Curve points={[[(w1 - w2) / 2, h1 + arrowMargin], [(w1 - w2) / 2, h1 + delta + h2 / 2], [w1 - w2 - arrowMargin, h1 + delta + h2 / 2]]} color={themeColor} endArrow />
    <Element position={[(w1 - w2) / 2 + 80, h1 + delta + h2 / 2 - 2]} anchor={[1, -1]}><span style={{ fontWeight: 500, fontSize: '1em', color: themeColor }}>Aggregate by year</span></Element>
  </Drawing>;
}