import { Page, Section, Par, List, Warning, Info, Term, Em, IDL } from '@/components';
import { FigureExampleDLQuery } from '../../utils';

export function Summary() {
  return <Page>
    <Section>
      <Par>When using the <IDL>not</IDL> keyword in Datalog to set up a <Term>negation rule</Term>, we must make sure that there are no unbound variables. There are two ways to do so.</Par>
      <List useNumbers items={[
        <>
          <Par sx={{ mb: 1 }}>We can <Term>define helpful intermediate predicates</Term> that do not have any arguments that we do not need.</Par>
          <FigureExampleDLQuery query={<>managerId(id) :- department(_, _, id, _, _).<br />employeeId(id) :- employee(id, _, _, _, _, _, _, _, _).<br />nonManagerId(id) :- employeeId(id), not managerId(id).</>} actualQuery="SELECT e_id FROM employees EXCEPT SELECT manager_id AS e_id FROM departments" tableWidth={150} />
          <Par sx={{ mt: 1 }}>This method is considered the cleanest as it results in programs with short rules. It does result in <Em>more</Em> rules/predicates, but since these are often <Term>reusable</Term> this could also be an advantage.</Par>
        </>,
        <>
          <Par sx={{ mb: 1 }}>We can <Term>use anonymous variables</Term> to get rid of any unbound variables.</Par>
          <FigureExampleDLQuery query={<>nonManagerId(id) :-<br />        employee(id, _, _, _, _, _, _, _, _),<br />        not department(_, _, id, _, _).</>} actualQuery="SELECT e_id FROM employees EXCEPT SELECT manager_id AS e_id FROM departments" tableWidth={150} />
          <Par sx={{mt: 1}}>This method is considered as a quick work-around. It results in fewer yet longer and more complicated rules, which is not beneficial for readability.</Par>
        </>,
      ]} />
      <Warning>The literal <IDL>not department(did, dn, id, b, ne)</IDL> has a very different meaning than the literal <IDL>not department(_, _, id, _, _)</IDL>. Don't confuse them!</Warning>
      <Info>No matter the method that you use: <Em>always</Em> check your rules for safety after writing them.</Info>
    </Section>
  </Page>;
}
