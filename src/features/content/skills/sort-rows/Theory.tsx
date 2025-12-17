import { Box } from '@mui/material';

import { Vector } from '@/utils/geometry';
import { useRefWithValue, useRefWithElement } from '@/utils/dom';
import { useThemeColor } from '@/theme';
import { Page, Par, Section, Warning, Term, Em } from '@/components';
import { type DrawingData, Drawing, Element, Curve, useTextNodeBounds, useRefWithBounds } from '@/components/figures';
import { useConceptDatabase } from '@/shared/hooks/useDatabase';
import { useQueryResult } from '@/shared/hooks/useQuery';
import { DataTable } from '@/shared/components/DataTable';
import { ISQL, SQLDisplay } from '@/shared/components/SQLEditor';

export function Theory() {
  return <Page>
    <Par>We know how to use SQL to retrieve an entire table. The rows then usually appear in the order in which they have originally been added. If we want a different order, we can <Term>sort</Term> the table. Let's check out how this works.</Par>

    <Section title="Sort on a single column">
      <Par>To sort your results, add an <ISQL>ORDER BY</ISQL> clause to the end of the query and specify the column to sort by. Optionally, add <ISQL>ASC</ISQL> (ascending, default) or <ISQL>DESC</ISQL> (descending) to choose the sorting direction.</Par>
      <FigureSortOnSingleColumn />
      <Par>The exact sorting method depends on the <Term>data type</Term>. For numbers, we sort by magnitude. For text, we sort alphabetically. For dates/times, we sort by which date/time is earlier or later.</Par>
    </Section>

    <Section title="Sort based on multiple columns">
      <Par>When the first column contains sorting ties, then you can add additional sorting attributes separated by commas. Only when the first attribute is equal, will SQL compare the second attribute to determine the order. And then a third attribute, if given, and so forth.</Par>
      <FigureSortOnMultipleColumns />
    </Section>

    <Section title="Limit the number of rows">
      <Par>To limit the number of rows that are returned, add a <ISQL>LIMIT</ISQL> clause, followed by how many rows you want to be returned. Only the <Em>first</Em> couple of rows will then be returned.</Par>
      <FigureLimitRows />
      <Par>Combine <ISQL>LIMIT</ISQL> with <ISQL>OFFSET</ISQL> to skip a number of rows before returning results.</Par>
      <FigureLimitRowsWithOffset />
      <Warning>Most database management systems support <ISQL>LIMIT</ISQL> and <ISQL>OFFSET</ISQL>, but a few use alternative keywords. If these clauses do not work in your DBMS, check its documentation for the preferred syntax.</Warning>
    </Section>

    <Section title="Deal with NULL values">
      <Par>When sorting, <ISQL>NULL</ISQL> values either come at the start or at the end. About half of the DBMSs (including SQLite) treat <ISQL>NULL</ISQL> values as the <Em>smallest</Em> possible value: it comes first on ascending order and last on descending order. The other half of the DBMSs have it the other way around, and treat <ISQL>NULL</ISQL> values as the <Em>largest</Em> possible value. If you want to flip this default behavior, you can override it using <ISQL>NULLS FIRST</ISQL> or <ISQL>NULLS LAST</ISQL>, specified per sorting attribute.</Par>
      <FigureSortNullValues />
    </Section>
  </Page>;
}

function FigureSortOnSingleColumn() {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const sortColumn = 'd_name';
  const query = `
SELECT *
FROM departments
ORDER BY ${sortColumn} DESC;`
  const db = useConceptDatabase();
  const data = useQueryResult(db?.database, query);

  // Find the bounds for "DESC".
  const [eRef, editor] = useRefWithElement<HTMLElement>();
  const descBounds = useTextNodeBounds(editor, 'DESC', drawingData);

  // Find the bounds for "d_name".
  const [tRef, tBounds, table] = useRefWithBounds(drawingData);
  const sortColumnNameBounds = useTextNodeBounds(table, sortColumn, drawingData);

  return <Drawing ref={drawingRef} width={800} height={20 + (tBounds?.height ?? 200)} maxWidth={800} disableSVGPointerEvents>
    <Element ref={eRef} position={[0, 20]} anchor={[-1, -1]} behind>
      <SQLDisplay>{query}</SQLDisplay>
    </Element>

    <Element position={[320, 20]} anchor={[-1, -1]} scale={0.6} behind>
      <Box sx={{ width: 800 }}>
        <DataTable ref={tRef} data={data} showPagination={false} compact />
      </Box>
    </Element>

    {descBounds && sortColumnNameBounds ? <Curve points={[descBounds.topRight.add([0, 0]), [descBounds.right + 70, 0], [sortColumnNameBounds.left - 30, 0], sortColumnNameBounds.leftBottom.add([-12, 8])]} color={themeColor} endArrow /> : null}
    {sortColumnNameBounds && tBounds ? <Curve points={[[sortColumnNameBounds.left - 10, tBounds.bottom - 6], sortColumnNameBounds.leftBottom.add([-10, 12])]} color={themeColor} endArrow /> : null}
  </Drawing>;
}

