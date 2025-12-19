import { Page, Section, Par, Warning, Term } from '@/components';
import { ISQL, SQLDisplay } from '@/components';

export function Summary() {
  return <Page>
    <Section>
      <Par>The <Term>SQL query language</Term> (pronounced either "S-Q-L" or "Sequel") is the most commonly used query language in the world, applied by almost all modern relational databases. A simple SQL query looks like</Par>
      <SQLDisplay>{`SELECT *
FROM employees;`}</SQLDisplay>
      <Par>This query retrieves all columns from the table <ISQL>employees</ISQL>. In SQL queries, superfluous white-space (linebreaks/tabs) is ignored, keywords are not case sensitive, and queries usually end with a semi-colon.</Par>
      <Warning>Although there is a standard for how SQL should work, every DBMS has its own dialect. For advanced features, always check the specifications of your DBMS.</Warning>
    </Section>
  </Page>;
}
