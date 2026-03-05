import { Page, Section, Par, Term, IRA, RelationName } from '@/components';
import { FigureExampleRAQuery } from '../../utils';

export function Summary() {
  return <Page>
    <Section>
      <Par>There are a lot of possibilities when joining relations, like joining together three or more relations, or joining relations with themselves.</Par>
      <Par>To <Term>join three or more relations</Term> together, we take the exact same steps as we do when joining two relations. We could for instance find the departments whose manager now earns more than double of what they earned in a previous contract.</Par>
      <FigureExampleRAQuery query={<>∏<sub>d_name</sub>(σ<sub>salary &lt; 0.5*current_salary</sub>(ρ<sub>manager_id→e_id</sub>(departments) ⋈ employees ⋈ contracts))</>} actualQuery="SELECT DISTINCT departments.d_name FROM departments JOIN employees ON departments.manager_id=employees.e_id JOIN contracts ON employees.e_id=contracts.e_id WHERE contracts.salary < 0.5*employees.current_salary" tableWidth={120} tableScale={0.8} />
      <Par>It is also possible to <Term>join a relation with itself</Term>. This is commonly used when we need to compare pairs of tuples from the same relation. We could for instance find all employees (their IDs) who have had contracts for at least two different positions. To do so, we join the <RelationName>contracts</RelationName> relation with itself to find all pairs of contracts from the same person but for different positions.</Par>
      <FigureExampleRAQuery query={<>∏<sub>e_id</sub>(σ<sub>contracts.e_id = e2.e_id ∧ contracts.position ≠ e2.position</sub>(contracts ⨯ ρ<sub>e2</sub>(contracts)))</>} actualQuery="SELECT DISTINCT e1.e_id FROM contracts e1, contracts e2 WHERE e1.e_id = e2.e_id AND e1.position <> e2.position" tableWidth={120} tableScale={0.8} />
      <Par>In this latter case, when we compare a relation with itself, we need a <Term>table rename</Term> to make the attribute references work. A table rename is done through <IRA>ρ<sub>e2</sub>(contracts)</IRA>, which temporarily (only within this query) renames the second <RelationName>contracts</RelationName> relation as <RelationName>e2</RelationName>.</Par>
    </Section>
  </Page>;
}
