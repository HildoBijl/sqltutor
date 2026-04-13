import { Page, Section, Par, Term, List } from '@/components';
import { FigureExampleDLQuery } from '../../utils';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know how to apply projection and filtering within Datalog. We can use them together to find specific data from a table. It essentially allows us to turn an existing predicate into a <Term>derived predicate</Term>.</Par>
    </Section>

    <Section title="The long way: first filter, then project">
      <Par>Let's say we want to find the names of all the employees who live in Palo Alto. This can be done in two steps.</Par>
      <List useNumbers items={[
        <>Filtering: find all the employees who live in Palo Alto.</>,
        <>Projection: only select the first name and last name.</>,
      ]} />
      <Par>This can be done in Datalog using the following rules.</Par>
      <FigureExampleDLQuery query={<>employeeFromPaloAlto(id, fn, ln, p, e, a, hd, cs) :- employee(id, fn, ln, p, e, a, 'Palo Alto', hd, cs).<br />employeeFromPaloAltoName(fn, ln) :- employeeFromPaloAlto(id, fn, ln, p, e, a, hd, cs)</>} actualQuery="SELECT first_name, last_name FROM employees WHERE city='Palo Alto'" tableWidth={200} />
      <Par>This works, but it's not how it's done in practice. It's far easier to combine the two steps into one rule.</Par>
    </Section>

    <Section title="The short way: use filtering and projection together">
      <Par>We can apply filtering and projection in a single rule. For our example, this is done through</Par>
      <FigureExampleDLQuery query={<>employeeFromPaloAltoName(fn, ln) :- employee(id, fn, ln, p, e, a, 'Palo Alto', hd, cs).</>} actualQuery="SELECT first_name, last_name FROM employees WHERE city='Palo Alto'" tableWidth={200} />
      <Par>This is a lot shorter than before, but it can still be shorter! There are many variables that we don't use, so if we turn those into anonymous variables, we get</Par>
      <FigureExampleDLQuery query={<>employeeFromPaloAltoName(fn, ln) :- employee(_, fn, ln, _, _, _, 'Palo Alto', _, _).</>} actualQuery="SELECT first_name, last_name FROM employees WHERE city='Palo Alto'" tableWidth={200} />
      <Par>This is the shortest (and hence most common) way of extracting data from a table using Datalog. We only specify the arguments we need, add in matching conditions where possible, and leave everything else as an underscore.</Par>
    </Section>
  </Page>;
}
