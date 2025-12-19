import { Box } from '@mui/material';

import { useRefWithValue } from '@/utils/dom';
import { useThemeColor } from '@/theme';
import { Page, Section, Par, List, Warning, Info, Term, Link, Glyph } from '@/components';
import { type DrawingData, Drawing, Element, Curve, useRefWithBounds } from '@/components/figures';
import { useConceptDatabase } from '@/hooks/useDatabase';
import { useQueryResult } from '@/hooks/useQuery';
import { DataTable } from '@/shared/components/DataTable';

export function Theory() {
  return <Page>
    <Section>
      <Par>Suppose that we are working for a company that's looking to keep track of their internal departments. How would we store this data? Could we just put it in something like an Excel file?</Par>
      <FigureOneTable />
    </Section>

    <Section title="Why databases: a list of requirements">
      <Par>For many small-scale use cases, storing data in a single file would work. When scaling up, there are various reasons why this fails.</Par>
      <List items={[
        <>When the number of records gets into the millions, it becomes too big for one file. Computers cannot keep it all in their working memory. We need a solution that can <strong>deal with large amounts of data</strong> that doesn't overload the file system.</>,
        <>Finding any desired records will be a challenge. We need a solution that we can <strong>easily ask questions extracting data</strong>, like "Which departments are going over budget?"</>,
        <>Perhaps we want to build a website where users can add new departments, add employees to those departments, and so forth. This website (basically a computer script) should be able to adjust the data, also when multiple users use it at the same time. We hence need a solution in which <strong>applications can adjust data concurrently</strong>.</>,
      ]} />
      <Par>To meet all these requirements, databases and corresponding software tools have been created.</Par>
    </Section>

    <Section title="Database: a collection of tables">
      <Par>A <Term>database</Term> stores data. Most databases do so purely in table form. The easiest way to picture a database is therefore as a collection of tables, each filled with potentially large amounts of entries. A small database consists of a few small tables, but bigger databases can have dozens of enormous tables that are all linked to each other in some way.</Par>
      <FigureTwoTables />
      <Info>Most databases, the so-called <Term>relational databases</Term>, use tables. (A "relation" is, roughly put, a mathematical term for a table.) There are a few databases that deviate from this and don't use tables. They for example store graphs (like <Link to="https://neo4j.com/">Neo4j</Link>), JSON objects (like <Link to="https://www.mongodb.com/">MongoDB</Link>) or key-value pairs (like <Link to="https://redis.io/">Redis</Link>). Since this only involves a small subset of all databases, we focus on relational databases for now.</Info>
    </Section>

    <Section title="The database management system">
      <Par>The "database" is the collection of all the data that's stored somewhere. To get this data stored in the desired way, we use a specialized program called a <Term>Database Management System</Term> (DBMS). Examples of DBMSs that use tables are <Link to="https://www.postgresql.org/">PostgreSQL</Link>, <Link to="https://www.mysql.com/">MySQL</Link>, <Link to="https://www.oracle.com/database/">Oracle</Link>, <Link to="https://sqlite.org/">SQLite</Link> and dozens more. The DBMS handles all functionalities around the database, allowing users to read and write data.</Par>
      <FigureDatabaseUsage />
      <Par>Every DBMS has its own specific way of how exactly it stores its data. As a result, a DBMS and a database are inextricably linked. You cannot just take a database and couple it to a different DBMS. It is possible (and common) that a single DBMS has multiple different databases on the same machine, for instance for different applications.</Par>
      <Warning>Because a database and its DBMS are so linked, people often use the word "database" when they actually mean DBMS. "Hey, which database are you using at SQL Valley? Oh, we're using SQLite!"</Warning>
    </Section>
  </Page>;
}

function FigureOneTable() {
  const db = useConceptDatabase();
  const data = useQueryResult(db?.database, 'SELECT * FROM departments;');
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();
  const [tRef, tBounds] = useRefWithBounds(drawingData);

  return <Drawing ref={drawingRef} width={800} height={25 + (tBounds?.height || 200)} maxWidth={800}>
    <Element position={[10, 0]} anchor={[-1, -1]}><span style={{ fontWeight: 500, fontSize: '0.8em' }}>List of departments</span></Element>
    <Element position={[0, 25]} anchor={[-1, -1]}>
      <Box sx={{ width: 800 }}>
        <DataTable ref={tRef} data={data} showPagination={false} compact />
      </Box>
    </Element>
  </Drawing>;
}

