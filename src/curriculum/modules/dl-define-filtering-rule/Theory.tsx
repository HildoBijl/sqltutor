import { Page, Section, Par, Quote, List, Info, Warning, Em, Term, DL, IDL, Link } from '@/components';
import { FigureExampleDLQuery } from '../../utils';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know that <Term>filtering</Term> comes down to finding the right rows in a table, subject to some condition. Let's take a look at how we can do that using Datalog.</Par>
    </Section>

    <Section title="Add constraints to rules to restrict arguments">
      <Par>Let's say we want to find all employees earning at least 200000. How would we do so in Datalog? (This example may seem familiar: we've already shown it at the <Link to="/skill/ra-set-up-multi-condition-query">Datalog</Link> concept. Here we'll figure out how it works.)</Par>
      <Par>The idea here is to set up a new predicate that contains all these high-earning employees. We can set it up using the following rule.</Par>
      <FigureExampleDLQuery query={<>highEarningEmployee(id, fn, ln, p, e, a, c, hd, cs) :- employee(id, fn, ln, p, e, a, c, hd, cs), cs &gt;= 200000.</>} actualQuery="SELECT * FROM employees WHERE current_salary >= 200000" tableWidth={940} below />
      <Par>You can read this rule as:</Par>
      <Quote>The set of values <IDL>(id, fn, ln, p, e, a, c, hd, cs)</IDL> is considered a high-earning employee, if this same set is considered an employee, and the value of <IDL>cs</IDL> is at least 200000.</Quote>
      <Par>So to restrict arguments through conditions, we simply add constraints to the rule. We call this <Term>constraint-based filtering</Term> and it has a lot of possibilities. We could for instance also require that our employees are hired before 2024.</Par>
      <FigureExampleDLQuery query={`
highEarningSeniorEmployee(id, fn, ln, p, e, a, c, hd, cs) :-
        employee(id, fn, ln, p, e, a, c, hd, cs),
        cs >= 200000,
        hd < '2024-01-01'.
`} actualQuery="SELECT * FROM employees WHERE current_salary >= 200000 AND hire_date < '2024-01-01'" tableWidth={940} below />
      <Par>Any additional constraint can be added to the rule as well.</Par>
      <Info>We have split up the above Datalog rule over multiple lines. This is a very common thing to do. Datalog ignores enters: a command only ends on a period.</Info>
    </Section>

    <Section title="Use argument matching for equality constraints">
      <Par>So far we have used inequality constraints. If we have <Term>equality constraints</Term>, we could do the same thing.</Par>
      <Par>Suppose that we want to find all employees that live in Palo Alto. We could do so using the above method.</Par>
      <FigureExampleDLQuery query={<>employeeFromPaloAlto(id, fn, ln, p, e, a, c, hd, cs) :- employee(id, fn, ln, p, e, a, c, hd, cs), c = 'Palo Alto'.</>} actualQuery="SELECT * FROM employees WHERE city='Palo Alto'" tableWidth={940} below />
      <Par>This would work. However, for equality constraints there's a powerful short-cut. We could also directly fill in the given value into the <IDL>employee</IDL> predicate. This is called <Term>argument matching</Term>. A naive implementation would be</Par>
      <DL>employeeFromPaloAlto(id, fn, ln, p, e, a, c, hd, cs) :- employee(id, fn, ln, p, e, a, 'Palo Alto', hd, cs).</DL>
      <Par>This almost works, except for one tiny problem. In the head (the left side) of the rule, there's a variable <IDL>c</IDL> which isn't defined anywhere! This prevents the rule from working as intended.</Par>
      <Par>One solution is to also fill in 'Palo Alto' in the head of the rule.</Par>
      <DL>employeeFromPaloAlto(id, fn, ln, p, e, a, 'Palo Alto', hd, cs) :- employee(id, fn, ln, p, e, a, 'Palo Alto', hd, cs).</DL>
      <Par>This would work. However, it's considered bad practice in Datalog, and there's three reasons why.</Par>
      <List items={[
        <>We use the piece of text 'Palo Alto' twice in one rule. If we want to change this city, we'd have to change it in multiple locations, which is not ideal.</>,
        <>Datalog considers the 'Palo Alto' string in the head as "new data" since technically it's a piece of text we as programmers wrote. Though technically allowed, it's considered cleaner if all data in derived Datalog predicates comes from facts (original tables).</>,
        <>The predicate name <IDL>employeeFromPaloAlto</IDL> already specifies that the predicate only contains employees from Palo Alto. If all tuples in this predicate have their city equal to 'Palo Alto', why would we include this argument in the first place? It's a waste of memory space!</>,
      ]} />
      <Par>All these problems are solved if we drop the "city" argument (drop the column) from the predicate.</Par>
      <FigureExampleDLQuery query={<>employeeFromPaloAlto(id, fn, ln, p, e, a, hd, cs) :- employee(id, fn, ln, p, e, a, 'Palo Alto', hd, cs).</>} actualQuery="SELECT e_id, first_name, last_name, phone, email, address, hire_date, current_salary FROM employees WHERE city='Palo Alto'" tableWidth={940} below />
      <Info>Argument matching is a useful trick to keep Datalog rules short, making them easy to read and write. It's used very often in practice.</Info>
    </Section>

    <Section title="Use multiple rules for or-conditions">
      <Par>So far we have set up rules where employees must require <Em>all</Em> conditions from a given list. But what if we have an or-condition? Suppose that we are redefining a "senior employee" as someone who has been working for the company for a while <Em>or</Em> has a high salary. How would we set up the <IDL>seniorEmployee</IDL> predicate then?</Par>
      <Par>Or-conditions are far less common than and-conditions, so the syntax in Datalog is a bit more elaborate for it. To set up an or-condition, we use multiple rules for the same predicate.</Par>
      <FigureExampleDLQuery query={<>seniorEmployee(id, fn, ln, p, e, a, c, hd, cs) :- employee(id, fn, ln, p, e, a, c, hd, cs), hd &lt; '2024-01-01'.<br />seniorEmployee(id, fn, ln, p, e, a, c, hd, cs) :- employee(id, fn, ln, p, e, a, c, hd, cs), cs &gt;= 200000.</>} actualQuery="SELECT * FROM employees WHERE hire_date < '2024-01-01' OR current_salary >= 200000" tableWidth={940} below />
      <Par>To people new to Datalog, it looks like we have defined the same predicate in two different ways, which would cause an error. But this is actually very far from the truth. In Datalog, it is very well possible to set up multiple rules for the same predicate. After all, they are <Em>rules</Em>, not definitions. We have effectively said the following:</Par>
      <Quote>An employee is a senior employee, if this employee has been working at the company for a long time.<br />
        An employee (also) is a senior employee, if this employee earns a high salary.</Quote>
      <Par>If, for some set of variables, the body of <Em>at least one</Em> of these rules holds true, then this set of variables is considered part of the predicate.</Par>
      <Warning>
        <Par sx={{ mb: 1 }}>Sometimes we want to set up conditions that are a mix of and-conditions and or-conditions. In that case, it's best to set up <Em>multiple predicates</Em>.</Par>
        <Par>Suppose that we want to find all senior employees from Palo Alto. These are all employees who live in Palo Alto and either have a high salary or have worked at the company for a while. To find these employees, we <Em>first</Em> set up a list of all senior employees (as we just did) and <Em>then</Em> restrict this list to people from Palo Alto. (Or the other way around.) In Datalog, using lots of easily-defined predicates is better than trying to fit everything into one complicated rule.</Par>
      </Warning>
    </Section>
  </Page>;
}
