import { Page, Par, Quote, Section, Warning, Term, Em, ISQL } from '@/components';

import { FigureExampleQuery } from '../queryFigures';

export function Summary() {
  return <Page>
    <Section>
      <Par>When tables are linked through a foreign key, we often have to look up values from one table based on a condition from the other table. In this case, it helps to first find a list of all the relevant IDs/keys in the first table. Then we use the <ISQL>IN</ISQL> keyword, which checks if a given value (or set of values) is in a given list. This gives the corresponding entries from the second table.</Par>
      <Quote>Find the IDs and names of all the managers who manage a department with more than ten employees.</Quote>
      <FigureExampleQuery query={`SELECT e_id, first_name, last_name
FROM employees
WHERE e_id IN (
  SELECT manager_id
  FROM departments
  WHERE nr_employees > 10
);`} tableWidth={260} />
      <Par>Another option is to use the <ISQL>EXISTS</ISQL> keyword, which runs the inner query and checks if it returns any (non-zero) number of rows.</Par>
      <FigureExampleQuery query={`SELECT e_id, first_name, last_name
FROM employees
WHERE EXISTS (
  SELECT 1
  FROM departments
  WHERE employees.e_id = departments.manager_id
    AND nr_employees > 10
);`} tableWidth={260} />
      <Par>Note that this is a <Term>correlated query</Term>: the <Term>inner query</Term> uses a table from the <Term>outer query</Term>. In correlated queries, the inner query is run for <Em>every</Em> row of the outer query (rather than just once) which makes them inherently slow. Whenever possible, use non-correlated queries instead.</Par>
      <Warning>Inner queries may use any table from any outer query, but outer queries may <Em>never</Em> use any table from any inner query.</Warning>
    </Section>
  </Page>
}
