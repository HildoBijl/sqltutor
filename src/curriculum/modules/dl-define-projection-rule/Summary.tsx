import { Page, Section, Par, Term, IDL } from '@/components';
import { FigureExampleDLQuery } from '../../utils';

export function Summary() {
  return <Page>
    <Section>
      <Par>Projection in Datalog is done by setting up a new view with only specific arguments.</Par>
      <FigureExampleDLQuery query={<>employeeName(fn, ln) :- employee(id, fn, ln, p, e, a, c, hd, cs).</>} actualQuery="SELECT first_name, last_name FROM employees" tableWidth={200} />
      <Par>The notation can be shortened/simplified using <Term>anonymous variables</Term>: we turn any variable we don't use into an underscore <IDL>_</IDL>. The underscore here means "This variable can be anything; we won't use its value."</Par>
      <FigureExampleDLQuery query={<>employeeName(fn, ln) :- employee(_, fn, ln, _, _, _, _, _, _).</>} actualQuery="SELECT first_name, last_name FROM employees" tableWidth={200} />
    </Section>
  </Page>;
}
