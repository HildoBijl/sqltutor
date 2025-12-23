import { Page, Section, Par, List, Term } from '@/components';
import { ISQL } from '@/components';

import { FigureSingleTable } from '../queryFigures';

export function Summary() {
  return <Page>
    <Section>
      <Par>While table columns have names, table rows do not. To uniquely identify table rows, we use <Term>keys</Term>. There are three important definitions.</Par>
      <List items={[
        <>A <Term>superkey</Term> is a set of attributes such that, whenever two rows have the same value for these attributes, then the full rows are identical. Example superkeys include <ISQL>{`{e_id}`}</ISQL>, <ISQL>{`{e_id, hire_date}`}</ISQL> and <ISQL>{`{first_name, last_name, city}`}</ISQL>.</>,
        <>A <Term>candidate key</Term> is a superkey for which, if we remove any attribute, it is not a superkey anymore. So a candidate key can be seen as a minimal superkey. Example candidate keys include <ISQL>{`{e_id}`}</ISQL>, <ISQL>{`{first_name, last_name}`}</ISQL> and <ISQL>{`{email}`}</ISQL>.</>,
        <>A <Term>primary key</Term> is a candidate key that we choose to use when referring to specific table rows. The primary key is ideally one whose value never changes. Using the employee ID <ISQL>{`{e_id}`}</ISQL> is a wise choice here.</>
      ]} />
      <FigureSingleTable query={`SELECT * FROM employees;`} title="List of employees" tableWidth={800} tableScale={0.65} />
    </Section>
  </Page>;
}
