import { Page, Section, Par, Quote, Info, Warning, Em, Term, IDL } from '@/components';
import { FigureExampleDLQuery } from '../../utils';

export function Theory() {
  return <Page>
    <Section>
      <Par>Now that we know how to apply projection and filtering in Datalog, let's take a look at how to join tables.</Par>
    </Section>

    <Section title="Set up a Cartesian product">
      <Par>A join is basically a Cartesian product followed by a filter. So first let's set up a Cartesian product in Datalog. Suppose that we have a table of departments, and a table of employees. The <Term>Cartesian product</Term> is set up by adding both literals to a single rule.</Par>
      <FigureExampleDLQuery query={`
departmentEmployeeCombination(did, dn, mid, b, ne, eid, fn, ln, p, e, a, c, hd, cs) :-
        department(did, dn, mid, b, ne),
        employee(eid, fn, ln, p, e, a, c, hd, cs).
`} actualQuery="SELECT * FROM departments, employees" tableWidth={1500} below />
      <Par>The above rule can be read as follows.</Par>
      <Quote>The set of values <IDL>(did, dn, mid, b, ne, eid, fn, ln, p, e, a, c, hd, cs)</IDL> is considered a department/employee combination, if <IDL>(did, dn, mid, b, ne)</IDL> is a department and if <IDL>(eid, fn, ln, p, e, a, c, hd, cs)</IDL> is an employee.</Quote>
      <Par>Seeing the rule written in this way makes it clearer why it gives a Cartesian product: it literally gives all possible combinations of one department and one employee.</Par>
    </Section>

    <Section title="Filter: add the join condition">
      <Par>To complete the join, we must add a filter. The naive way of doing so would be to add the constraint that the manager ID from the departments table must equal the employee ID from the employees table: <IDL>mid = eid</IDL>.</Par>
      <FigureExampleDLQuery query={`
departmentWithManager(did, dn, mid, b, ne, eid, fn, ln, p, e, a, c, hd, cs) :-
        department(did, dn, mid, b, ne),
        employee(eid, fn, ln, p, e, a, c, hd, cs),
        mid = eid.
`} actualQuery="SELECT d.*, e.* FROM departments d JOIN employees e ON d.manager_id=e.e_id" tableWidth={1500} below />
      <Par>This would work, but it's not the way it's commonly done.</Par>
      <Par>In Datalog, if we ever use the <Em>same variable name</Em> in one rule, then this variable must have the <Em>same value</Em> everywhere it is used within this rule. Through this idea we shorten the above rule: we use the same variable name for the manager ID and the employee ID, denoting both as <IDL>mid</IDL>. (Any name will do, as long as it's equal.)</Par>
      <FigureExampleDLQuery query={`
departmentWithManager(did, dn, mid, b, ne, fn, ln, p, e, a, c, hd, cs) :-
        department(did, dn, mid, b, ne),
        employee(mid, fn, ln, p, e, a, c, hd, cs).
`} actualQuery="SELECT d.*, e.first_name, e.last_name, e.phone, e.email, e.address, e.city, e.hire_date, e.current_salary FROM departments d JOIN employees e ON d.manager_id=e.e_id" tableWidth={1400} below />
      <Info>Let's clarify why this short-cut works. As always, Datalog will look for all sets of possible values for <Em>all</Em> the variables we used (including <IDL>mid</IDL>) such that <Em>all</Em> literals hold true. So <Em>both</Em> <IDL>department(did, dn, mid, b, ne)</IDL> and <IDL>employee(mid, fn, ln, p, e, a, c, hd, cs)</IDL> must hold true for our set of variables. But because we used the variable <IDL>mid</IDL> in both, the value of <IDL>mid</IDL> must match in both predicates! That's why this short-cut implicitly requires the manager ID to be equal to the employee ID.</Info>
    </Section>

    <Section title="Projection: select required arguments">
      <Par>Obiously we don't always need all arguments. Suppose that, for each department (its ID and name), we only want the manager's name and contact info. We could then turn all other variables into anonymous variables. This simplifies the rule further.</Par>
      <FigureExampleDLQuery query={`
departmentManagerContactInfo(did, dn, fn, ln, p, e) :-
        department(did, dn, mid, _, _),
        employee(mid, fn, ln, p, e, _, _, _, _).
`} actualQuery="SELECT d.d_id, d.d_name, e.first_name, e.last_name, e.phone, e.email FROM departments d JOIN employees e ON d.manager_id=e.e_id" tableWidth={700} below />
      <Warning>Although we don't use <IDL>mid</IDL> in the output, we <Em>cannot</Em> turn it into an anonymous variable. We use it to link the two predicates!</Warning>
      <Par>In short, to set up a <Term>join rule</Term> in Datalog, we use two (or more) predicates in one rule. The join conditions are applied by using the <Em>same variable name</Em> in the respective predicates. Unused variables can be turned into anonymous variables.</Par>
      <Info>Because Datalog does not use argument names, there is no such thing as a natural join. Luckily we just saw that the non-natural join is pretty easy to set up.</Info>
    </Section>
  </Page>;
}
