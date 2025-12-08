import { Page, Section, Par, Term, Link } from '@/components';

import { FigureTwoTables, FigureDatabaseUsage } from './Theory';

export function Summary() {
  return <Page>
    <Section>
      <Par>In its essence, a <Term>database</Term> is a collection of tables, each filled with data. There may be millions of records that are constantly being updated by multiple applications at the same time.</Par>
      <FigureTwoTables />
      <Par>A database is always accompanied by tools (software) used to efficiently enter, update and read the data. This set of tools is known as the <Term>Database Management System</Term> (DBMS). Popular examples are <Link to="https://www.postgresql.org/">PostgreSQL</Link>, <Link to="https://www.mysql.com/">MySQL</Link>, <Link to="https://www.oracle.com/database/">Oracle</Link> and <Link to="https://sqlite.org/">SQLite</Link>.</Par>
      <FigureDatabaseUsage />
    </Section>
  </Page>;
}
