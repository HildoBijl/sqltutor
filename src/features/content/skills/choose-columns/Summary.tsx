import { Page, Section, Par, Info, Term, Em } from '@/components';
import { ISQL } from '@/components';

import { FigureRenameColumns } from './Theory';

export function Summary() {
  return <Page>
    <Section>
      <Par>In SQL, we can select a subset of all table columns (apply <Term>projection</Term>) by specifying these columns after the <ISQL>SELECT</ISQL> keyword. Optionally, we can <Term>rename the columns</Term> through the <ISQL>AS</ISQL> keyword. The use of <ISQL>AS</ISQL> is optional but recommended for readability.</Par>
      <FigureRenameColumns query={`SELECT
  first_name,
  last_name AS family_name,
  phone AS number
FROM employees;`} />
      <Info>The output may have <Term>duplicate rows</Term>. Use <ISQL>SELECT DISTINCT</ISQL> rather than just <ISQL>SELECT</ISQL> to filter out any potential duplicates.</Info>
      <Par>In case there are multiple tables involved in your query, it is recommended (and in case of duplicate names obligatory) to specify which column comes from which table. This is done through the notation <ISQL>table_name.column_name</ISQL>. Optionally, you can give tables an <Term>alias</Term> (temporary rename) to shorten this notation.</Par>
      <FigureRenameColumns query={`SELECT
  e.first_name,
  e.last_name AS family_name,
  e.phone AS number
FROM employees AS e;`} />
      <Info>Ideally table/column names are without spaces and in lower case. If you deviate from this (not recommended) then you may use <Em>double</Em> quotation marks to make this work, like in <ISQL>SELECT "First Name" FROM "All Employees";</ISQL>. For regular column names, double quotation marks are optional and unnecessary.</Info>
    </Section>
  </Page>;
}
