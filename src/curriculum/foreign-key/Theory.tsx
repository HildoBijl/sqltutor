import { Page, Section, Par, List, Warning, Term, Em, PrimaryKey, ForeignKey, ISQL } from '@/components';

import { FigureSingleTable } from '../queryFigures';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know how to uniquely identify rows in a table through a primary key. But how do we use this to link tables to each other?</Par>
    </Section>

    <Section title="The problem of duplicate data">
      <Par>Suppose that we have a list of all employees in a company.</Par>
      <FigureSingleTable query={`SELECT * FROM employees;`} title="List of employees" tableScale={0.65} />
      <Par>Every department in the company also has a manager, which is an employee. It would be nice if we would have the phone numbers of the managers of all departments. After all, if there's an issue, we'd know who to call. So we could set up a table like this.</Par>
      <FigureSingleTable query={`SELECT d.d_id, d.d_name, d.budget, d.nr_employees, e.first_name manager_first_name, e.last_name manager_last_name, e.phone manager_phone FROM departments d LEFT JOIN employees e ON e.e_id=d.manager_id;`} title="List of departments with manager info" tableWidth={700} tableScale={0.65} />
      <Par>This would however be a bad idea. The reason is that every manager's phone number also appears in the list of employees, and it would then be in our database multiple times. We would have <Term>duplicate data</Term>!</Par>
      <Warning>
        <Par>Duplicate data is bad for three reasons. In increasing importance:</Par>
        <List sx={{ my: 0.5 }} items={[
          <>Duplicate data takes up more space. (Honestly, we don't care much about this.)</>,
          <>When something changes, duplicate data has to be changed in multiple places, which is more work. (This is a bit more serious.)</>,
          <>If you forget to change duplicate data somewhere, then you have contradicting data. There are two different phone numbers! Which one is correct? We call this <Term>data corruption</Term> and it is a serious issue.</>,
        ]} />
        <Par>For these three reasons (well, mainly the latter) duplicate data should always be avoided.</Par>
      </Warning>
    </Section>

    <Section title="Foreign key: a reference to a row in another table">
      <Par>The solution to our problem lies in making references. We know that the <ISQL>employees</ISQL> table has all employees, including contact information and such. So within the <ISQL>departments</ISQL> we only have to <Em>refer</Em> to the right row. And referring to a row in a table is generally done through its key! Every employee has a unique employee ID <ISQL>e_id</ISQL>. So we can add this to the <ISQL>departments</ISQL> table as <ISQL>manager_id</ISQL>.</Par>
      <FigureSingleTable query={`SELECT * FROM departments;`} title="List of departments with the ID of the manager" tableWidth={700} tableScale={0.65} />
      <Par>When the key of one table appears as reference in another table, then we say that this second table has a <Term>foreign key</Term> pointing to the first table. A common way to indicate a foreign key in the table's schema is by making the foreign key italic. It shows this is a reference to a primary key of some other table. <List items={[
        <><Term>departments</Term> (<PrimaryKey>d_id</PrimaryKey>, d_name, <ForeignKey>manager_id</ForeignKey>, budget, nr_employees)</>,
        <><Term>employees</Term> (<PrimaryKey>e_id</PrimaryKey>, first_name, last_name, phone, email, address, city, hire_date, current_salary)</>,
      ]} /></Par>
      <Par>So how do we apply a foreign key? Well, by looking things up in steps! If we want the phone number of the manager of "Human Resources", we first look through the departments to find the manager ID. This is <ISQL>42223311</ISQL>. We then jump to the list of employees, find the row (the employee) corresponding to this ID (Marcelle Johnson) and extract the respective phone number: 408-555-0674. Looking things up like this is simple enough, and these references keep our database clean.</Par>
    </Section>
  </Page>;
}
