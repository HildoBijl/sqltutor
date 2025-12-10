import { useRef } from 'react';
import { Box } from '@mui/material';

import { Page, Section, Par, List, Warning, Info, Term, Em } from '@/components';
import { type DrawingData, Drawing, Element, useRefWithBounds } from '@/components/figures';
import { useConceptDatabase } from '@/shared/hooks/useDatabase';
import { useQueryResult } from '@/shared/hooks/useQuery';
import { DataTable } from '@/shared/components/DataTable';
import { SQLDisplay } from '@/shared/components/SQLEditor';

export function Theory() {
  return <Page>
    <Section>
      <Par>To interact with a database, we need a query language. The most commonly used query language is the <Term>SQL query language</Term>. Several of the most-used DBMSs in the world use SQL. Before we start learning how to use this query language, what should we know about it?</Par>
    </Section>

    <Section title="A simple example query">
      <Par>A very basic SQL query is the following.</Par>
      <SQLDisplay>{`SELECT *
FROM employees;`}</SQLDisplay>
      <Par>This query instructs the DBMS to take all columns (the star means "all") from the table named <SQLDisplay inline>employees</SQLDisplay> and return them. So effectively, this query loads in the full table. The result would be the following.</Par>
      <FigureEmployeeTable />
      <Par>The above query (with whatever table name applies) is used very often. It's a quick way to check out the data in a table. Use it at the start of exercise, as a starting point.</Par>
      <Info>One of the reasons why SQL is popular is its readability. Even without ever having seen SQL, you probably had an idea what the above query was for.</Info>
    </Section>

    <Section title="Properties of SQL queries">
      <Par>There are a few important things to keep in mind for SQL queries.</Par>
      <List items={[
        <>Superfluous <Term>white-space</Term> is ignored. So the above query without the linebreak <SQLDisplay inline>SELECT * FROM companies;</SQLDisplay> does exactly the same. Enters and tabs (indentation), though useless in execution, are very commonly used to display queries in a more clear manner.</>,
        <>SQL keywords are <Em>not</Em> <Term>case sensitive</Term>. So <SQLDisplay inline>select * from companies;</SQLDisplay> would do the same thing. Nevertheless, it is common to write keywords in upper case, to clearly distinguish them from table and column names.</>,
        <>Queries usually end with a <Term>semi-colon</Term>. This is to distinguish where one query ends and the next one begins. If you only have one query, this semi-colon is optional: writing <SQLDisplay inline>SELECT * FROM companies</SQLDisplay> is fine. Always adding a semi-colon is a good habit though, so at SQL Valley we usually use one anyway.</>,
      ]} />
    </Section>

    <Section title="The name and history of SQL">
      <Par>There is quite some confusion about the name SQL, how you pronounce it, and what it stands for. To clarify this, we need to understand the history behind the name.</Par>
      <Par>Back in the early 1970s, some engineers at IBM created the <Term>Structured English QUEry Language</Term> SEQUEL. It turned out that the name SEQUEL was already a registered trademark, so they shortened it to <Term>Structured Query Language</Term> (SQL). In ordinary speech, some people then started pronouncing the letters of the acronym (S-Q-L), while others still call it "Sequel". This divide is still present today: both pronunciations are used in practice.</Par>
      <Par>In 1986 ANSI (the American National Standars Institute) and ISO (the International Organization for Standardization) decided to adopt SQL. They wrote a standard for it, deciding how it should work for all relevant databases. In this standard, the name is simply "SQL" without specifying what this stands for. So officially, the name SQL is not an acronym, but a name in itself.</Par>
      <Par>The SQL standard has since been updated and expanded numerous time. Creators of DBMSs often work together with ANSI/ISO to make the standard both easier and more powerful to use. These DBMS creators then attempt to conform their system to the standard. After all, it makes it easier for users of other DBMSs to switch to their DBMS. This conformation to the SQL standard is the reason that SQL is the most commonly used database language in the world.</Par>
      <Warning>Adoption of DBMSs to the SQL standard is not perfect. In practice every DBMS uses its own dialect of SQL. At SQL Valley, we mainly focus on the parts of SQL that work for all DBMSs. Sometimes we add a note "The way this works does vary slightly (or a lot) per DBMS."</Warning>
    </Section>
  </Page>;
}

function FigureEmployeeTable() {
  const db = useConceptDatabase();
  const data = useQueryResult(db?.database, 'SELECT * FROM employees;');
  const drawingRef = useRef<DrawingData>(null);
  const [tRef, tBounds] = useRefWithBounds(drawingRef);

  return <Drawing ref={drawingRef} width={800} height={25 + (tBounds?.height || 200)} maxWidth={800}>
    <Element position={[10, 0]} anchor={[-1, -1]}><span style={{ fontWeight: 500, fontSize: '0.8em' }}>The full employees table</span></Element>
    <Element position={[0, 25]} anchor={[-1, -1]} scale={0.6}>
      <Box sx={{ width: 800/0.6 }}>
        <DataTable ref={tRef} data={data} showPagination={false} compact />
      </Box>
    </Element>
  </Drawing>;
}
