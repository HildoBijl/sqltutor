import { useRef, useState } from 'react';
import { Box } from '@mui/material';

import { useThemeColor } from '@/theme';
import { Page, Par, Section, Warning } from '@/components';
import { type DrawingData, Drawing, Element, Rectangle, Curve, useTextNodeBounds, useRefWithBounds } from '@/components/figures';
import { useConceptDatabase } from '@/shared/hooks/useDatabase';
import { useQueryResult } from '@/shared/hooks/useQuery';
import { DataTable } from '@/shared/components/DataTable';
import { SQLDisplay } from '@/shared/components/SQLEditor';

export function Theory() {
  return <Page>
    <Par>When we receive a result set from a query, it is rarely in the exact order we need. SQL lets us describe how rows should be sorted, and optionally how to pick rows from this sorting.</Par>

    <Section title="Sort on a single column">
      <Par>To sort your results, add an <SQLDisplay inline>ORDER BY</SQLDisplay> clause to the end of the query and specify the column to sort by. Optionally, add <SQLDisplay inline>ASC</SQLDisplay> (ascending, default) or <SQLDisplay inline>DESC</SQLDisplay> (descending) to choose the sorting direction.</Par>
      <SingleColumnSortingDiagram />
    </Section>

    <Section title="Sort based on multiple columns">
      <Par>When the first column contains ties, you can add additional sorting attributes separated by commas. Only when the first attribute is equal, will SQL compare the second attribute to determine the order. And then a third attribute, if given, and so forth.</Par>
      <SqlDrawing code={`SELECT *
FROM companies
ORDER BY
  country ASC,
  name DESC;`} />
    </Section>

    <Section title="Limit the number of rows">
      <Par>To limit the number of rows that are returned, add a <SQLDisplay inline>LIMIT</SQLDisplay> clause, followed by how many rows you want to be returned.</Par>
      <SqlDrawing code={`SELECT *
FROM companies
ORDER BY name DESC
LIMIT 2;`} />
      <Par>Combine <SQLDisplay inline>LIMIT</SQLDisplay> with <SQLDisplay inline>OFFSET</SQLDisplay> to skip a number of rows before returning results.</Par>
      <SqlDrawing code={`SELECT *
FROM companies
ORDER BY name DESC
LIMIT 2 OFFSET 1;`} />
      <Warning>
        Most database engines support <SQLDisplay inline>LIMIT</SQLDisplay> and <SQLDisplay inline>OFFSET</SQLDisplay>, but a few use alternative keywords. If these clauses do not work in your DBMS, check its documentation for the preferred syntax.
      </Warning>
    </Section>

    <Section title="Deal with NULL values">
      <Par>NULLs are treated as the <strong>largest</strong> possible values when sorting. They appear last with ascending order and first with descending order. If you want this to be different, you can override this behaviour with <SQLDisplay inline>NULLS FIRST</SQLDisplay> or <SQLDisplay inline>NULLS LAST</SQLDisplay>, specified per sorting attribute.</Par>
      <SqlDrawing code={`SELECT *
FROM companies
ORDER BY country ASC NULLS FIRST;`} />
    </Section>
  </Page>;
}

function SingleColumnSortingDiagram() {
  const themeColor = useThemeColor();
  const drawingRef = useRef<DrawingData>(null);

  // Set up query data.
  const db = useConceptDatabase();
  const data = useQueryResult(db?.database, 'SELECT * FROM companies ORDER BY company_name DESC LIMIT 6');

  // Find the bounds for "DESC".
  const [editor, setEditor] = useState<HTMLElement | null>(null);
  const descBounds = useTextNodeBounds(editor, 'DESC', drawingRef);

  // Find the bounds for "company_name".
  const [tRef, tBounds, table] = useRefWithBounds(drawingRef);
  const companyNameBounds = useTextNodeBounds(table, 'company_name', drawingRef);

  return <Drawing ref={drawingRef} width={800} height={20 + (tBounds?.height || 200)} maxWidth={800}>
    <Element position={[0, 20]} anchor={[-1, -1]} behind>
      <SQLDisplay onLoad={setEditor}>{`
SELECT *
FROM companies
ORDER BY company_name DESC;
        `}</SQLDisplay>
    </Element>

    <Element position={[300, 20]} anchor={[-1, -1]} scale={0.6} behind>
      <Box sx={{ width: 800 }}>
        <DataTable ref={tRef} data={data} showPagination={false} compact />
      </Box>
    </Element>

    {descBounds && companyNameBounds ? <Curve points={[descBounds.topRight.add([0, 0]), [280, 0], [360, 0], [390, 25]]} color={themeColor} endArrow /> : null}
    {/* {descBounds && companyNameBounds ? <Curve points={[descBounds.topRight.add([0, 0]), [descBounds.right + 40, 0], [companyNameBounds.left - 30, 0], companyNameBounds.topLeft.add([0, 0])]} color={themeColor} endArrow /> : null} */}
    {companyNameBounds && tBounds ? <Curve points={[companyNameBounds.leftBottom.add([-8, 10]), [companyNameBounds.left - 8, tBounds.bottom - 4]]} color={themeColor} endArrow /> : null}
  </Drawing>;
}

function SqlDrawing({ code, height = 240 }: { code: string; height?: number }) {
  const normalizedCode = code.trim();
  return <Drawing width={800} height={height} maxWidth={800}>
    <Rectangle dimensions={[[0, 0], [800, height]]} cornerRadius={20} style={{ fill: 'blue', opacity: 0.1 }} />
    <Element position={[60, 48]} anchor={[-1, -1]}>
      <SQLDisplay>{`\n${normalizedCode}\n`}</SQLDisplay>
    </Element>
  </Drawing>;
}
