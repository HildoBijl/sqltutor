import { useRef, useState } from 'react';
import { Alert, Box, Typography } from '@mui/material';

import { useThemeColor } from '@/theme';
import { Drawing, Element, Rectangle, Curve, useTextNodeBounds } from '@/components/figures/Drawing';
import { Par, Section } from '@/components/html';
import { SQL } from 'components';

type SqlDrawingProps = {
  code: string;
  height?: number;
};

function SqlDrawing({ code, height = 240 }: SqlDrawingProps) {
  const normalizedCode = code.trim();

  return (
    <Drawing width={500} height={height}>
      <Rectangle dimensions={[[0, 0], [960, height]]} style={{ fill: 'blue', opacity: 0.1 }} />
      <Element position={[60, 48]} anchor={[0, 0]}>
        <SQL>{`\n${normalizedCode}\n`}</SQL>
      </Element>
    </Drawing>
  );
}

function SingleColumnSortingDiagram() {
  const themeColor = useThemeColor();
  const drawingRef = useRef<any>(null);
  const [codeElement, setCodeElement] = useState<HTMLElement | null>(null);
  const bounds = useTextNodeBounds(codeElement, 'DESC', drawingRef);
  const highlightBounds = bounds as any;

  return (
    <Drawing width={500} height={240} ref={drawingRef}>
      <Element position={[0, 24]} anchor={[0, 0]}>
        <SQL setElement={setCodeElement}>{`
SELECT *
FROM companies
ORDER BY name DESC
        `}</SQL>
      </Element>

      <Rectangle dimensions={[[360, 24], [552, 216]]} style={{ fill: themeColor, opacity: 0.2 }} />
      <Rectangle dimensions={[[564, 24], [756, 216]]} style={{ fill: themeColor, opacity: 0.2 }} />
      <Rectangle dimensions={[[768, 24], [960, 216]]} style={{ fill: themeColor, opacity: 0.2 }} />

      {highlightBounds ? (
        <Curve
          points={[highlightBounds.topRight.add([0, 0]), [312, 0], [528, 0], [588, 48]]}
          color={themeColor}
          endArrow
        />
      ) : null}
    </Drawing>
  );
}

export function Theory() {
  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Par>When we receive a result set from a query it is rarely in the exact order we need. SQL lets us describe how rows should be sorted so that the most relevant information shows up first.</Par>

      <Section title="Sort on a single column">
        <Typography variant="body1" component="p">
          Add an <code>ORDER BY</code> clause to the end of the query and specify the column to sort by. Use
          <code> ASC</code> (ascending, the default) or <code> DESC</code> (descending) to control the direction.
        </Typography>
        <SingleColumnSortingDiagram />
      </Section>

      <Section title="Sort based on multiple columns">
        <Typography variant="body1" component="p">
          When the first column contains ties, add additional sort keys separated by commas. SQL compares the second
          column whenever the first column is equal, and so on until the order is determined.
        </Typography>
        <SqlDrawing
          code={`SELECT *
FROM companies
ORDER BY
  country ASC,
  name DESC;`}
        />
      </Section>

      <Section title="Limit the number of rows">
        <Typography variant="body1" component="p">
          Use <code>LIMIT</code> to return only the first <em>n</em> rows of the sorted result set.
        </Typography>
        <SqlDrawing
          code={`SELECT *
FROM companies
ORDER BY name DESC
LIMIT 2;`}
        />
        <Typography variant="body1" component="p">
          Combine <code>LIMIT</code> with <code>OFFSET</code> to skip a number of rows before returning results.
        </Typography>
        <SqlDrawing
          code={`SELECT *
FROM companies
ORDER BY name DESC
LIMIT 2 OFFSET 1;`}
        />
        <Alert severity="warning" variant="outlined">
          Most database engines support <code>LIMIT</code> and <code>OFFSET</code>, but a few use alternative keywords. If
          these clauses do not work in your DBMS, check its documentation for the preferred syntax.
        </Alert>
      </Section>

      <Section title="Deal with NULL values">
        <Typography variant="body1" component="p">
          NULLs are treated as the largest possible values when sorting. They appear last with ascending order and first
          with descending order. Override this behaviour with <code>NULLS FIRST</code> or <code>NULLS LAST</code> per
          column.
        </Typography>
        <SqlDrawing
          code={`SELECT *
FROM companies
ORDER BY country ASC NULLS FIRST;`}
        />
      </Section>
    </Box>
  );
}

export default Theory;
