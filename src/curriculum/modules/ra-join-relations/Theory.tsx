import { Page, Section, Par, List, Info, Term, Em, M, RA, IRA, RelationName, Link } from '@/components';
import { FigureExampleRAQuery } from '../../utils';

import { FigureTwoTables } from '../database/Theory';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know what it means to join relations, and how to visualize the process as a Cartesian product followed by a filter. But how do we set up a join in relational algebra? There are two possible methods: through the Cartesian product or through the natural join. Let's study both methods.</Par>
    </Section>

    <Section title="Join relations through the Cartesian product">
      <Par>Suppose that we have two relations, <RelationName>departments</RelationName> and <RelationName>employees</RelationName>, and we want to join them over the foreign key <Em>manager_id</Em>.</Par>
      <FigureTwoTables />
      <Par>The most commonly used way to join relations in relational algebra, is to first use the <Term>Cartesian product</Term> <M>\times</M> (the times symbol) between the two relations. The Cartesian product is the combination of each row from one relation with each row from the other relation. It results in an enormous new relation.</Par>
      <FigureExampleRAQuery query={<>departments ⨯ employees</>} actualQuery="SELECT * FROM departments, employees" tableWidth={900} tableScale={0.45} below />
      <Par>To complete the join, we need to find which combinations of rows from <RelationName>departments</RelationName> and <RelationName>employees</RelationName> make sense. Here "make sense" means "They match, because the keys are equal." We should hence filter based on the foreign key! When we do, we have fully set up our join.</Par>
      <FigureExampleRAQuery query={<>σ<sub>departments.manager_id = employees.e_id</sub>(departments ⨯ employees)</>} actualQuery="SELECT * FROM departments JOIN employees ON departments.manager_id = employees.e_id" tableWidth={1000} tableScale={0.55} below />
      <Info>We used the dot-notation to specify attribute origins within the filter: to indicate which relation the attribute "manager_id" came from, we used <IRA>departments.manager_id</IRA>. In this case, there are no duplicate attribute names, so this wasn't really necessary. Nevertheless, it's a good practice to do so regardless when applying a Cartesian product, just to prevent confusion.</Info>
    </Section>

    <Section title="Use the rename operator for attributes">
      <Par>In practice, foreign keys often have the same name in both relations. When this is the case, there is a short-cut: the natural join! For our example this is not the case yet, but we could make it so: we can apply an <Term>attribute rename</Term>.</Par>
      <Par>To adjust an attribute name, we use the <Term>rename operator</Term> <M>\rho</M> (the Greek letter rho). If we want to rename <Em>e_id</Em> to <Em>manager_id</Em>, we could do so using the <M>\rightarrow</M> notation.</Par>
      <FigureExampleRAQuery query={<>ρ<sub>e_id→manager_id</sub>(employees)</>} actualQuery="SELECT e_id AS manager_id, first_name, last_name, phone, email, address, city, hire_date, current_salary FROM employees" tableWidth={900} tableScale={0.7} below />
      <Par>Note that the rename operator receives a relation, and the subscript describes how to adjust the attribute names. We can also add multiple attribute renames at the same time if we separate them by commas.</Par>
      <Info>The rename operator can be used in a variety of ways. There are also notations in which we can rename the relation itself, or rename <Em>all</Em> attributes at the same time. More about that will be discussed when setting up <Link to="/skill/ra-set-up-multi-relation-query">multi-relation queries</Link>.</Info>
    </Section>

    <Section title="Join relations through the natural join">
      <Par>Relational algebra has a short-cut to make joins: the <Term>natural join</Term> <M>\bowtie</M> (the bowtie symbol). The natural join automatically does two things.</Par>
      <List useNumbers items={[
        <>Take the Cartesian product of the two given relations.</>,
        <>Filter the combinations, keeping only the tuples where all <Em>equally named attributes</Em> are equal.</>,
      ]} />
      <Par>An example way to use it would be the following.</Par>
      <FigureExampleRAQuery query={<>departments ⋈ ρ<sub>e_id→manager_id</sub>(employees)</>} actualQuery="SELECT * FROM departments NATURAL JOIN (SELECT e_id AS manager_id, first_name, last_name, phone, email, address, city, hire_date, current_salary FROM employees)" tableWidth={900} tableScale={0.5} below />
      <Par>Internally, relational algebra sets up the Cartesian product, finds all attributes from the two relations with equal name (here "manager_id") and applies filtering to keep only the rows with equal "manager_id". It also merges the two attributes "departments.manager_id" and "employees.manager_id" into one attribute, since the values are equal anyway. This completes the join, but then with far less notation than before.</Par>
    </Section>

    <Section title="Apply a filter after the join">
      <Par>Often, after setting up a join, we still want to do more filtering. Let's for instance find all departments where the manager earns more than 20% of the entire department budget. In this case we must add a filter after the join.</Par>
      <Par>When using a Cartesian product, we can either add a separate filtering operator, or add the new condition to the existing operator.</Par>
      <RA>σ<sub>employees.current_salary &gt; 0.2*departments.budget</sub>(σ<sub>departments.manager_id = employees.e_id</sub>(departments ⨯ employees))</RA>
      <RA>σ<sub>departments.manager_id = employees.e_id ∧ employees.current_salary &gt; 0.2*departments.budget</sub>(departments ⨯ employees)</RA>
      <Par>Both options are fine. It is however recommended for clarity to keep the <Term>join conditions</Term> (needed to complete the join) separate from the <Term>external conditions</Term> (given by the problem statement). Don't alternate join conditions and external conditions!</Par>
      <Par>When we use the natural join, there is only one option: add a filtering operator after performing the join.</Par>
      <FigureExampleRAQuery query={<>σ<sub>current_salary &gt; 0.2*budget</sub>(departments ⋈ ρ<sub>e_id→manager_id</sub>(employees))</>} actualQuery="SELECT * FROM departments NATURAL JOIN (SELECT e_id AS manager_id, first_name, last_name, phone, email, address, city, hire_date, current_salary FROM employees) WHERE current_salary < 0.2*budget" tableWidth={900} tableScale={0.5} below />
      <Info>When filtering after using a natural join, we never need the dot-notation to indicate where an attribute comes from. After all, the natural join guarantees there are no equally-named attributes left. Any sets of equally-named attributes are required to be equal, and are hence automatically merged into single attributes!</Info>
    </Section>
  </Page>;
}
