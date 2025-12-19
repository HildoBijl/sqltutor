import { Box } from '@mui/material';

import { useRefWithValue } from '@/utils/dom';
import { useThemeColor } from '@/theme';
import { Page, Section, Par, List, Info, Term, Link } from '@/components';
import { type DrawingData, Drawing, Element, Curve, useRefWithBounds } from '@/components/figures';
import { useConceptDatabase } from '@/hooks/useDatabase';
import { useQueryResult } from '@/hooks/useQuery';
import { DataTable } from '@/shared/components/DataTable';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know that a database can be seen as a collection of tables managed by a Database Management System (DBMS). How do we interact with this DBMS?</Par>
    </Section>

    <Section title="The idea behind a query language">
      <Par>Databases usually don't have a flashy interface with clear graphics, useful buttons and such. To interact with the database and make it do anything, we have to give the DBMS specific commands. Think of "Create a new table 'employees'", "Add a new record to the 'employees' table" or "Find the names of all employees earning more than two hundred thousand per year." Such commands are known as <Term>queries</Term>: structured commands to extract/adjust data.</Par>
      <FigureQueryExample />
      <Par>Sadly DBMSs do not understand English, or any spoken language for that matter. Spoken languages are far too ambiguous. Queries must therefore follow a very specific format. The exact format of how to set up queries and what can be put in them is known as the <Term>query language</Term>.</Par>
    </Section>

    <Section title="Examples of query languages">
      <Par>So what does a query look like? This depends on the query language. There is a large variety of query languages: every DBMS pretty much has its own query language. But to get a feeling of what queries may look like, we study a few examples.</Par>
      <Par>Suppose that we want to get a list of companies with more than 200.000 employees. In the <Term>SQL</Term> query language (the query language used by the most common/popular databases) that would be done through</Par>
      <Par><pre><code>{`SELECT first_name, last_name
FROM employees
WHERE current_salary > 200000
`}</code></pre></Par>
      <Par>In <Term>Datalog</Term> (a more modern and up-and-coming query language) this would be done with</Par>
      <Par><pre><code>{`highEarners(fn, ln) :- employees(_, fn, ln, _, _, _, _, _, s), s > 200000.
?- highEarners(fn, ln).`}</code></pre></Par>
      <Par>In <Term>relational algebra</Term> (a more theoretical and mathematical query language) this is done using</Par>
      <Par><pre><code>highEarners ← ∏<sub>first_name,last_name</sub>(σ<sub>current_salary &gt; 200000</sub>(employees))</code></pre></Par>
      <Par>Or in an object-database like <Link to="https://www.mongodb.com/">MongoDB</Link> the query looks like this.</Par>
      <Par><pre><code>{`db.employees.find(
  { current_salary: { $gt: 200000 } },
  { first_name: 1, last_name: 1, _id: 0 }
)`}</code></pre></Par>
      <Par>You see that there is a large variety of query languages.</Par>
    </Section>

    <Section title="Two branches of query languages">
      <Par>Query languages usually consist of two parts (sublanguages) that work mostly independently from one another.</Par>
      <List items={[
        <>The so-called <Term>Data Definition Language</Term> (DDL) revolves around defining the structure of data: creating tables, adjusting tables, etcetera.</>,
        <>The <Term>Data Manipulation Language</Term> (DML) focuses on working with data: adding/updating records, retrieving the right data, and so forth.</>,
      ]} />
      <Par>When learning a query language, you usually start with the DML, and then you continue with the DDL. But in theory you could also learn the DDL without knowing the DML.</Par>
      <Info>Here at SQL Valley we obviously focus on the SQL query language. On top of this, we mainly focus on the DML side.</Info>
    </Section>
  </Page>;
}

export function FigureQueryExample() {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const db = useConceptDatabase();
  const data1 = useQueryResult(db?.database, `SELECT * FROM employees;`);
  const data2 = useQueryResult(db?.database, `SELECT first_name, last_name FROM employees WHERE current_salary > 200000;`);

  // Find the bounds for "d_name".
  const [t1Ref, t1Bounds] = useRefWithBounds(drawingData);
  const [t2Ref, t2Bounds] = useRefWithBounds(drawingData);

  const arrowHeight = 80;
  const arrowMargin = 10;

  return <Drawing ref={drawingRef} width={800} height={arrowHeight + (t1Bounds?.height ?? 200) + (t2Bounds?.height ?? 100)} maxWidth={800} disableSVGPointerEvents>
    <Element position={[0, 0]} anchor={[-1, -1]} scale={0.6} behind>
      <Box sx={{ width: 800 / 0.6 }}>
        <DataTable ref={t1Ref} data={data1} showPagination={false} compact />
      </Box>
    </Element>

    <Element position={[300, arrowHeight + (t1Bounds?.height ?? 200)]} anchor={[-1, -1]} scale={0.6} behind>
      <Box sx={{ width: 200 / 0.6 }}>
        <DataTable ref={t2Ref} data={data2} showPagination={false} compact />
      </Box>
    </Element>

    {t1Bounds ? <>
      <Curve points={[t1Bounds.middleBottom.add([0, arrowMargin]), t1Bounds.middleBottom.add([0, arrowHeight - arrowMargin])]} color={themeColor} endArrow />
      <Element position={[408, (t1Bounds?.height ?? 200) + arrowHeight / 2 - 4]} anchor={[-1, 0]}>
        <p style={{ fontSize: '0.8rem', fontStyle: 'italic', margin: 0, lineHeight: 1.4 }}>"Find the names of all employees earning<br />more than two hundred thousand per year."</p>
      </Element>
    </> : null}
  </Drawing>;
}
