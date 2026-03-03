import { Page, Section, Par, Term, Em, IDL } from '@/components';

import { FigureExampleDLQuery } from '../../utils';

export function Summary() {
  return <Page>
    <Section>
      <Par>In Datalog, the <IDL>not</IDL> keyword specifies a condition that must <Em>not</Em> hold true. We could for instance find all employees that do not manage a department.</Par>
      <FigureExampleDLQuery query={<>employeeId(id) :- employee(id, fn, ln, p, e, a, c, hd, cs).<br/>managerId(mid) :- department(id, n, mid, b, ne).<br/>nonManagerId(id) :- employeeId(id), not managerId(id).</>} actualQuery="SELECT e_id FROM employees EXCEPT SELECT manager_id AS e_id FROM departments" tableWidth={150} />
      <Par>Most literals are <Term>positive literals</Term>, but a literal that specifies something that should <Em>not</Em> hold is called a <Term>negative literal</Term>.</Par>
      <Par>A literal that uses arithmetics (like the comparison <IDL>ne &gt; 10</IDL>) is called an <Term>arithmetic literal</Term>.</Par>
      <FigureExampleDLQuery query={<>largeDepartment(id, n, mid, b, ne) :- department(id, n, mid, b, ne), ne &gt; 10.</>} actualQuery="SELECT * FROM departments WHERE nr_employees > 10" tableWidth={500} below />
      <Par>Negative literals and arithmetic literals generally do not bound variables: the variables involved can take a multitude of values that do not originate from any of the original predicates. Having <Term>unbounded variables</Term> may cause <Term>infinitely large outputs</Term> (if any unbounded variables appear in the rule head) or result in <Term>ineffective literals</Term> (if all unbounded variables only appear in the rule body).</Par>
      <Par>A Datalog rule is <Term>safe</Term> if <Em>every</Em> variable in the rule appears in at least one positive non-arithmetic predicate in the rule body. In general, all rules in a Datalog program must be safe.</Par>
    </Section>
  </Page>;
}
