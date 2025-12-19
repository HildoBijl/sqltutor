import { Box } from '@mui/material';

import { useRefWithValue } from '@/utils/dom';
import { useThemeColor } from '@/theme';
import { Page, Section, Par, List, Info, Term, Em } from '@/components';
import { type DrawingData, Drawing, Element, Curve, useTextNodeBounds, useRefWithBounds } from '@/components/figures';
import { useConceptDatabase } from '@/hooks/useDatabase';
import { useQueryResult } from '@/hooks/useQuery';
import { DataTable } from '@/shared/components/DataTable';
import { ISQL, SQLDisplay } from '@/shared/components/SQLEditor';

import { FigureMergingTables } from './Theory';

export function Summary() {
  return <Page>
    <Section>
      <Par>If we want to filter rows based on multiple conditions, we can combine them using <ISQL>AND</ISQL>, <ISQL>OR</ISQL> and <ISQL>NOT</ISQL>.</Par>
      <FigureCombinedCondition />
      <Info>When evaluating the conditions, SQL always first resolves the comparisons, turning them into <ISQL>TRUE</ISQL>/<ISQL>FALSE</ISQL>. Then it applies any potential <ISQL>NOT</ISQL> operators. At the end it resolves <ISQL>AND</ISQL>/<ISQL>OR</ISQL>. Brackets can be used to indicate a different operation order.</Info>
      <Par>A very different (and less common) way of applying multiple conditions is by <Term>merging</Term> two tables with identical columns.</Par>
      <List items={[
        <>The <ISQL>UNION</ISQL> command gathers all rows present in <Em>at least one</Em> of the two tables (like an <ISQL>OR</ISQL>).</>,
        <>The <ISQL>INTERSECT</ISQL> command gathers all rows present in <Em>both</Em> tables (like an <ISQL>AND</ISQL>).</>,
        <>The <ISQL>EXCEPT</ISQL> command gathers all rows present in the first table but <Em>not</Em> in the second table (like a subtraction).</>,
      ]} />
      <FigureMergingTables query1={`SELECT *
FROM emp_data
WHERE status = 'sick leave'`} query2={`SELECT *
FROM emp_data
WHERE position = 'logistics specialist'`} operator="UNION" />
    </Section>
  </Page>;
}

function FigureCombinedCondition() {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const query = `
SELECT *
FROM emp_data
WHERE NOT (status = 'paid leave' OR status = 'sick leave')
  AND start_date < '2018-01-01';`;
  const db = useConceptDatabase();
  const data = useQueryResult(db?.database, query);

  // Find the editor bounds.
  const [eRef, eBounds, editor] = useRefWithBounds(drawingData);
  const c1QueryBounds = useTextNodeBounds(editor, 'sick leave', drawingData);
  const c2QueryBounds = useTextNodeBounds(editor, 'start_date', drawingData);

  // Find the table column name bounds.
  const [tRef, tBounds, table] = useRefWithBounds(drawingData);
  const c1NameBounds = useTextNodeBounds(table, 'status', drawingData);
  const c2NameBounds = useTextNodeBounds(table, 'start_date', drawingData);

  const h1 = eBounds?.height || 100;
  const delta = 30;
  const h2 = tBounds?.height || 200;
  const height = h1 + delta + h2;

  return <Drawing ref={drawingRef} width={800} height={height} maxWidth={800} disableSVGPointerEvents>
    <Element ref={eRef} position={[0, 0]} anchor={[-1, -1]} behind>
      <SQLDisplay>{query}</SQLDisplay>
    </Element>

    {eBounds ? <Element position={[0, eBounds.height + delta]} anchor={[-1, -1]} scale={0.8} behind>
      <Box sx={{ width: 800 / 0.8 }}>
        <DataTable ref={tRef} data={data} showPagination={false} compact />
      </Box>
    </Element> : null}

    {eBounds && c1QueryBounds && c1NameBounds && c2QueryBounds && c2NameBounds ? <>
      <Curve points={[c1QueryBounds.middleRight.add([9, 2]), [c1NameBounds.middle.x, c1QueryBounds.middle.y + 2], c1NameBounds.middleTop.add([0, -4])]} color={themeColor} curveDistance={60} endArrow />
      <Curve points={[[c2QueryBounds.middle.x + 4, c2QueryBounds.bottom + 2], [c2QueryBounds.middle.x + 4, eBounds.bottom + delta / 2 - 2], [c2NameBounds.middle.x, eBounds.bottom + delta / 2 - 2], c2NameBounds.middleTop]} color={themeColor} curveDistance={20} endArrow />
    </> : null}
  </Drawing>;
}
