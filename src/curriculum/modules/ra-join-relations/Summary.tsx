import { Page, Section, Par, Info, Term, Em, M } from '@/components';
import { FigureExampleRAQuery } from '../../utils';

export function Summary() {
  return <Page>
    <Section>
      <Par>There are two ways to <Term>join relations</Term> within relational algebra. The more general method is through the <Term>Cartesian product</Term> <M>\times</M> followed by a filter. The Cartesian product sets up a huge relation containing all <Em>combinations</Em> of tuples from each of the given relations. The filter then takes all the pairs of tuples from this that match up: have equal foreign key.</Par>
      <FigureExampleRAQuery query={<>σ<sub>departments.manager_id = employees.e_id</sub>(departments ⨯ employees)</>} actualQuery="SELECT * FROM departments JOIN employees ON departments.manager_id = employees.e_id" tableWidth={1000} tableScale={0.55} below />
      <Par>Alternatively, in some case, we can also use the <Term>natural join</Term> <M>\bowtie</M> as a short-cut. This operator internally takes the Cartesian product of two relations and directly filters them, requiring all <Em>equally-named attributes</Em> to be equal.</Par>
      <Info>Sometimes the attributes don't directly have the proper names for the natural join to work. We can first use the <Term>rename operator</Term> <M>\rho</M> to adjust attribute names, allowing the natural join to work.</Info>
      <FigureExampleRAQuery query={<>departments ⋈ ρ<sub>e_id→manager_id</sub>(employees)</>} actualQuery="SELECT * FROM departments NATURAL JOIN (SELECT e_id AS manager_id, first_name, last_name, phone, email, address, city, hire_date, current_salary FROM employees)" tableWidth={900} tableScale={0.5} below />
    </Section>
  </Page>;
}
