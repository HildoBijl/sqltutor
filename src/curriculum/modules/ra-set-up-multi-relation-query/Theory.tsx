import { Page, Section, Par, List, Warning, Term, Em, M, RA, IRA, RelationName } from '@/components';
import { FigureExampleRAQuery, FigureSingleTable } from '../../utils';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know the basic way of joining relations using relational algebra. Many applications require us to get fancy with joins: joining even more relations together, or joining relations with itself. We'll study the tricks that we may apply in these cases.</Par>
    </Section>

    <Section title="Use multiple joins sequentially">
      <Par>Suppose that we have a list of departments, of employees (with current salary), and of employee data contracts (with former salaries). Let's say we want to find all the department managers who have really benefited from their manager status: they now earn more than double what they earned before. And we want a clean overview, showing the person's name, the department they manage, their old position, their old salary, and their current salary. How would we generate this overview?</Par>
      <Par>The key is that we need data from three relations now: from <RelationName>departments</RelationName>, from <RelationName>employee</RelationName> and from <RelationName>emp_data</RelationName>. And just like we can join two relations, we can join three! Joining three (or more) relations is done in exactly the same way as joining two. Even the order in which we join does not matter. Both the Cartesian product <M>\times</M> and the natural join <M>\bowtie</M> are symmetric operators: it does not matter which relation is on the left or on the right. The final join, using either the Cartesian product or the natural join, then becomes</Par>
      <RA>σ<sub>departments.manager_id = employees.e_id ∧ employees.e_id = emp_data.e_id</sub>(departments ⨯ employees ⨯ emp_data)</RA>
      <RA>ρ<sub>manager_id→e_id</sub>(departments) ⋈ employees ⋈ emp_data</RA>
      <FigureSingleTable query="SELECT * FROM departments JOIN employees ON departments.manager_id=employees.e_id JOIN emp_data ON employees.e_id=emp_data.e_id" tableWidth={1000} tableScale={0.4} />
      <Par>Once we have this join, we can answer queries based on it. Solving the problem stated above by adding filtering and projection, we find the following query.</Par>
      <FigureExampleRAQuery query={<>∏<sub>first_name,last_name,d_name,position,salary,current_salary</sub>(σ<sub>salary &lt; 0.5*current_salary</sub>(ρ<sub>manager_id→e_id</sub>(departments) ⋈ employees ⋈ emp_data))</>} actualQuery="SELECT DISTINCT employees.first_name, employees.last_name, departments.d_name, emp_data.position, emp_data.salary, employees.current_salary FROM departments JOIN employees ON departments.manager_id=employees.e_id JOIN emp_data ON employees.e_id=emp_data.e_id WHERE emp_data.salary < 0.5*employees.current_salary" tableWidth={600} tableScale={0.8} below />
      <Par>It seems that Bob Dylon used to work in various other positions, but really enjoys being manager of the Operations department now.</Par>
    </Section>

    <Section title="Join a relation with itself">
      <Par>Now let's say we want to find the people who have been climbing the ladder within the company, switching position as they go. How do we find all people (their employee IDs) who have had at least two different positions?</Par>
      <Par>The key here is to compare a person's job contracts with <Em>their own</Em> other job contracts. We could take the Cartesian product of <RelationName>emp_data</RelationName> with itself.</Par>
      <RA>emp_data ⨯ emp_data</RA>
      <Par>This pairs every job contract with <Em>every</Em> job contract (including itself). However, this is not yet what we want. For our example, we only want to compare contracts from the <Em>same person</Em>. We should therefore add a filter: the person from the first <RelationName>emp_data</RelationName> relation should be the <Em>same</Em> as the person from the second <RelationName>emp_data</RelationName> relation. But how do we specify this? The problem is: both relations are called <RelationName>emp_data</RelationName>. So which relation/attribute does "emp_data.e_id" refer to?</Par>
      <Par>The solution to this reference problem is to use a <Term>relation rename</Term>. The <Term>rename operator</Term> <M>\rho</M> can (next to attribute renames) also be used to temporarily give a relation within a query a different name. We could for instance set up our full query as</Par>
      <RA>σ<sub>emp_data.e_id = e2.e_id</sub>(emp_data ⨯ ρ<sub>e2</sub>(emp_data))</RA>
      <Par>In this query, we temporarily rename the second <RelationName>emp_data</RelationName> relation as <RelationName>e2</RelationName>. We then take the Cartesian product and apply filtering: we only keep the rows where the first <RelationName>emp_data</RelationName> relation has the same "e_id" parameter as the second <RelationName>emp_data</RelationName> relation, which is now called <RelationName>e2</RelationName>.</Par>
      <Par>Once we have this relation, we can compare every person's job contracts with every one of their other job contracts. Our goal is to find two job contracts with different positions. So we add this condition to the filter.</Par>
      <FigureExampleRAQuery query={<>σ<sub>emp_data.e_id = e2.e_id ∧ emp_data.position ≠ e2.position</sub>(emp_data ⨯ ρ<sub>e2</sub>(emp_data))</>} actualQuery="SELECT * FROM emp_data e1, emp_data e2 WHERE e1.e_id = e2.e_id AND e1.position <> e2.position" tableWidth={900} tableScale={0.5} below />
      <Par>Note that these are all possible combinations of two contracts of the <Em>same person</Em> but with <Em>different</Em> positions. This is almost what we want. The final step is extracting the <Em>people</Em> having these contracts, which is done through a projection. Extracting the employee IDs (either from <RelationName>emp_data</RelationName> or <RelationName>e2</RelationName>) gives the final result.</Par>
      <FigureExampleRAQuery query={<>∏<sub>emp_data.e_id</sub>(σ<sub>emp_data.e_id = e2.e_id ∧ emp_data.position ≠ e2.position</sub>(emp_data ⨯ ρ<sub>e2</sub>(emp_data)))</>} actualQuery="SELECT DISTINCT e1.e_id FROM emp_data e1, emp_data e2 WHERE e1.e_id = e2.e_id AND e1.position <> e2.position" tableWidth={120} tableScale={0.8} />
      <Par>This example shows how you can use a Cartesian product to join a relation with itself. This is useful if you want to compare pairs of different tuples from the same relation.</Par>
    </Section>

    <Section title="Use the rename operator">
      <Par>As final explanation, we add some clarification on the rename operator <M>\rho</M>. You have by now seen two ways of using it. There are actually three common ways in which we can use the rename operator.</Par>
      <List items={[
        <>As an <Term>attribute rename</Term> <IRA>ρ<sub>e_id→manager_id</sub>(works)</IRA>. This changes the names of one (or more) attributes within a relation. This is often used to prepare for a natural join. It can also be useful by itself, if you want the output attributes to have a certain name.</>,
        <>As a <Term>relation rename</Term> <IRA>ρ<sub>e2</sub>(emp_data)</IRA>. This changes the name of the relation given to it. It is only used to support proper referencing in the rest of the query, as it doesn't do anything else.</>,
        <>As a joint <Term>relation/attribute rename</Term> <IRA>ρ<sub>e2, e_id→manager_id, salary→contract_salary</sub>(emp_data)</IRA>. This combines the above two functions into one. Note that the new relation name is given first without an arrow, and any number of attribute renames is given afterwards using the <Term>arrow notation</Term>.</>,
      ]} />
      <Par>This is everything that can be done using the rename operator.</Par>
      <Warning>In some literature, the rename operator is also used to instantly rename <Em>all</Em> attributes. In that case, the <Term>bracket notation</Term> is used, like in <IRA>ρ<sub>contracts(id, pos, sal, start, end, score, status)</sub>(emp_data)</IRA>. The new relation name is put outside of the brackets, and within the brackets are all the new attribute names in the order in which they appear in the original relation. This bracket notation is often frowned upon, because it assumes there is an ordering of the attributes. In relational algebra this is generally not the case: tuples have no order of attributes, but names are used to distinguish them.</Warning>
    </Section>
  </Page>;
}
