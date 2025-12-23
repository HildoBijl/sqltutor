import { Page, Par, List, Section, Term, ISQL } from '@/components';

import { FigureExampleQuery } from '../queryFigures';

export function Summary() {
  return <Page>
    <Section>
      <Par>SQL has a variety of ways in which tables can be joined. To join two tables using <ISQL>FROM/WHERE</ISQL>, we take two steps. <List useNumbers items={[
        <>Add the two tables we want to join to the <ISQL>FROM</ISQL> clause. This creates the Cartesian product of the two tables.</>,
        <>Specify in the <ISQL>WHERE</ISQL> clause the <Term>join conditions</Term>: what must hold for each combination of rows.</>,
      ]} /></Par>
      <FigureExampleQuery query={`SELECT *
FROM departments, employees
WHERE departments.manager_id = employees.e_id;`} tableScale={0.45} tableWidth={800} below />
      <Par>The above solution is considered unclean because, within the <ISQL>WHERE</ISQL> clause, the join conditions will get mixed up with any potential <Term>external conditions</Term> we may still add later on. It is better for the query readability to keep join conditions and external conditions separate. We can fix this using the <ISQL>JOIN ... ON</ISQL> command. The join conditions are now placed after <ISQL>ON</ISQL>. Any further conditions can be added afterwards with <ISQL>WHERE</ISQL>.</Par>
      <FigureExampleQuery query={`SELECT *
FROM departments
JOIN employees
ON departments.manager_id = employees.e_id;`} tableScale={0.45} tableWidth={800} below />
      <Par>When the attributes from the two tables already have the same name, then there are various short-cuts we can use, for instance through <ISQL>NATURAL JOIN table_name</ISQL> or through <ISQL>JOIN table_name USING (column_name1, column_name2, ...)</ISQL>. Then we don't have to specify the join condition using <ISQL>ON</ISQL>.</Par>
      <Par>SQL supports inner and outer joins. Consider the case where the rows from the two tables do not always have corresponding matching rows in the other table. <List items={[
        <>Use <ISQL>INNER JOIN</ISQL> to drop any rows with missing matches. (This is default, so <ISQL>INNER JOIN</ISQL> does the same as <ISQL>JOIN</ISQL>.)</>,
        <>Use <ISQL>LEFT JOIN</ISQL> to always keep rows from the left table (mentioned at <ISQL>FROM</ISQL>).</>,
        <>Use <ISQL>RIGHT JOIN</ISQL> to always keep rows from the right table (mentioned at <ISQL>JOIN</ISQL>).</>,
        <>Use <ISQL>FULL JOIN</ISQL> to always keep rows from both tables.</>,
      ]} /></Par>
    </Section>
  </Page>;
}