function FigureSortOnMultipleColumns() {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const sortColumn1 = 'nr_employees';
  const sortColumn2 = 'budget';
  const query = `SELECT *
FROM departments
ORDER BY
  ${sortColumn1} ASC,
  ${sortColumn2} DESC;`
  const db = useConceptDatabase();
  const data = useQueryResult(db?.database, query);

  // Find the bounds for "DESC".
  const [eRef, editor] = useRefWithElement<HTMLElement>();
  const ascBounds = useTextNodeBounds(editor, 'ASC', drawingData);
  const descBounds = useTextNodeBounds(editor, 'DESC', drawingData);

  // Find the bounds for "d_name".
  const [tRef, tBounds, table] = useRefWithBounds(drawingData);
  const sortColumn1NameBounds = useTextNodeBounds(table, sortColumn1, drawingData);
  const sortColumn2NameBounds = useTextNodeBounds(table, sortColumn2, drawingData);

  const drawingHeight = 20 + (tBounds?.height ?? 200) + 20;
  return <Drawing ref={drawingRef} width={800} height={drawingHeight} maxWidth={800} disableSVGPointerEvents>
    {/* SQL query */}
    <Element ref={eRef} position={[0, 20]} anchor={[-1, -1]} behind>
      <SQLDisplay>{query}</SQLDisplay>
    </Element>

    {/* Table */}
    <Element position={[320, 20]} anchor={[-1, -1]} scale={0.6} behind>
      <Box sx={{ width: 800 }}>
        <DataTable ref={tRef} data={data} showPagination={false} compact />
      </Box>
    </Element>

    {/* First sorting arrows */}
    {ascBounds && sortColumn1NameBounds && tBounds ? <>
      <Element position={sortColumn1NameBounds.leftTop.add([-36, -6])} anchor={[-1, 1]}><span style={{ fontWeight: 600, color: themeColor, fontSize: '0.7rem' }}>Primary sorting</span></Element>
      <Curve points={[ascBounds.topRight.add([0, 0]), [ascBounds.right + 70, 0], [sortColumn1NameBounds.left - 30, 0], sortColumn1NameBounds.leftBottom.add([-16, 8])]} color={themeColor} endArrow />
      <Curve points={[sortColumn1NameBounds.leftBottom.add([-14, 12]), [sortColumn1NameBounds.left - 14, tBounds.bottom - 6]]} color={themeColor} endArrow />
    </> : null}

    {/* Second sorting arrows */}
    {descBounds && sortColumn2NameBounds && tBounds ? <>
      <Element position={[sortColumn2NameBounds.left - 34, drawingHeight - 16]} anchor={[-1, -1]}><span style={{ fontWeight: 600, color: themeColor, fontSize: '0.7rem', opacity: 0.5 }}>Secondary sorting</span></Element>
      <Curve points={[descBounds.bottomRight.add([0, 3]), [descBounds.right + 120, drawingHeight], [sortColumn2NameBounds.left - 40, drawingHeight], [sortColumn2NameBounds.left - 14, drawingHeight - 24]]} color={themeColor} endArrow style={{ opacity: 0.5 }} />
      <Curve points={[[sortColumn2NameBounds.left - 12, tBounds.bottom - 6], sortColumn2NameBounds.leftBottom.add([-12, 12])]} color={themeColor} endArrow style={{ opacity: 0.5 }} />
    </> : null}
  </Drawing>;
}

