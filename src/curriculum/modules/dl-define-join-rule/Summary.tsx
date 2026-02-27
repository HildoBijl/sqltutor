import { Page, Section, Par, Info, Term, Em } from '@/components';
import { FigureExampleDLQuery } from '../../utils';

export function Summary() {
  return <Page>
    <Section>
      <Par>The key to joining two (or more) predicates in Datalog, is to add the predicates to a single rule. This normally creates the <Term>Cartesian product</Term> of these predicates.</Par>
      <Par>To set up a <Term>join rule</Term>, we must require the respective foreign keys to be equal. This is commonly done by using the <Em>same variable name</Em> in each respective predicate.</Par>
      <FigureExampleDLQuery query={<>departmentManagerContactInfo(did, dn, fn, ln, p, e) :- department(did, dn, mid, _, _), employee(mid, fn, ln, p, e, _, _, _, _).</>} actualQuery="SELECT d.d_id, d.d_name, e.first_name, e.last_name, e.phone, e.email FROM departments d JOIN employees e ON d.manager_id=e.e_id" tableWidth={700} below />
      <Info>Whenever the <Em>same variable name</Em> is used multiple times in a rule, Datalog requires it to have the <Em>same value</Em> at every occurrence. This is the trick we use to connect the predicates, completing the join. (An exception is the underscore, which does not count as a variable name: it represents an anonymous variable.)</Info>
    </Section>
  </Page>;
}
