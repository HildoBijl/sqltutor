import { Box } from '@mui/material';

import { useRefWithValue } from '@/utils/dom';
import { useThemeColor } from '@/theme';
import { Page, Par, Quote, List, Section, Warning, Info, Term, Em } from '@/components';
import { type DrawingData, Drawing, Element, Rectangle, useTextNodeBounds, useRefWithBounds } from '@/components';
import { useTheorySampleDatabase } from '@/hooks/useDatabase';
import { useQueryResult } from '@/hooks/useQuery';
import { DataTable, ISQL } from '@/components';

import { FigureExampleQuery } from '../queryFigures';
import { adjustedManagerId, addedManagerId, adjustedDepartments, FigureTwoTablesAdjusted } from '../join-and-decomposition/Theory';

const departmentsReplacement = `SELECT d_id, d_name, manager_id e_id, budget, nr_employees FROM departments`;

export function Theory() {
  return <Page>
    <Section>
      <Par>SQL has a variety of ways in which tables can be joined. We can join tables with the <ISQL>FROM/WHERE</ISQL> command or with the <ISQL>JOIN</ISQL> command. For the latter, there are various short-cuts and other options. Let's take a look at how it all works.</Par>
    </Section>

    <Section title={<>Join tables using <ISQL>FROM/WHERE</ISQL></>}>
      <Par>Suppose we get the following assignment.</Par>
      <Quote>For each department with more than five employees, show the manager (first and last name) and the budget.</Quote>
      <Par>To set up such an overview, we need data from both the <ISQL>departments</ISQL> table (the department name and budget) and the <ISQL>employees</ISQL> table (the manager's first/last name). We have to join the two tables! How do we do so in SQL?</Par>
      <Par>We know that a join is basically a Cartesian product followed by a filter. To set up a Cartesian product in SQL, you can add multiple tables to the <ISQL>WHERE</ISQL> clause. When you do, SQL sets up a large table with one row for each possible <Em>combination</Em> of rows from the first and second table.</Par>
      <FigureExampleQuery query={`SELECT *
FROM departments, employees;`} tableScale={0.45} tableWidth={800} below />
      <Warning>You can also take the Cartesian product of even more tables. Note that the number of rows in such a Cartesian product grows very rapidly. Be careful setting up the Cartesian product of several large tables.</Warning>
      <Par>To complete the join, we have to add a filter to the Cartesian product. Specifically, we require the foreign key reference to match: <ISQL>manager_id</ISQL> must equal <ISQL>e_id</ISQL>.</Par>
      <FigureExampleQuery query={`SELECT *
FROM departments, employees
WHERE departments.manager_id = employees.e_id;`} tableScale={0.45} tableWidth={800} below />
      <Par>This has completed the join! The above query hence joins the two tables together.</Par>
      <Par>To solve the given assignment, we can add extra filtering conditions, select the right columns for the output, and use aliasing to shorten the notation. That gives the full query.</Par>
      <FigureExampleQuery query={`SELECT d_name, budget, first_name, last_name
FROM departments AS d, employees AS e
WHERE d.manager_id = e.e_id AND d.nr_employees > 5;`} tableScale={0.6} tableWidth={300} />
    </Section>

    <Section title={<>Join tables using <ISQL>JOIN</ISQL></>}>
      <Par>Let's take a look at the <ISQL>WHERE</ISQL> clause of the above query. The first condition in this clause is a <Term>join condition</Term>: it is the requirement, when joining the tables, that the foreign keys are equal. The second condition is an <Term>external condition</Term>: for whatever reason, we are only interested in departments with more than five people. At the moment, the join conditions and external conditions are both mixed up in the same clause. That's confusing!</Par>
      <Par>To make queries easier to understand, it is helpful to keep join conditions and external conditions separate. That's exactly where the <ISQL>JOIN</ISQL> command comes in. Using <ISQL>JOIN</ISQL> goes in three steps. <List items={[
        <>Put one table in the <ISQL>FROM</ISQL> clause.</>,
        <>Use a <ISQL>JOIN</ISQL> clause to specify the second table to be joined in.</>,
        <>Add an <ISQL>ON</ISQL> clause that specifies the conditions required for the join.</>,
      ]} /></Par>
      <FigureExampleQuery query={`SELECT *
FROM departments
JOIN employees
ON departments.manager_id = employees.e_id;`} tableScale={0.45} tableWidth={800} below />
      <Par>The above query is a join in its simplest form. We can of course once more add in extra conditions with a <ISQL>WHERE</ISQL> clause, select columns at <ISQL>SELECT</ISQL>, and apply aliasing where appropriate.</Par>
      <FigureExampleQuery query={`SELECT d_name, budget, first_name, last_name
FROM departments AS d
JOIN employees AS e
ON d.manager_id = e.e_id
WHERE d.nr_employees > 5;`} tableScale={0.6} tableWidth={300} />
      <Par>The above query does <Em>exactly</Em> the same as the join from before, but now we have smoothly separated join conditions from external conditions. It's easier to read!</Par>
    </Section>

    <Section title={<>Use the natural join short-cut</>}>
      <Par>Previously we required the column <ISQL>manager_id</ISQL> from one table to equal the column <ISQL>e_id</ISQL> from another table. In practice, it often happens that both columns related to a foreign key already have the same name. Perhaps the column <ISQL>manager_id</ISQL> actually already has the name <ISQL>e_id</ISQL>? In this case there are various short-cuts possible!</Par>
      <FigureNaturalJoinAdjustedTables />
      <Par>The first option is to use the <ISQL>NATURAL JOIN</ISQL>. This automatically requires all columns with equal name to be equal. When we use the natural join, the DBMS will go through the column names from both tables, find all pairs of matching column names, and it requires all these values to then be equal.</Par>
      <FigureExampleQuery query={`SELECT *
FROM departments
NATURAL JOIN employees;`} actualQuery={`SELECT *
FROM (${departmentsReplacement}) AS departments
NATURAL JOIN employees;`} tableScale={0.45} tableWidth={800} below />
      <Par>This works well! But what happens when the two tables have another column name in common? What would we for instance do if both the column for department name  <ISQL>name</ISQL> and the column for employee last name are called <ISQL>name</ISQL>? In that case, the natural join would require these columns to be equal too! That's not what we want.</Par>
      <Par>For this use case, there is an in-between solution: we can manually specify which columns have to be equal. This is done through <ISQL>JOIN table_name USING (column_name1, column_name2, ...)</ISQL>. Note that the brackets indicate a <Em>list</Em> of column names.</Par>
      <FigureExampleQuery query={`SELECT *
FROM departments
JOIN employees
USING (e_id);`} actualQuery={`SELECT *
FROM (${departmentsReplacement}) AS departments
JOIN employees
USING (e_id);`} tableScale={0.45} tableWidth={800} below />
      <Par>With this solution, we can manually specify which column names to use for the natural join.</Par>
      <Info>The commands <ISQL>NATURAL JOIN</ISQL> and <ISQL>JOIN ... USING</ISQL> are mostly short-cuts for <ISQL>JOIN ... ON</ISQL> for specific situations, but they do have an added benefit. They automatically remove duplicate columns. When using <ISQL>JOIN ... ON</ISQL>, there wil be two columns <ISQL>e_id</ISQL>. These short-cuts neatly drop one of them, since it is clear that these columns have equal values.</Info>
    </Section>

    <Section title={<>Use inner and outer joins</>}>
      <Par>When joining tables, there could be missing matches. Let's mess up our data and create some missing matches, to show how we can deal with them.
        <List items={[
          <>We change the manager of Public Relations to a non-existing employee with ID <ISQL>{adjustedManagerId}</ISQL>.</>,
          <>We change the manager of Human Resources to Paris Casteel with ID <ISQL>{addedManagerId}</ISQL>. She now manages two departments.</>,
        ]} /></Par>
      <FigureTwoTablesAdjusted />
      <Par>Note that there is now one department without a manager, and two employees without a department to manage. There are four ways to deal with these missing matches.</Par>
      <List items={[
        <>
          <Par>In the <Term>inner join</Term> any rows with missing matches are dropped from the output.</Par>
          <Par sx={{ my: 1 }}><FigureExampleQuery query={`SELECT *
FROM departments AS d
INNER JOIN employees AS e
ON d.manager_id = e.e_id`} actualQuery={`SELECT * FROM (${adjustedDepartments}) d INNER JOIN employees e ON d.manager_id=e.e_id;`} tableScale={0.6} tableWidth={1100} below /></Par>
        </>,
        <>
          <Par>In the <Term>left (outer) join</Term> the rows from the left table are always kept.</Par>
          <Par sx={{ my: 1 }}><FigureExampleQuery query={`SELECT *
FROM departments AS d
LEFT JOIN employees AS e
ON d.manager_id = e.e_id`} actualQuery={`SELECT * FROM (${adjustedDepartments}) d LEFT JOIN employees e ON d.manager_id=e.e_id;`} tableScale={0.6} tableWidth={1100} below /></Par>
        </>,
        <>
          <Par>In the <Term>right (outer) join</Term> the rows from the right table are always kept.</Par>
          <Par sx={{ my: 1 }}><FigureExampleQuery query={`SELECT *
FROM departments AS d
RIGHT JOIN employees AS e
ON d.manager_id = e.e_id`} actualQuery={`SELECT * FROM (${adjustedDepartments}) d RIGHT JOIN employees e ON d.manager_id=e.e_id;`} tableScale={0.6} tableWidth={1100} below /></Par>
        </>,
        <>
          <Par>In the <Term>full (outer) join</Term> the rows from <Em>both</Em> table are always kept.</Par>
          <Par sx={{ my: 1 }}><FigureExampleQuery query={`SELECT *
FROM departments AS d
FULL JOIN employees AS e
ON d.manager_id = e.e_id`} actualQuery={`SELECT * FROM (${adjustedDepartments}) d FULL JOIN employees e ON d.manager_id=e.e_id;`} tableScale={0.6} tableWidth={1100} below /></Par>
        </>,
      ]} />
      <Info>The default join is the inner join. The commands <ISQL>JOIN</ISQL> and <ISQL>INNER JOIN</ISQL> do the exact same thing.</Info>
    </Section>
  </Page>;
}

