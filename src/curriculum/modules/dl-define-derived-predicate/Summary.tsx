import { Page, Section, Par, Term } from '@/components';
import { FigureExampleDLQuery } from '../../utils';

export function Summary() {
  return <Page>
    <Section>
      <Par>We can combine filtering and projection in Datalog to turn an existing predicate into a <Term>derived predicate</Term>. Combining filtering and projection is generally done using a single rule. We could for instance find the names of all employees living in Palo Alto.</Par>
      <FigureExampleDLQuery query={<>employeeFromPaloAltoName(fn, ln) :- employee(_, fn, ln, _, _, _, 'Palo Alto', _, _).</>} actualQuery="SELECT first_name, last_name FROM employees WHERE city='Palo Alto'" tableWidth={200} />
      <Par>We keep the rule short by using argument matching where possible, and by turning variables we don't need into anonymous variables.</Par>
    </Section>
  </Page>;
}
