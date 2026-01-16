import { Box } from '@mui/material';

import { Page, Section, Par, List, Term, Em, M } from '@/components';

import { FigureExampleRAQuery } from '../../utils';
import { EntityRequirementTable } from './Theory';

export function Summary() {
  return <Page>
    <Section>
      <Par>Data requests with <Term>universal conditions</Term> like "for every" are among the hardest requests. An example is "Find the employees whose contracts, throughout their career, have had <Em>every</Em> possible status (Active, Sick Leave, FMLA, Paid Leave)." To tackle such requests, take the following six steps.</Par>
      <List sx={{ my: -1 }} itemSx={{ my: 0 }} contentSpacing={1} items={[
        <Par>Set up the <Term>entity list</Term> of entities you want to run a checklist for. (All employees.)</Par>,
        <Par>Set up the <Term>requirement list</Term> of checks that need to be run for each entity. (All possible statuses.)</Par>,
        <>
          <Par>Set up the <Term>entity-requirement table</Term> as overview of which entity has met which requirement. You can intuitively visualize this as a 2D table with checkmarks, even when in reality it is a two-attribute relation.</Par>
          <Box><EntityRequirementTable scale={0.6} /></Box>
        </>,
        <Par>Manipulate the entity-requirement list to <Term>apply the given conditions</Term>. (In the example: flip all values in the table.)</Par>,
        <Par><Term>Project</Term> the result onto the entities to see which entities meet the given conditions. (We get all employees that are missing some status.)</Par>,
        <Par>Apply <Term>further processing</Term> of the result as needed. (We find all <Em>other</Em> employees: the ones who <Em>have</Em> collected all statuses.)</Par>,
      ]} />
      <Par>When the requirement list is a <Term>fixed set</Term> (it does not depend on which entity is checked) then we can use the <Term>division operator</Term> <M>\div</M> as a short-cut. It functions as opposite of the Cartesian product: if <M>a \div b</M> gives a relation instance <M>c</M>, then <M>c</M> contains all possible tuples such that <M>b \times c \subseteq a</M>. The division operator can be used to more easily set up universal condition queries.</Par>
      <FigureExampleRAQuery query={<>all_statuses ← ∏<sub>status</sub>(emp_data)<br />
        statuses_held ← ∏<sub>e_id,status</sub>(emp_data)<br />
        statuses_held ÷ all_statuses</>} actualQuery="SELECT DISTINCT e_id FROM emp_data EXCEPT SELECT DISTINCT e_id FROM (SELECT DISTINCT e1.e_id, e2.status FROM emp_data e1 JOIN emp_data e2 EXCEPT SELECT DISTINCT e_id, status FROM emp_data)" tableWidth={100} />
    </Section>
  </Page>;
}
