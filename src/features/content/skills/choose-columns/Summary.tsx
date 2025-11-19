import { Page, Section, Par, Warning, Info, Term } from '@/components';
import { SQLDisplay } from '@/shared/components/SQLEditor';

export function Summary() {
  return <Page>
    <Section>
      <Par>In SQL, we can select a subset of all table columns (apply <Term>projection</Term>) by specifying these columns after the <SQLDisplay inline>SELECT</SQLDisplay> keyword. Optionally, we can <Term>rename the columns</Term> through the <SQLDisplay inline>AS</SQLDisplay> keyword. The use of <SQLDisplay inline>AS</SQLDisplay> is optional but recommended for readability.</Par>
      <Warning>ToDo: add image <SQLDisplay>{`SELECT
  company_name AS name,
  country,
  num_employees people
FROM companies;`}</SQLDisplay></Warning>
      <Info>The output may have <Term>duplicate rows</Term>. Use <SQLDisplay inline>SELECT DISTINCT</SQLDisplay> to filter out any potential duplicates.</Info>
      <Par>In case there are multiple tables involved in your query, it is recommended (and in case of duplicate names obligatory) to specify which column comes from which table. This is done through the notation <SQLDisplay inline>table_name.column_name</SQLDisplay>. Optionally, you can <Term>rename the tables</Term> to shorten this notation.</Par>
      <Warning>ToDo: add image <SQLDisplay>{`SELECT
  c.company_name AS name,
  c.country,
  c.num_employees AS people
FROM companies AS c;`}</SQLDisplay></Warning>
      <Info>Ideally table/column names are without spaces and in lower case. If you deviate from this (not recommended) then you may use double quotation marks to make this work, like in <SQLDisplay inline>SELECT "Num Employees" FROM companies;</SQLDisplay>. For regular column names, double quotation marks are optional and unnecessary.</Info>
    </Section>
  </Page>;
}
