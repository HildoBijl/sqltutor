import { Page, Par, Section, Warning, Info, Term, Em, M, BM, IRA, RelationName, Link } from '@/components';
import { FigureExampleRAQuery } from '../../utils';

import { FigureTwoTables } from '../database/Theory';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know what a join is, and what variants there are. But how do we set up a join in relational algebra? There are two possible methods: through the Cartesian product and through the natural join. Let's study both methods.</Par>
    </Section>

    <Section title="Use the Cartesian product">
      <Par>Suppose that we have two relations, <RelationName>departments</RelationName> and <RelationName>employees</RelationName>, and we want to join them over the foreign key <Em>manager_id</Em>.</Par>
      <FigureTwoTables />
      <Par>The standard way of setting up a join in relational algebra, is to first use the <Term>Cartesian product</Term> <M>\times</M> between the two relations. The Cartesian product is the combination of each row from one relation with each row from the other relation. It results in an enormous new relation.</Par>
      <FigureExampleRAQuery query={<>departments ⨯ employees</>} actualQuery="SELECT * FROM departments, employees" tableWidth={800} tableScale={0.4} />
      <Par>This Cartesian product may seem overly cumbersome, but it actually has a large amount of possibilities! The operator is used a <Em>lot</Em> in practice. Let's study the next step required to complete the join.</Par>
    </Section>

    <Section title="Join relations through the Cartesian product">
      <Par>To complete the join, we need to find which combinations of rows from <RelationName>departments</RelationName> and <RelationName>employees</RelationName> make sense. Here "make sense" means "They match, because the keys are equal." We should hence filter based on the foreign key! When we do, we have fully set up our join.</Par>
      <FigureExampleRAQuery query={<>σ<sub>departments.manager_id = employees.e_id</sub>(departments ⨯ employees)</>} actualQuery="SELECT * FROM departments JOIN employees ON departments.manager_id = employees.e_id" tableWidth={1000} tableScale={0.55} below />
      <Info>We used the dot-notation to specify attributes within the filter. To be precise: to specify from which relation the attribute "manager_id" came from, we used <IRA>departments.manager_id</IRA>. In this case, there are no duplicate attribute names, so this wasn't really necessary, but it's a good practice to do so regardless when applying a Cartesian product, just to prevent confusion.</Info>
    </Section>

    <Section title="Use the rename operator for attributes">
      <Par>In practice, foreign keys often have the same name in both relations. When this is the case, there is a short-cut: the natural join! For our example this is not the case yet, but we could make it so: we can apply an <Term>attribute rename</Term>.</Par>
      <Par>To adjust an attribute name, we use the <Term>rename operator</Term> <M>\rho</M> (the Greek letter rho). If we want to rename <Em>e_id</Em> to <Em>manager_id</Em>, we could do so using the <M>\rightarrow</M> notation.</Par>
      <FigureExampleRAQuery query={<>ρ<sub>e_id→manager_id</sub>(employees)</>} actualQuery="SELECT e_id AS manager_id, first_name, last_name, phone, email, address, city, hire_date, current_salary FROM employees" tableWidth={900} tableScale={0.7} below />
      <Par>Note that the rename operator receives a relation, and the subscript describes how to adjust the attribute names. We can also add multiple attribute renames at the same time if we separate them by commas.</Par>
      <Info>The rename operator can be used in a variety of ways. There are also notations in which you can rename the relation itself, or rename <Em>all</Em> attributes at the same time. More about that will be discussed when <Link to="/skill/ra-join-relations">joining relations</Link>.</Info>
    </Section>

    <Section title="Join relations through the natural join">
      <Par>ToDo: write this part next.</Par>
    </Section>
  </Page>;
}
