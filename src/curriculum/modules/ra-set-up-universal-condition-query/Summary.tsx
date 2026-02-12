import { Box } from '@mui/material';

import { Page, Section, Par, Info, List, Term, Em, M } from '@/components';

import { FigureExampleRAQuery } from '../../utils';
import { ChecklistTable } from './Theory';

export function Summary() {
  return <Page>
    <Section>
      <Par>Data requests with <Term>universal conditions</Term> like "for every" are among the hardest requests. An example is "Find the employees whose contracts, throughout their career, have had <Em>every</Em> possible status (Active, Sick Leave, FMLA, Paid Leave)."</Par>
      <Info>It is useful to formulate universal conditions through a double negative. "Find the employees who do <Em>not</Em> have a contract status they have <Em>not</Em> had."</Info>
      <Par>Evaluating a universal condition comes down to running a checklist for <Em>each</Em> tuple. This is done through the following steps.</Par>
      <List useNumbers sx={{ my: -1 }} itemSx={{ my: 0.5 }} contentSpacing={0.5} items={[
        <Par>Define the <Term>list of entities</Term> you want to run a checklist for (all employees) and the <Term>checklist</Term> that you want to run for them (all possible statuses).</Par>,
        <>
          <Par>Set up the <Term>checklist table</Term> as overview of which entity has met which check. It is helpful to intuitively visualize this as a 2D table with checkmarks, even when in reality it is a two-attribute relation.</Par>
          <Box><ChecklistTable scale={0.6} /></Box>
        </>,
        <Par>Manipulate the checklist table to <Term>apply the given conditions</Term>. You may need to flip the checklist table to find the checks that entities have not passed.</Par>,
        <Par>Find the entities satisfying the conditions by <Term>squashing</Term> the table: project it onto the entities. If needed, process the result further.</Par>,
      ]} />
      <Par>A short-cut to find all entities that satisfy all checks is the <Term>division operator</Term> <M>\div</M>. Given a checklist table and a checklist, it gives all entities satisfying all checks. Or more formally, the division <M>a \div b</M> gives a relation <M>c</M> consisting of all tuples such that <M>b \times c \subseteq a</M>.</Par>
      <FigureExampleRAQuery query={<>all_statuses ← ∏<sub>status</sub>(emp_data)<br />
        statuses_held ← ∏<sub>e_id,status</sub>(emp_data)<br />
        statuses_held ÷ all_statuses</>} actualQuery="SELECT DISTINCT e_id FROM emp_data EXCEPT SELECT DISTINCT e_id FROM (SELECT DISTINCT e1.e_id, e2.status FROM emp_data e1 JOIN emp_data e2 EXCEPT SELECT DISTINCT e_id, status FROM emp_data)" tableWidth={100} />
    </Section>
  </Page>;
}
