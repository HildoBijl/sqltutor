import { Box } from '@mui/material';

import { useRefWithValue, useRefWithElement } from '@/utils/dom';
import { useThemeColor } from '@/theme';
import { Page, Par, Section, Info, Warning, Term, Em } from '@/components';
import { type DrawingData, Drawing, Element, Curve, useTextNodeBounds, useRefWithBounds } from '@/components';
import { useTheorySampleDatabase } from '@/learning/databases';
import { useQueryResult } from '@/components/sql/sqljs';
import { DataTable, ISQL, SQLDisplay } from '@/components';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know how we can retrieve an entire table in <Term>SQL</Term>, but how do we select only a few of the columns? We'll study the commands needed for it and the options that can be added.</Par>
    </Section>

    <Section title="Select columns (projection)">
      <Par>To retrieve <Em>all</Em> columns from a table, we use <ISQL>SELECT *</ISQL> which means "select all". If we only want to select <Em>specific</Em> columns (apply <Term>projection</Term>) then we have to specify the column names, separated by commas.</Par>
      <FigureSelectColumns />
      <Warning>It is strongly recommended to always pick column and table names that have no spaces and are in lower case. Instead of spaces, use underscores "_". If you really want to deviate from this, you need to wrap the names in <Em>double</Em> quotation marks, like <ISQL>SELECT "First Name" FROM "All Employees";</ISQL> or similar. For column and table names without spaces/uppercase, these quotation marks are allowed but unnecessary.</Warning>
    </Section>

    <Section title="Select unique values">
      <Par>Ideally, in a "clean" database, every table row is unique. Having <Term>duplicate rows</Term> (two rows in which every individual attribute has the same value) is theoretically possible in SQL, but it is not a good habit.</Par>
      <Par>When we select columns, it often <Em>does</Em> occur that we get duplicate rows. To filter those out, we can add the keyword <ISQL>DISTINCT</ISQL> right after <ISQL>SELECT</ISQL>. This instructs the DBMS to squash sets of duplicates into single rows before returning the result.</Par>
      <FigureSelectUnique />
    </Section>

    <Section title="Rename columns">
      <Par>In database tables the columns have names. When retrieving a table, we can optionally adjust the names that the columns have in our output. To <Term>rename</Term> a column, we add the keyword <ISQL>AS</ISQL> followed by the new name of the column.</Par>
      <FigureRenameColumns query={`SELECT
  first_name,
  last_name AS family_name,
  phone AS number
FROM employees;`} />
      <Info>The keyword <ISQL>AS</ISQL> is optional, and it works just as well without. For readability, it is still recommended to add it.</Info>
    </Section>

    <Section title="Deal with multiple tables">
      <Par>So far we have run queries that only request a single table. Later on we will encounter queries involving multiple tables. In that case it may be confusing which column comes from which table, especially if the two tables have columns with the same name. We can indicate what specific table to select a column from through the format <ISQL>table_name.column_name</ISQL>.</Par>
      <FigureRenameColumns query={`SELECT
  employees.first_name,
  employees.last_name AS family_name,
  employees.phone AS number
FROM employees;`} />
      <Par>When the two tables don't have duplicate column names, this table specification is generally not needed, but it is still recommended for clarity. When the two tables do have duplicate column names, this notation is obligatory.</Par>
      <Par>In case the table names are long, we can also <Term>alias</Term> our tables: temporarily rename them within this specific query. This creates a shorter query, which may improve readability. Just as with columns, we may remove <ISQL>AS</ISQL>, but its usage is recommended for readability.</Par>
      <FigureRenameColumns query={`SELECT
  e.first_name,
  e.last_name AS family_name,
  e.phone AS number
FROM employees AS e;`} />
    </Section>
  </Page>;
}

function FigureSelectColumns() {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const c1 = 'first_name', c2 = 'last_name', c3 = 'city';
  const query = `
SELECT ${c1}, ${c2}, ${c3}
FROM employees;`
  const db = useTheorySampleDatabase();
  const data = useQueryResult(db?.database, query);

  // Find the editor bounds.
  const [eRef, editor] = useRefWithElement<HTMLElement>();
  const c1QueryBounds = useTextNodeBounds(editor, c1, drawingData);
  const c2QueryBounds = useTextNodeBounds(editor, c2, drawingData);
  const c3QueryBounds = useTextNodeBounds(editor, c3, drawingData);

  // Find the table column name bounds.
  const [tRef, tBounds, table] = useRefWithBounds(drawingData);
  const c1NameBounds = useTextNodeBounds(table, c1, drawingData);
  const c2NameBounds = useTextNodeBounds(table, c2, drawingData);
  const c3NameBounds = useTextNodeBounds(table, c3, drawingData);

  return <Drawing ref={drawingRef} width={800} height={20 + (tBounds?.height || 200)} maxWidth={800} disableSVGPointerEvents>
    <Element ref={eRef} position={[0, 20]} anchor={[-1, -1]} behind>
      <SQLDisplay>{query}</SQLDisplay>
    </Element>

    <Element position={[350, 20]} anchor={[-1, -1]} scale={0.8} behind>
      <Box sx={{ width: 450 / 0.8 }}>
        <DataTable ref={tRef} data={data} showPagination={false} compact />
      </Box>
    </Element>

    {c1QueryBounds && c1NameBounds && c2QueryBounds && c2NameBounds && c3QueryBounds && c3NameBounds ? <>
      <Curve points={[c1QueryBounds.topRight.add([0, 2]), [c1QueryBounds.right + 40, 0], [c1NameBounds.left - 40, 0], c1NameBounds.leftTop.add([-2, 2])]} color={themeColor} endArrow />
      <Curve points={[c2QueryBounds.topRight.add([0, 2]), [c2QueryBounds.right + 40, 0], [c2NameBounds.left - 40, 0], c2NameBounds.leftTop.add([-2, 2])]} color={themeColor} endArrow />
      <Curve points={[c3QueryBounds.topRight.add([0, 2]), [c3QueryBounds.right + 40, 0], [c3NameBounds.left - 40, 0], c3NameBounds.leftTop.add([-2, 2])]} color={themeColor} endArrow />
    </> : null}
  </Drawing>;
}

