import { Page, Section, Par, Info, Warning, Term } from '@/components';
import { FigureExampleDLQuery } from '../../utils';

export function Summary() {
  return <Page>
    <Section>
      <Par>To set up a rule in Datalog that applies filtering, we can apply <Term>constraint-based filtering</Term>: we take a tuple from a predicate and add any number of comma-separated constraints to the rule.</Par>
      <FigureExampleDLQuery query={<>highEarningEmployee(id, fn, ln, p, e, a, c, hd, cs) :- employee(id, fn, ln, p, e, a, c, hd, cs), cs &gt;= 200000.</>} actualQuery="SELECT * FROM employees WHERE current_salary >= 200000" tableWidth={980} below />
      <Par>On equality conditions, we could also use <Term>argument matching</Term>: we instantly insert the value into the predicate.</Par>
      <FigureExampleDLQuery query={<>employeeFromPaloAlto(id, fn, ln, p, e, a, hd, cs) :- employee(id, fn, ln, p, e, a, 'Palo Alto', hd, cs).</>} actualQuery="SELECT e_id, first_name, last_name, phone, email, address, hire_date, current_salary FROM employees WHERE city='Palo Alto'" tableWidth={900} below />
      <Info>When using argument matching, it's common to drop the respective argument in the resulting predicate.</Info>
      <Par>The comma in Datalog represents "and". To use an "or" connective, we set up multiple rules for the same predicate.</Par>
      <FigureExampleDLQuery query={<>seniorEmployee(id, fn, ln, p, e, a, c, hd, cs) :- employee(id, fn, ln, p, e, a, c, hd, cs), hd &lt; '2024-01-01'.<br />seniorEmployee(id, fn, ln, p, e, a, c, hd, cs) :- employee(id, fn, ln, p, e, a, c, hd, cs), cs &gt;= 200000.</>} actualQuery="SELECT * FROM employees WHERE hire_date < '2024-01-01' OR current_salary >= 200000" tableWidth={940} below />
      <Warning>In the special case where "and" and "or" are both used, it's best to use multiple predicates, applying the filtering condition in steps.</Warning>
    </Section>
  </Page>;
}
