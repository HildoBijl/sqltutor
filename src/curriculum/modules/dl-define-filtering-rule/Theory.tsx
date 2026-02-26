import { Page, Section, Par, Quote, Info, Em, Term, DL, IDL, Link } from '@/components';
import { FigureExampleDLQuery } from '../../utils';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know that <Term>filtering</Term> comes down to finding the right rows in a relation, subject to some condition. Let's take a look at how we can do that using Datalog.</Par>
    </Section>

    <Section title="Add constraints to rules to restrict arguments">
      <Par>Let's say we want to find all employees earning at least 200000. How would we do so in Datalog? (This example may seem familiar: we've already used it at the <Link to="/skill/ra-set-up-multi-condition-query">Datalog</Link> concept.)</Par>
      <Par>The idea here is to set up a new predicate that contains all these high-earning employees. We can set it up using the following rule.</Par>
      <DL>highEarningEmployee(id, fn, ln, p, e, a, c, hd, cs) :- employee(id, fn, ln, p, e, a, c, hd, cs), cs &gt;= 200000.</DL>
      <Par>You can read this rule as:</Par>
      <Quote>The set of values <IDL>(id, fn, ln, p, e, a, c, hd, cs)</IDL> is considered a high-earning employee, if this same set is considered an employee, and the value of <IDL>cs</IDL> is at least 200000.</Quote>
      <Par>So to restrict arguments through conditions, we simply add constraints to the rule. We call this <Term>constraint-based filtering</Term> and it has a lot of possibilities. We could for instance also require that our employees are hired before 2024.</Par>
      <FigureExampleDLQuery query={<>highEarningSeniorEmployee(id, fn, ln, p, e, a, c, hd, cs) :- employee(id, fn, ln, p, e, a, c, hd, cs), cs &gt;= 200000, hd &lt; '2024-01-01'.</>} actualQuery="SELECT * FROM employees WHERE current_salary >= 200000 AND hire_date < '2024-01-01'" tableWidth={940} below />
      <Par>Any additional constraint can be added to the rule as well.</Par>
    </Section>

    <Section title="Use argument matching for equality constraints">
      <Par>So far we have used inequality constraints. If we have <Term>equality constraints</Term>, there's an extra short-cut.</Par>
      <Par>Suppose that we want to find all employees named "Bob". We could do so using the method from above.</Par>
      <FigureExampleDLQuery query={<>employeeNamedBob(id, fn, ln, p, e, a, c, hd, cs) :- employee(id, fn, ln, p, e, a, c, hd, cs), fn = 'Bob'.</>} actualQuery="SELECT * FROM employees WHERE first_name = 'Bob'" tableWidth={940} below />
      <Par>However, we could also directly fill in this name into the <IDL>employee</IDL> predicate. This is called <Term>argument matching</Term>. A naive implementation would be</Par>
      <DL>employeeNamedBob(id, fn, ln, p, e, a, c, hd, cs) :- employee(id, 'Bob', ln, p, e, a, c, hd, cs).</DL>
      <Par>This almost works, except for one tiny problem. In the head (the left side) of the rule, there's a variable <IDL>fn</IDL> which isn't defined anywhere! This prevents the rule from working as intended.</Par>
      <Par>One solution is to also fill in 'Bob' in the head of the rule.</Par>
      <DL>employeeNamedBob(id, 'Bob', ln, p, e, a, c, hd, cs) :- employee(id, 'Bob', ln, p, e, a, c, hd, cs).</DL>
      <Par>This would work. However, it's considered bad practice in Datalog, since the predicate name already specifies that it only contains employees named Bob. If we already know that all employees in this predicate have first name 'Bob', why would we still include this argument? It's far better to drop it. We then get the following query.</Par>
      <FigureExampleDLQuery query={<>employeeNamedBob(id, ln, p, e, a, c, hd, cs) :- employee(id, 'Bob', ln, p, e, a, c, hd, cs).</>} actualQuery="SELECT e_id, last_name, phone, email, address, city, hire_date, current_salary FROM employees WHERE first_name = 'Bob'" tableWidth={940} below />
      <Par>Note that we have lost a column along the way, but that's not a problem.</Par>
      <Par>The above method of instantly filling in values into Datalog rules is very common practice. It's one of the things which keeps Datalog rules short, making them easy to read and write.</Par>
    </Section>

    <Section title="Use multiple rules for or-conditions">
      <Par>So far we have set up rules where employees must require <Em>all</Em> conditions from a given list. But what if we have an or-condition: we are looking for employees that meet <Em>some</Em> of a list of conditions? What if we, for instance, want to find all employees living in either Palo Alto or Los Altos? (As their names imply, both these cities are rather hilly.)</Par>
      <Par>Or-conditions are far less common than and-conditions, so the syntax in Datalog is a bit more elaborate for it. To set up an or-condition, the idea is to use multiple rules.</Par>
      <FigureExampleDLQuery query={<>employeeFromHillyCity(id, fn, ln, p, e, a, 'Palo Alto', hd, cs) :- employee(id, fn, ln, p, e, a, 'Palo Alto', hd, cs).<br/>employeeFromHillyCity(id, fn, ln, p, e, a, 'Los Altos', hd, cs) :- employee(id, fn, ln, p, e, a, 'Los Altos', hd, cs).</>} actualQuery="SELECT * FROM employees WHERE city='Palo Alto' OR city='Los Altos'" tableWidth={940} below />
      <Par>To people new to Datalog, it looks like we have defined the same predicate in two different ways, which would cause an error. But this is actually very far from the truth. In Datalog, it is very well possible to set up multiple rules for the same predicate. After all, they are <Em>rules</Em>, not definitions. We have effectively said the following:</Par>
      <Quote>An employee lives in a hilly city if this employee is from Palo Alto.<br/>
      An employee (also) lives in a hilly city, if this employee is from Los Altos.</Quote>
      <Par>If, for some set of variables, one (or both) of these rules holds true, then this set of variables is considered part of the predicate.</Par>
      <Info>Sometimes we have conditions that are a mix of and-conditions and or-conditions. In that case, it's best to set up <Em>multiple predicates</Em>. Suppose that we want to find all employees from Palo Alto and Los Altos earning more than 200000. We then <Em>first</Em> set up a list of all high-earning employees, and <Em>then</Em> restrict this list to people from hilly cities. (Or the other way around.) In Datalog, using lots of easily-defined predicates is better than trying to fit everything into one complicated rule.</Info>
    </Section>
  </Page>;
}
