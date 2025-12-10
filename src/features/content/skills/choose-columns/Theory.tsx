import { Page, Par, Section, Warning, Info, Term } from '@/components';
import { ISQL, SQLDisplay } from '@/shared/components/SQLEditor';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know how we can retrieve an entire table in <Term>SQL</Term>, but how do we select only a few of the columns? We'll study the commands needed for it and the options that can be added.</Par>
    </Section>

    <Section title="Select columns (projection)">
      <Par>To retrieve all columns from a table, we use <ISQL>SELECT *</ISQL> which means "select all". If we only want to select certain columns (apply <Term>projection</Term>) then we have to specify the column names, separated by commas.</Par>
      <Info>ToDo: add figure where we select columns. <SQLDisplay>{`SELECT company_name, country, num_employees
FROM companies;`}</SQLDisplay></Info>
      <Warning>It is strongly recommended to always pick column and table names that have no spaces and are in lower case. If you really want to deviate from this, you need to wrap the names in double quotation marks, like <ISQL>SELECT "Num Employees" FROM companies;</ISQL> or similar. For proper column names these quotation marks are allowed but unnecessary.</Warning>
    </Section>

    <Section title="Select unique values">
      <Par>Ideally, in a "clean" database, every table row is unique. Having <Term>duplicate rows</Term> (rows in which every property has the same value) is possible, but it is not a good habit. When you select columns, it often does occur that you get duplicate rows. To filter those out, add the keyword <ISQL>DISTINCT</ISQL> right after <ISQL>SELECT</ISQL>. This instructs the DBMS to squash sets of duplicates into single rows before returning the result.</Par>
      <Info>ToDo: add figure where we use distinct. <SQLDisplay>{`SELECT DISTINCT industry
FROM companies;`}</SQLDisplay></Info>
    </Section>

    <Section title="Rename columns">
      <Par>In databases the columns have names. When retrieving a table, we can adjust the names that the columns have in our output. This <Term>renames</Term> the columns.</Par>
      <Info>ToDo: add figure where we rename columns. <SQLDisplay>{`SELECT company_name AS name, country, num_employees AS people
FROM companies;`}</SQLDisplay></Info>
      <Par>The addendum <ISQL>AS</ISQL> is optional here, and it works just as well without. For readability, it is still recommended to add it.</Par>
    </Section>

    <Section title="Deal with multiple tables">
      <Par>So far we have run queries that only request a single table. Later on we will encounter queries involving multiple tables. In that case it may be confusing which column comes from which table, especially if the two tables have columns with the same name. So we specify this coupling, through the format <ISQL>table_name.column_name</ISQL>.</Par>
      <SQLDisplay>{`SELECT
  companies.company_name AS name,
  country,
  companies.num_employees AS people
FROM companies;`}</SQLDisplay>
      <Par>When the two tables don't have duplicate column names, this table specification is generally not needed, but it is still recommended for clarity. When the two tables do have duplicate column names, this notation is obligatory.</Par>
      <Par>In case your table names are rather long, you can also rename your tables. This creates a shorter query, which may improve readability. Just as with columns, we may remove <ISQL>AS</ISQL>, but its usage is recommended for readability.</Par>
      <SQLDisplay>{`SELECT
  c.company_name AS name,
  c.country,
  c.num_employees AS people
FROM companies AS c;`}</SQLDisplay>
    </Section>
    <Info>ToDo: turn the above two queries into figures too.</Info>
  </Page>;
}
