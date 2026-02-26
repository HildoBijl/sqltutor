import { Page, Section, Par, Info, Warning, List, Em, Term, DL, IDL } from '@/components';
import { FigureExampleDLQuery } from '../../utils';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know that <Term>projection</Term> comes down to selecting various columns from a relation. How do we do so using Datalog?</Par>
    </Section>

    <Section title="Limit a predicate to specific variables">
      <Par>Suppose that we have a predicate (table) containing all employees of a company. Let's say we only want the first name and last name from this predicate. How can this be achieved?</Par>
      <Par>The best way to do so, is by setting up a new predicate (like a view) that <Em>only</Em> has these arguments. This can be done in Datalog through</Par>
      <DL>employeeName(fn, ln) :- employee(id, fn, ln, p, e, a, c, hd, cs).</DL>
      <Par>Let's study what's happening here.</Par>
      <List items={[
        <>As always, Datalog will find all possible combinations of all variables such that all literals hold true. In this case, that's the set of <IDL>(id, fn, ln, p, e, a, c, hd, cs)</IDL> for which the entry appears in the employee predicate (table).</>,
        <>Datalog assembles a new predicate (a view) called <IDL>employeeName</IDL> with only two arguments: <IDL>fn</IDL> and <IDL>ln</IDL>, which correspond to the second and third argument from <IDL>employee</IDL>.</>,
        <>The result is a new view with all <IDL>(fn, ln)</IDL> values, for which there are other values <IDL>(id, p, e, a, c, hd, cs)</IDL> such that the whole combination <IDL>(id, fn, ln, p, e, a, c, hd, cs)</IDL> is in the <IDL>employee</IDL> predicate.</>,
      ]} />
      <Par>We have effectively applied projection to the <IDL>employee</IDL> predicate. The result can be visualized as follows.</Par>
      <FigureExampleDLQuery query={<>employeeName(fn, ln) :- employee(id, fn, ln, p, e, a, c, hd, cs).</>} actualQuery="SELECT first_name, last_name FROM employees" tableWidth={200} />
      <Info>Datalog does not do duplicates. If there are multiple employees with the same first and last name, then they will only appear once in the <IDL>employeeName</IDL> predicate.</Info>
    </Section>

    <Section title="Use the underscore for anonymous variables">
      <Par>The above Datalog rule is a bit elaborate: we have defined names for lots of variables which are subsequently not used. This can be easier.</Par>
      <Par>If we have variables that we don't use anywhere, we can replace them by the special underscore character <IDL>_</IDL>. This character effectively means, "I don't care what the value of this is, and I won't be using it anywhere." It turns the respective variable into an <Term>anonymous variable</Term>.</Par>
      <Par>Using this new symbol, we can rewrite the above query through</Par>
      <FigureExampleDLQuery query={<>employeeName(fn, ln) :- employee(_, fn, ln, _, _, _, _, _, _).</>} actualQuery="SELECT first_name, last_name FROM employees" tableWidth={200} />
      <Par>This query does the exact same thing as the previous one, but it's clearer and easier to set up.</Par>
      <Warning>Normally, if you use the same variable name twice in a single Datalog rule, you require the two corresponding values to be equal. The underscore <IDL>_</IDL> is exempt from this idea. You can apply it as much as you like, and every time it means "This can have any value. I don't care about what exact value it is."</Warning>
    </Section>
  </Page>;
}
