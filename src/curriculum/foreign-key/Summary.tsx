import { Page, Section, Par, List, Term, Em, PrimaryKey, ForeignKey, ISQL } from '@/components';

import { FigureTwoTables } from '../database/Theory';

export function Summary() {
  return <Page>
    <Section>
      <Par>When setting up a database, it is crucial to prevent <Term>duplicate data</Term>: the same data item appearing in multiple places. Most importantly, this can lead to <Term>data corruption</Term>: data entries that contradict each other. This should be avoided at all times.</Par>
      <Par>To prevent duplicate data, tables often <Em>refer</Em> to one another through foreign keys. A <Term>foreign key</Term> in some table row functions as a reference that points to a row in another table. It consists of the primary key of that other table.</Par>
      <Par>As example, within a company, every department has a manager. This manager is an employee. The list of departments can therefore use <ISQL>manager_id</ISQL> as foreign key to the <ISQL>employees</ISQL> table, which has <ISQL>e_id</ISQL> as primary key. If we know the manager ID, we can then easily look up all other attributes of said manager through this respective key.</Par>
      <FigureTwoTables />
      <Par>Within the schema, a foreign key is often marked italic. <List items={[
        <><Term>departments</Term> (<PrimaryKey>d_id</PrimaryKey>, d_name, <ForeignKey>manager_id</ForeignKey>, budget, nr_employees)</>,
        <><Term>employees</Term> (<PrimaryKey>e_id</PrimaryKey>, first_name, last_name, phone, email, address, city, hire_date, current_salary)</>,
      ]} /></Par>
    </Section>
  </Page>;
}