function FigureSelectUnique() {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const c = 'city';
  const query1 = `
SELECT ${c}
FROM employees;`;
  const query2 = `
SELECT DISTINCT ${c}
FROM employees;`;
  const db = useTheorySampleDatabase();
  const data1 = useQueryResult(db?.database, query1);
  const data2 = useQueryResult(db?.database, query2);

  // Find the table column name bounds.
  const [e1Ref, e1Bounds] = useRefWithBounds(drawingData);
  const [e2Ref, e2Bounds] = useRefWithBounds(drawingData);
  const [t1Ref, t1Bounds] = useRefWithBounds(drawingData);
  const [t2Ref, t2Bounds] = useRefWithBounds(drawingData);

  // Set up dimensions.
  const w1 = e1Bounds?.width || 100;
  const w2 = t1Bounds?.width || 100;
  const w3 = e2Bounds?.width || 100;
  const w4 = t2Bounds?.width || 100;
  const delta1 = 20;
  const delta2 = 40;
  const width = w1 + w2 + w3 + w4 + 2 * delta1 + delta2;
  const height = Math.max(t1Bounds?.height || 200, t2Bounds?.height || 200);

  return <Drawing ref={drawingRef} width={width} height={height} maxWidth={width} disableSVGPointerEvents>
    <Element ref={e1Ref} position={[0, 0]} anchor={[-1, -1]} behind>
      <SQLDisplay>{query1}</SQLDisplay>
    </Element>

    <Element ref={e2Ref} position={[w1 + delta1 + w2 + delta2, 0]} anchor={[-1, -1]} behind>
      <SQLDisplay>{query2}</SQLDisplay>
    </Element>

    <Element position={[w1 + delta1, 0]} anchor={[-1, -1]} scale={0.8} behind>
      <Box sx={{ width: 160 / 0.8 }}>
        <DataTable ref={t1Ref} data={data1} showPagination={false} compact />
      </Box>
    </Element>
    <Element position={[w1 + delta1 + w2 + delta2 + w3 + delta1, 0]} anchor={[-1, -1]} scale={0.8} behind>
      <Box sx={{ width: 160 / 0.8 }}>
        <DataTable ref={t2Ref} data={data2} showPagination={false} compact />
      </Box>
    </Element>

    {e1Bounds && t1Bounds ? <>
      <Curve points={[e1Bounds.bottomMiddle.add([0, 5]), [e1Bounds.middle.x, t1Bounds.middle.y + e1Bounds.height / 2], t1Bounds.leftMiddle.add([-4, e1Bounds.height / 2])]} color={themeColor} curveDistance={60} endArrow />
    </> : null}
    {e2Bounds && t2Bounds ? <>
      <Curve points={[e2Bounds.bottomMiddle.add([0, 5]), [e2Bounds.middle.x, t2Bounds.middle.y + e2Bounds.height / 2], t2Bounds.leftMiddle.add([-4, e2Bounds.height / 2])]} color={themeColor} curveDistance={60} endArrow />
    </> : null}
  </Drawing>;
}

export function FigureRenameColumns({ query = '' }) {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const db = useTheorySampleDatabase();
  const data = useQueryResult(db?.database, query);

  // Find the element bounds.
  const [eRef, eBounds] = useRefWithBounds(drawingData);
  const [tRef, tBounds] = useRefWithBounds(drawingData);
  const arrowWidth = 80;
  const width = (eBounds?.width || 200) + (tBounds?.width || 200) + arrowWidth;

  return <Drawing ref={drawingRef} width={width} height={tBounds?.height || 200} maxWidth={width} disableSVGPointerEvents>
    <Element ref={eRef} position={[0, 0]} anchor={[-1, -1]} behind>
      <SQLDisplay>{query}</SQLDisplay>
    </Element>

    <Element position={[(eBounds?.width || 200) + arrowWidth, 0]} anchor={[-1, -1]} scale={0.8} behind>
      <Box sx={{ width: 350 / 0.8 }}>
        <DataTable ref={tRef} data={data} showPagination={false} compact />
      </Box>
    </Element>

    {eBounds && tBounds ? <Curve points={[eBounds.middleRight.add([4, 0]), [tBounds.left - 4, eBounds.middle.y]]} color={themeColor} endArrow /> : null}
  </Drawing>;
}
