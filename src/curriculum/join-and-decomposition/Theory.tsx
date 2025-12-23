import { Box } from '@mui/material';

import { useRefWithValue } from '@/utils/dom';
import { useThemeColor } from '@/theme';
import { Page, Section, Par, List, Warning, Info, Term, Em, ISQL } from '@/components';
import { type DrawingData, Drawing, Element, Curve, Rectangle, useRefWithBounds, useTextNodeBounds } from '@/components';
import { useTheorySampleDatabase } from '@/hooks/useDatabase';
import { useQueryResult } from '@/hooks/useQuery';
import { DataTable } from '@/components';

import { FigureSingleTable } from '../queryFigures';
import { FigureTwoTables } from '../database/Theory';

const adjustedManagerId = '11111111';
const addedManagerId = '41655533';
const adjustedDepartments = `SELECT
  d_id, d_name,
  CASE
      WHEN d_id = 2000 THEN ${adjustedManagerId}
      WHEN d_id = 4000 THEN ${addedManagerId}
      ELSE manager_id
  END AS manager_id,
  budget, nr_employees FROM departments`;

export function Theory() {
  return <Page>
    <Section>
      <Par>We know that foreign keys can be used as references to other tables. We can use this to combine various tables into one big table. Let's take a look at how that works.</Par>
    </Section>

    <Section title="Join: use a foreign key to pull tables together">
      <Par>Let's consider two tables that are linked through a foreign key. For instance consider the tables for departments (with manager) and for employees.</Par>
      <FigureTwoTables />
      <Par>Let's say that we want a list of all departments <Em>including</Em> all attributes of the corresponding managers. In other words, we want all data in one big table. We could combine the two tables into one: we can <Term>join</Term> the tables.</Par>
      <Par>For the join to make sense, we must have one table (often placed on the left) with a foreign key to the other table (placed on the right). To execute the join, we walk through all the rows of the left table, and look up the respective record of the right table. We add this data to the back of the row. If we do this for all rows, we get the joined table. It has columns from both tables.</Par>
      <FigureSingleTable query={`SELECT * FROM departments d JOIN employees e ON d.manager_id=e.e_id;`} tableScale={0.6} tableWidth={1100} />
    </Section>

    <Section title="Decomposition: split a table into two through a foreign key">
      <Par>Note that in the joined table we found above, there could be duplicate data. If one manager manages two departments, then their contact data is mentioned multiple times! Storing such a table is not good database design. When we find a table like this, we should perform a decomposition. A <Term>decomposition</Term> is the opposite of a join: it splits a table up into two separate linked tables.</Par>
      <Par>When decomposing a table, we basically take three steps.</Par>
      <List useNumbers items={[
        <>Make a list of all the attributes that might potentially be repeated, and should be grouped into a separate table. For the example above, that's all employee properties, being <ISQL>{`{e_id, first_name, last_name, phone, email, address, city, hire_date, current_salary}`}</ISQL>.</>,
        <>Set up this new separate table, make sure there are no duplicate rows, and define the table's primary key.</>,
        <>Remove all respective columns from the large table <Em>except</Em> the ones we put in the primary key. These are kept, to be used as foreign key. (If the primary key is present twice, obviously only include it once, with a sensible name.)</>,
      ]} />
      <Par>If we take these steps for the above example, we wind up with the tables we started with.</Par>
      <FigureTwoTables />
    </Section>

    <Section title="The natural join: require equal-named columns to be equal">
      <Par>Whenever we do a join, we have to specify how this join is performed: which foreign key is used? This is common practice. However, in quite a few cases, the join is performed on attributes with exactly the <Em>same name</Em>. When this is the case, we can apply a short-cut: the so-called natural join. A <Term>natural join</Term> is a join where we use all <Em>equally-named attributes</Em> as foreign key, linking the two tables. These equally-named attributes are then required to be equal.</Par>
      <Par>Let's show how this works with the example from before. Currently, when we join the tables, we have to specify that <ISQL>manager_id</ISQL> from one table has to equal <ISQL>e_id</ISQL> from the other table. But what if, within the <ISQL>departments</ISQL> table, the attribute was already called <ISQL>e_id</ISQL>? In that case, we could instantly perform a natural join. We wouldn't have to specify anymore how to perform the join, as it's implicit!</Par>
      <FigureNaturalJoin />
      <Warning>Using natural joins in practice is somewhat risky. If both tables wind up getting some other column with equal name (columns named "name", "date" or "quantity" are very common after all) then this attribute is automatically used in the join as well. The natural join requires this attribute to be equal too then! Because of this easy oversight, natural joins are in practice discouraged.</Warning>
    </Section>

    <Section title="Outer joins: keep rows with missing references">
      <Par>Let's study the joining of departments and employees again. So far we've had a pretty ideal case: all departments had exactly one manager, and all employees managed at least one department. But what if that's not the case?</Par>
      <Par>To show how this works, first let's make our example data a bit messier. <List items={[
        <>We change the manager of Public Relations to a non-existing employee with ID <ISQL>{adjustedManagerId}</ISQL>.</>,
        <>We change the manager of Human Resources to Paris Casteel with ID <ISQL>{addedManagerId}</ISQL>, so that she manages two departments.</>,
      ]} />
        Note that this leaves both Ceaser Bink and Marcelle Johnson without a department to manage.</Par>
      <FigureTwoTablesAdjusted />
      <Par>If we join the tables again, how do we deal with these missing links? There are actually four common ways to deal with this.</Par>
      <List items={[
        <>
          <Par>In the <Term>inner join</Term> (the default method) employees without a department or departments without an existing employee are ignored during the join. Since no valid matching is present, these entries disappear completely.</Par>
          <Par sx={{ my: 1 }}><FigureSingleTable query={`SELECT * FROM (${adjustedDepartments}) d INNER JOIN employees e ON d.manager_id=e.e_id;`} tableScale={0.6} tableWidth={1100} /></Par>
        </>,
        <>
          <Par>In the <Term>left (outer) join</Term> we <Em>always</Em> keep the rows from the left table (departments). If no matching row exists from the right table (employees) then we include <ISQL>NULL</ISQL> values to show something is missing. (But rows from the right table will still disappear on missing matchings.)</Par>
          <Par sx={{ my: 1 }}><FigureSingleTable query={`SELECT * FROM (${adjustedDepartments}) d LEFT JOIN employees e ON d.manager_id=e.e_id;`} tableScale={0.6} tableWidth={1100} /></Par>
        </>,
        <>
          <Par>In the <Term>right (outer) join</Term> we <Em>always</Em> keep the rows from the right table (employees). If no matching row exists from the left table (departments) then we include <ISQL>NULL</ISQL> values to show something is missing. (But rows from the left table will still disappear on missing matchings.)</Par>
          <Par sx={{ my: 1 }}><FigureSingleTable query={`SELECT * FROM (${adjustedDepartments}) d RIGHT JOIN employees e ON d.manager_id=e.e_id;`} tableScale={0.6} tableWidth={1100} /></Par>
        </>,
        <>
          <Par>In the <Term>full (outer) join</Term> we <Em>always</Em> keep the rows from <Em>both</Em> tables. If any row from either table is without a matching row from the other table, we include <ISQL>NULL</ISQL> values. This ensures data never disappears.</Par>
          <Par sx={{ my: 1 }}><FigureSingleTable query={`SELECT * FROM (${adjustedDepartments}) d FULL JOIN employees e ON d.manager_id=e.e_id;`} tableScale={0.6} tableWidth={1100} /></Par>
        </>,
      ]} />
      <Info>Note that the distinction between natural/non-natural join is completely different from the distinction between inner/outer join. The first issue is about "Do we manually specify on which attributes to perform the join, or do we just pick equally named attributes?" The second issue is about "How do we handle entries without a matching reference?" When we talk about a "join" we usually refer to the the non-natural inner join, but you could very well apply a natural full outer join too.</Info>
    </Section>
  </Page>;
}

