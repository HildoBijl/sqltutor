import { Page, Section, Par, Quote, Warning, Term } from '@/components';

import { FigureSingleTable } from '@/curriculum/utils/queryFigures';

export function Summary() {
  return <Page>
    <Section>
      <Par>A <Term>view</Term> can be seen as a "recipe" for a new table, based on <Term>base tables</Term>/other views. First we have to define a view to the DBMS.</Par>
      <Quote>The "manager contact data" table is: A list of department names including, for every department, who manages it: the manager's name and phone number.</Quote>
      <Par>When the DBMS receives a <Term>view definition</Term>, it only remembers this definition. It does not generate the table yet. Only when the view is requested, will the DBMS generate the table based on the instructions. If needed, this table can then be processed further, just like with base tables.</Par>
      <Quote>Give me the manager contact data.</Quote>
      <FigureSingleTable query={`SELECT d_name, first_name AS manager_name, phone FROM departments JOIN employees ON manager_id=e_id;`} title="Manager contact data" tableWidth={400} tableScale={0.8} />
      <Warning>The view tables are never stored! They are always generated anew when requested. This ensures the data is always up-to-date. (An exception are so-called <Term>materialized views</Term>, which are a separate concept.)</Warning>
      <Par>Views are useful tools to not have to repeat complex queries often. It makes earlier queries reusable and simplifies further queries. Views are also useful at providing <Term>access control</Term>: defining which user gets access to which data.</Par>
    </Section>
  </Page>;
}