export function FigureTwoTables() {
  const db = useConceptDatabase();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  const data1 = useQueryResult(db?.database, 'SELECT * FROM departments;');
  const data2 = useQueryResult(db?.database, 'SELECT * FROM employees;');
  const [t2Ref, t2Bounds] = useRefWithBounds(drawingData);
  const x = 80;
  const y = 108;

  return <Drawing ref={drawingRef} width={800} height={y + (t2Bounds?.height ?? 200)} maxWidth={800}>
    <Element position={[10, 0]} anchor={[-1, -1]}><span style={{ fontWeight: 500, fontSize: '0.8em' }}>List of departments</span></Element>
    <Element position={[0, 25]} anchor={[-1, -1]} scale={0.6}>
      <Box sx={{ width: 800 }}>
        <DataTable data={data1} showPagination={false} compact />
      </Box>
    </Element>

    <Element position={[790, y - 25]} anchor={[1, -1]}><span style={{ fontWeight: 500, fontSize: '0.8em' }}>List of employees</span></Element>
    <Element position={[x, y]} anchor={[-1, -1]} scale={0.6}>
      <Box sx={{ width: (800 - x) / 0.6 }}>
        <DataTable ref={t2Ref} data={data2} showPagination={false} compact />
      </Box>
    </Element>
  </Drawing>;
}

export function FigureDatabaseUsage() {
  const themeColor = useThemeColor();
  const h = 210;
  const w = 800;
  const y = h / 2 + 32;
  const xUser = 60;
  const xServer = w / 2;
  const xDatabase = w - 60;

  return <Drawing width={w} height={h}>
    <Glyph name="User" position={[xUser, y - 25]} width={100} />
    <Element position={[xUser, y + 38]}><span style={{ fontSize: '1em', fontWeight: 500 }}>User</span></Element>

    <Glyph name="Server" position={[xServer, y - 25]} width={60} />
    <Element position={[xServer, y + 50]}><span style={{ fontSize: '1em', fontWeight: 500 }}>DBMS</span></Element>

    <Glyph name="Database" position={[xDatabase, y - 25]} width={100} />
    <Element position={[xDatabase, y + 38]}><span style={{ fontSize: '1em', fontWeight: 500 }}>Database</span></Element>

    <Curve points={[[xUser + 26, y - 70], [(xUser + xServer) / 2, y - 120], [xServer - 35, y - 70]]} endArrow={true} color={themeColor} />
    <Element position={[(xUser + xServer) / 2, y - 102]} anchor={[0, 1]}><p style={{ fontSize: '0.8em', lineHeight: '1.2em', fontWeight: 500, margin: 0, textAlign: 'center' }}>"Get me the departments<br />that are going over budget"</p></Element>

    <Curve points={[[xServer + 35, y - 70], [(xServer + xDatabase) / 2, y - 120], [xDatabase - 50, y - 70]]} endArrow={true} color={themeColor} />
    <Element position={[(xServer + xDatabase) / 2, y - 102]} anchor={[0, 1]}><p style={{ fontSize: '0.8em', lineHeight: '1.2em', fontWeight: 500, margin: 0, textAlign: 'center' }}>Pull up all relevant records</p></Element>

    <Curve points={[[xDatabase - 50, y + 20], [(xServer + xDatabase) / 2, y + 70], [xServer + 35, y + 20]]} endArrow={true} color={themeColor} />
    <Element position={[(xServer + xDatabase) / 2, y + 52]} anchor={[0, -1]}><p style={{ fontSize: '0.8em', lineHeight: '1.2em', fontWeight: 500, margin: 0, textAlign: 'center' }}>Give all requested records</p></Element>

    <Curve points={[[xServer - 35, y + 20], [(xUser + xServer) / 2, y + 70], [xUser + 50, y + 20]]} endArrow={true} color={themeColor} />
    <Element position={[(xUser + xServer) / 2, y + 52]} anchor={[0, -1]}><p style={{ fontSize: '0.8em', lineHeight: '1.2em', fontWeight: 500, margin: 0, textAlign: 'center' }}>["Security", "Tech Support"]</p></Element>
  </Drawing>;
}
