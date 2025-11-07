import { useRef, useState } from 'react';

import { useThemeColor } from '@/theme';
import { Drawing, Element, Rectangle, Curve, useTextNodeBounds } from '@/components/figures';
import { SQL, Page, Par, Section, Warning } from '@/components';

export function Theory() {
  return <Page>
    <Par>When we receive a result set from a query, it is rarely in the exact order we need. SQL lets us describe how rows should be sorted, and optionally how to pick rows from this sorting.</Par>

    <Section title="Sort on a single column">
      <Par>To sort your results, add an <SQL>ORDER BY</SQL> clause to the end of the query and specify the column to sort by. Optionally, add <SQL>ASC</SQL> (ascending, default) or <SQL>DESC</SQL> (descending) to choose the sorting direction.</Par>
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
      <Par>To limit the number of rows that are returned, add a <SQL>LIMIT</SQL> clause, followed by how many rows you want to be returned.</Par>
      <SqlDrawing code={`SELECT *
FROM companies
ORDER BY name DESC
LIMIT 2;`} />
      <Par>Combine <SQL>LIMIT</SQL> with <SQL>OFFSET</SQL> to skip a number of rows before returning results.</Par>
      <SqlDrawing code={`SELECT *
FROM companies
ORDER BY name DESC
LIMIT 2 OFFSET 1;`} />
      <Warning>
        Most database engines support <SQL>LIMIT</SQL> and <SQL>OFFSET</SQL>, but a few use alternative keywords. If these clauses do not work in your DBMS, check its documentation for the preferred syntax.
      </Warning>
    </Section>

    <Section title="Deal with NULL values">
      <Par>NULLs are treated as the <strong>largest</strong> possible values when sorting. They appear last with ascending order and first with descending order. If you want this to be different, you can override this behaviour with <SQL>NULLS FIRST</SQL> or <SQL>NULLS LAST</SQL>, specified per sorting attribute.</Par>
      <SqlDrawing code={`SELECT *
FROM companies
ORDER BY country ASC NULLS FIRST;`} />
    </Section>
  </Page>;
}

function SingleColumnSortingDiagram() {
  const themeColor = useThemeColor();
  const drawingRef = useRef<any>(null);
  const [codeElement, setCodeElement] = useState<HTMLElement | null>(null);
  const bounds = useTextNodeBounds(codeElement, 'DESC', drawingRef);
  const highlightBounds = bounds;

  return <Drawing ref={drawingRef} width={800} height={200} maxWidth={600}>
    <Element position={[0, 20]} anchor={[-1, -1]}>
      <SQL setElement={setCodeElement}>{`
SELECT *
FROM companies
ORDER BY name DESC
        `}</SQL>
    </Element>

    <Rectangle dimensions={[[300, 20], [460, 180]]} style={{ fill: themeColor, opacity: 0.2 }} />
    <Rectangle dimensions={[[470, 20], [630, 180]]} style={{ fill: themeColor, opacity: 0.2 }} />
    <Rectangle dimensions={[[640, 20], [800, 180]]} style={{ fill: themeColor, opacity: 0.2 }} />

    {highlightBounds ? <Curve
      points={[highlightBounds.topRight.add([0, 0]), [260, 0], [440, 0], [490, 40]]}
      color={themeColor}
      endArrow
    /> : null}
  </Drawing>;
}

function SqlDrawing({ code, height = 240 }: { code: string; height?: number }) {
  const normalizedCode = code.trim();
  return <Drawing width={800} height={height} maxWidth={600}>
    <Rectangle dimensions={[[0, 0], [800, height]]} cornerRadius={20} style={{ fill: 'blue', opacity: 0.1 }} />
    <Element position={[60, 48]} anchor={[-1, -1]}>
      <SQL>{`\n${normalizedCode}\n`}</SQL>
    </Element>
  </Drawing>;
}