function FigureNaturalJoin() {
  const themeColor = useThemeColor();

  // Get the data.
  const db = useTheorySampleDatabase();
  const query1 = 'SELECT d_id, d_name, manager_id e_id, budget, nr_employees FROM departments';
  const data1 = useQueryResult(db?.database, query1);
  const data2 = useQueryResult(db?.database, 'SELECT * FROM employees;');
  const data3 = useQueryResult(db?.database, `SELECT * FROM (${query1}) d NATURAL JOIN employees e;`);

  // Set up reference to the table.
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();
  const [t1Ref, t1Bounds, table1] = useRefWithBounds(drawingData);
  const [t2Ref, t2Bounds, table2] = useRefWithBounds(drawingData);
  const [t3Ref, t3Bounds] = useRefWithBounds(drawingData);
  const textNode1Bounds = useTextNodeBounds(table1, 'e_id', drawingData, 0, 1);
  const textNode2Bounds = useTextNodeBounds(table2, 'e_id', drawingData, 0, 1);
  const x = 80;
  const y1 = 20 + (t1Bounds?.height ?? 160) + 15;
  const y2 = y1 + (t2Bounds?.height ?? 160);
  const y3 = y2 + 60;
  const width = 800;
  const height = y3 + (t3Bounds?.height ?? 160);

  return <Drawing ref={drawingRef} width={width} height={height} maxWidth={width}>
    <Element position={[10, 0]} anchor={[-1, -1]}><span style={{ fontWeight: 500, fontSize: '0.8em' }}>List of departments</span></Element>
    <Element ref={t1Ref} position={[0, 25]} anchor={[-1, -1]} scale={0.6} behind>
      <Box sx={{ width: 480 / 0.6 }}>
        <DataTable data={data1} showPagination={false} compact />
      </Box>
    </Element>

    {t1Bounds ? <>
      <Element position={[790, y1 - 25]} anchor={[1, -1]}><span style={{ fontWeight: 500, fontSize: '0.8em' }}>List of employees</span></Element>
      <Element ref={t2Ref} position={[x, y1]} anchor={[-1, -1]} scale={0.6} behind>
        <Box sx={{ width: (width - x) / 0.6 }}>
          <DataTable data={data2} showPagination={false} compact />
        </Box>
      </Element>

      {t2Bounds ? <>
        <Curve points={[[width / 2, y2 + 4], [width / 2, y3 - 4]]} color={themeColor} endArrow />
        <Element position={[width / 2 + 6, (y2 + y3) / 2 - 4]} anchor={[-1, 0]}><span style={{ fontWeight: 500, fontSize: '0.8em', color: themeColor }}>Natural join</span></Element>

        <Element ref={t3Ref} position={[0, y3]} anchor={[-1, -1]} scale={0.45}>
          <Box sx={{ width: width / 0.45 }}>
            <DataTable data={data3} showPagination={false} compact />
          </Box>
        </Element>
      </> : null}
    </> : null}

    {textNode1Bounds ? <Rectangle dimensions={textNode1Bounds} cornerRadius={10} style={{ stroke: themeColor, strokeWidth: 2, fill: 'none' }} /> : null}
    {textNode2Bounds ? <Rectangle dimensions={textNode2Bounds} cornerRadius={10} style={{ stroke: themeColor, strokeWidth: 2, fill: 'none' }} /> : null}
  </Drawing>;
}

