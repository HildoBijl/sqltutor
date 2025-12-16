import { useRef, useState } from 'react';
import { Box } from '@mui/material';

import { Vector } from '@/utils/geometry';
import { useThemeColor } from '@/theme';
import { type DrawingData, Drawing, Element, Curve, useTextNodeBounds, useRefWithBounds, useElementBounds } from '@/components/figures';
import { Page, Section, Par } from '@/components';
import { SQLDisplay } from '@/shared/components/SQLEditor';
import { useConceptDatabase } from '@/shared/hooks/useDatabase';
import { useQueryResult } from '@/shared/hooks/useQuery';
import { DataTable } from '@/shared/components/DataTable';

export function Summary() {
  return <Page>
    <Section>
      <Par>To sort rows in tables, and/or limit the number of given rows, there is a variety of options we can add to the end of an SQL query.</Par>
      <FigureSorting />
    </Section>
  </Page>;
}

const query = `
SELECT *
FROM departments
ORDER BY
  nr_employees ASC,
  budget DESC
LIMIT 3
OFFSET 1;`

function FigureSorting() {
  const themeColor = useThemeColor();
  const drawingRef = useRef<DrawingData>(null);
  const [editor, setEditor] = useState<HTMLElement | null>(null);
  const editorRect = useElementBounds(editor, drawingRef);
  const editorHeight = editorRect?.height ?? 200;

  // Set up data for the two tables.
  const db = useConceptDatabase();
  const data1 = useQueryResult(db?.database, 'SELECT * FROM departments');
  const data2 = useQueryResult(db?.database, query);
  const [t1Ref, t1Bounds] = useRefWithBounds(drawingRef);
  const [t2Ref, t2Bounds] = useRefWithBounds(drawingRef);
  const t1Height = t1Bounds?.height || 400;
  const t2Height = t2Bounds?.height || 300;

  // Find bounds of existing elements.
  const ascBounds = useTextNodeBounds(editor, 'ASC', drawingRef);
  const descBounds = useTextNodeBounds(editor, 'DESC', drawingRef);
  const limitBounds = useTextNodeBounds(editor, '3', drawingRef);
  const offsetBounds = useTextNodeBounds(editor, ';', drawingRef);

  // Define position data.
  const offset = 28; // Between text lines.
  const b1 = new Vector([350, 36]);
  const b2 = new Vector([b1.x, b1.y + offset]);
  const b3 = new Vector([b2.x, b2.y + offset]);
  const b4 = new Vector([b3.x, b3.y + offset]);

  // Render the figure.
  return <Drawing ref={drawingRef} width={700} height={editorHeight + 20 + t1Height + 20 + t2Height} maxWidth={700} disableSVGPointerEvents>
    {/* Query. */}
    <Element position={[40, 0]} anchor={[-1, -1]} behind>
      <SQLDisplay onLoad={setEditor}>{query}</SQLDisplay>
    </Element>

    {/* Explainer text. */}
    <Element position={b1} anchor={[-1, 0]}><span style={{ textWrap: 'nowrap' }}>Sort ascending by number of employees,</span></Element>
    <Element position={b2} anchor={[-1, 0]}><span style={{ textWrap: 'nowrap' }}>and on equality, sort descending by budget.</span></Element>
    <Element position={b3} anchor={[-1, 0]}><span style={{ textWrap: 'nowrap' }}>Then only pick the first three rows,</span></Element>
    <Element position={b4} anchor={[-1, 0]}><span style={{ textWrap: 'nowrap' }}>after having skipped the first row.</span></Element>

    {/* Arrows to explainer text. */}
    {ascBounds && <Curve points={[ascBounds.middleRight.add([9, 1]), ascBounds.middleRight.add([28, 1]), b1.add([-22, 0]), b1.add([-4, 0])]} endArrow={true} color={themeColor} />}
    {descBounds && <Curve points={[descBounds.middleRight.add([3, 1]), descBounds.middleRight.add([62, 1]), b2.add([-22, 0]), b2.add([-4, 0])]} endArrow={true} color={themeColor} />}
    {limitBounds && <Curve points={[limitBounds.middleRight.add([5, 1]), limitBounds.middleRight.add([123, 1]), b3.add([-22, 0]), b3.add([-4, 0])]} endArrow={true} color={themeColor} />}
    {offsetBounds && <Curve points={[offsetBounds.middleRight.add([5, 1]), offsetBounds.middleRight.add([123, 1]), b4.add([-22, 0]), b4.add([-4, 0])]} endArrow={true} color={themeColor} />}

    {/* Table 1. */}
    <Element position={[0, editorHeight + 20]} anchor={[-1, -1]} scale={0.7}>
      <Box sx={{ width: 460 / 0.75 }}>
        <DataTable ref={t1Ref} data={data1} showPagination={false} compact />
      </Box>
    </Element>

    {/* Arrow between tables. */}
    {t1Bounds && t2Bounds ? <Curve points={[[(t1Bounds.left + t2Bounds.left) / 2, t1Bounds.bottom + 10], [(t1Bounds.left + t2Bounds.left) / 2, t2Bounds.middle.y], t2Bounds.leftMiddle.add([-10, 0])]} color={themeColor} endArrow /> : null}

    {/* Table 2. */}
    <Element position={[700, editorHeight + 20 + t1Height + 20]} anchor={[1, -1]} scale={0.7}>
      <Box sx={{ width: 460 / 0.75 }}>
        <DataTable ref={t2Ref} data={data2} showPagination={false} compact />
      </Box>
    </Element>
  </Drawing>;
}