function FigureNaturalJoinAdjustedTables() {
  const themeColor = useThemeColor();

  // Get the data.
  const db = useTheorySampleDatabase();
  const query1 = departmentsReplacement;
  const data1 = useQueryResult(db?.database, query1);
  const data2 = useQueryResult(db?.database, 'SELECT * FROM employees;');

  // Set up reference to the table.
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();
  const [t1Ref, t1Bounds, table1] = useRefWithBounds(drawingData);
  const [t2Ref, t2Bounds, table2] = useRefWithBounds(drawingData);
  const textNode1Bounds = useTextNodeBounds(table1, 'e_id', drawingData, 0, 1);
  const textNode2Bounds = useTextNodeBounds(table2, 'e_id', drawingData, 0, 1);
  const x = 80;
  const y1 = 20 + (t1Bounds?.height ?? 160) + 15;
  const width = 800;
  const height = y1 + (t2Bounds?.height ?? 160);

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
    </> : null}

    {textNode1Bounds ? <Rectangle dimensions={textNode1Bounds} cornerRadius={10} style={{ stroke: themeColor, strokeWidth: 2, fill: 'none' }} /> : null}
    {textNode2Bounds ? <Rectangle dimensions={textNode2Bounds} cornerRadius={10} style={{ stroke: themeColor, strokeWidth: 2, fill: 'none' }} /> : null}
  </Drawing>;
}