function FigureTwoTablesAdjusted() {
  const themeColor = useThemeColor();

  // Get the data.
  const db = useTheorySampleDatabase();
  const data1 = useQueryResult(db?.database, adjustedDepartments);
  const data2 = useQueryResult(db?.database, 'SELECT * FROM employees;');

  // Set up reference to the table.
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();
  const [t1Ref, t1Bounds, table1] = useRefWithBounds(drawingData);
  const [t2Ref, t2Bounds] = useRefWithBounds(drawingData);
  const textNode1Bounds = useTextNodeBounds(table1, adjustedManagerId, drawingData, 0, 2);
  const textNode2Bounds = useTextNodeBounds(table1, addedManagerId, drawingData, 1, 2);
  const x = 80;
  const y = 20 + (t1Bounds?.height ?? 160) + 15;

  return <Drawing ref={drawingRef} width={800} height={y + (t2Bounds?.height ?? 200)} maxWidth={800}>
    <Element position={[10, 0]} anchor={[-1, -1]}><span style={{ fontWeight: 500, fontSize: '0.8em' }}>List of departments</span></Element>
    <Element ref={t1Ref} position={[0, 25]} anchor={[-1, -1]} scale={0.6} behind>
      <Box sx={{ width: 800 }}>
        <DataTable data={data1} showPagination={false} compact />
      </Box>
    </Element>

    <Element position={[790, y - 25]} anchor={[1, -1]}><span style={{ fontWeight: 500, fontSize: '0.8em' }}>List of employees</span></Element>
    <Element ref={t2Ref} position={[x, y]} anchor={[-1, -1]} scale={0.6}>
      <Box sx={{ width: (800 - x) / 0.6 }}>
        <DataTable data={data2} showPagination={false} compact />
      </Box>
    </Element>

    {textNode1Bounds ? <Rectangle dimensions={textNode1Bounds} cornerRadius={10} style={{ stroke: themeColor, strokeWidth: 2, fill: 'none' }} /> : null}
    {textNode2Bounds ? <Rectangle dimensions={textNode2Bounds} cornerRadius={10} style={{ stroke: themeColor, strokeWidth: 2, fill: 'none' }} /> : null}
  </Drawing>;
}