function FigureLimitRows() {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const sortColumn = 'd_name';
  const query = `
SELECT *
FROM departments
ORDER BY ${sortColumn} DESC
LIMIT 3;`
  const db = useConceptDatabase();
  const data = useQueryResult(db?.database, query);

  // Find the bounds for "DESC".
  const [eRef, eBounds, editor] = useRefWithBounds(drawingData);
  const limitBounds = useTextNodeBounds(editor, ';', drawingData);

  // Find the bounds for "d_name".
  const [tRef, tBounds, table] = useRefWithBounds(drawingData);
  const sortColumnNameBounds = useTextNodeBounds(table, sortColumn, drawingData);

  const minY = (sortColumnNameBounds?.bottom ?? 60) + 12;
  const maxY = (tBounds?.bottom ?? 200) - 6;
  const avgY = (minY + maxY) / 2;
  const x = (tBounds?.left ?? 320) - 10;
  return <Drawing ref={drawingRef} width={800} height={Math.max(tBounds?.height ?? 200, eBounds?.height ?? 200)} maxWidth={800} disableSVGPointerEvents>
    <Element ref={eRef} position={[0, 0]} anchor={[-1, -1]} behind>
      <SQLDisplay>{query}</SQLDisplay>
    </Element>

    <Element position={[320, 0]} anchor={[-1, -1]} scale={0.6} behind>
      <Box sx={{ width: 800 }}>
        <DataTable ref={tRef} data={data} showPagination={false} compact />
      </Box>
    </Element>

    {limitBounds && sortColumnNameBounds ? <Curve points={[limitBounds.middleRight.add([2, 2]), limitBounds.middleRight.add([70, 2]), [x - 30, avgY], [x - 8, avgY]]} color={themeColor} endArrow /> : null}

    {sortColumnNameBounds && tBounds ? <Curve points={[[x, minY], [x, maxY]]} color={themeColor} arrow /> : null}
  </Drawing>;
}

function FigureLimitRowsWithOffset() {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const sortColumn = 'd_name';
  const offset = 1;
  const query = `
SELECT *
FROM departments
ORDER BY ${sortColumn} DESC
LIMIT 3 OFFSET ${offset};`
  const db = useConceptDatabase();
  const data = useQueryResult(db?.database, query);

  // Find the bounds for "DESC".
  const [eRef, eBounds, editor] = useRefWithBounds(drawingData);
  const offsetBounds = useTextNodeBounds(editor, ';', drawingData);

  // Find the bounds for "d_name".
  const [tRef, tBounds, table] = useRefWithBounds(drawingData);
  const sortColumnNameBounds = useTextNodeBounds(table, sortColumn, drawingData);

  const point = tBounds && sortColumnNameBounds && new Vector(tBounds.left - 4, sortColumnNameBounds.bottom + 10);
  return <Drawing ref={drawingRef} width={800} height={Math.max(tBounds?.height ?? 200, eBounds?.height ?? 200)} maxWidth={800} disableSVGPointerEvents>
    <Element ref={eRef} position={[0, 0]} anchor={[-1, -1]} behind>
      <SQLDisplay>{query}</SQLDisplay>
    </Element>

    <Element position={[320, 0]} anchor={[-1, -1]} scale={0.6} behind>
      <Box sx={{ width: 800 }}>
        <DataTable ref={tRef} data={data} showPagination={false} compact />
      </Box>
    </Element>

    {point ? <Element position={point} anchor={[1, 0]} scale={0.6} behind>
      <span style={{ color: themeColor, fontWeight: 600 }}>+{offset}</span>
    </Element> : null}

    {offsetBounds && point ? <Curve points={[offsetBounds.middleRight.add([2, 2]), offsetBounds.middleRight.add([70, 2]), point.add([-40, 0]), point.add([-14, 0])]} color={themeColor} endArrow /> : null}
  </Drawing>;
}

function FigureSortNullValues() {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const sortColumn = 'budget';
  const query = `
SELECT *
FROM departments
ORDER BY ${sortColumn} ASC NULLS LAST;`
  const db = useConceptDatabase();
  const data = useQueryResult(db?.database, query);

  // Find the bounds for "DESC".
  const [eRef, editor] = useRefWithElement<HTMLElement>();
  const descBounds = useTextNodeBounds(editor, 'DESC', drawingData);

  // Find the bounds for "d_name".
  const [tRef, tBounds, table] = useRefWithBounds(drawingData);
  const sortColumnNameBounds = useTextNodeBounds(table, sortColumn, drawingData);

  return <Drawing ref={drawingRef} width={800} height={20 + (tBounds?.height ?? 200)} maxWidth={800} disableSVGPointerEvents>
    <Element ref={eRef} position={[0, 20]} anchor={[-1, -1]} behind>
      <SQLDisplay>{query}</SQLDisplay>
    </Element>

    <Element position={[320, 20]} anchor={[-1, -1]} scale={0.6} behind>
      <Box sx={{ width: 800 }}>
        <DataTable ref={tRef} data={data} showPagination={false} compact />
      </Box>
    </Element>

    {descBounds && sortColumnNameBounds ? <Curve points={[descBounds.topRight.add([0, 0]), [descBounds.right + 70, 0], [sortColumnNameBounds.left - 30, 0], sortColumnNameBounds.leftBottom.add([-12, 8])]} color={themeColor} endArrow /> : null}
    {sortColumnNameBounds && tBounds ? <Curve points={[sortColumnNameBounds.leftBottom.add([-10, 12]), [sortColumnNameBounds.left - 10, tBounds.bottom - 6]]} color={themeColor} endArrow /> : null}
  </Drawing>;
}
