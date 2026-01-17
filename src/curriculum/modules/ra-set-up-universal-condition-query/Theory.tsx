import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

import { useRefWithValue } from '@/utils/dom';
import { Page, Section, Par, List, Warning, Info, Term, Em, M, BM, RA, IRA } from '@/components';
import { type DrawingData, Drawing, Element, useRefWithBounds } from '@/components';
import { useQueryResult } from '@/components/sql/sqljs';
import { DataTable } from '@/components';
import { useTheorySampleDatabase } from '@/learning/databases';
import { FigureExampleRAQuery } from '../../utils';

export function Theory() {
  return <Page>
    <Section>
      <Par>By now we know how to set up relatively complex relational algebra queries and scripts. We have not yet tackled the hardest ones though: requests with <Term>universal conditions</Term> such as "for every [...]". Let's study how to tackle those.</Par>
    </Section>

    <Section title="Flip the request: use a double negative">
      <Par>Let's consider an example: we study the employee contracts from the <Term>emp_data</Term> relation. These contracts can have a variety of statuses.</Par>
      <FigureExampleRAQuery query={<>∏<sub>status</sub>(emp_data)</>} actualQuery="SELECT DISTINCT status FROM emp_data" tableWidth={150} />
      <Par>How can we find the employees who have had <Em>all</Em> these statuses at some point during their career?</Par>
      <Par>To start, we apply the usual tricks in setting up complex queries.</Par>
      <List items={[
        <>We <Term>manually execute the request</Term>. To find the requested employees, we must run a checklist for each employee. "Have they been on sick leave? Have they been on paid leave?" And so forth. We must run this checklist for <Em>every</Em> employee. At the end, we should check if the checklist is fully ticked off. If so, the employee has had all statuses. Whatever relational algebra query we end up writing will have to do something similar. We need a checklist!</>,
        <>We <Term>reformulate the request</Term>, replacing any difficult universal condition like "for every" by existence checks. Our example request can be reformulated as "Find all employees for which there exists no status which they have not had." Note that the "for every" request has turned into a double negative.</>,
      ]} />
      <Par>The above steps are meant to improve our intuition of the data and what steps need to be taken to set up the query. Once we have an intuitive feel, we can start writing the relational algebra script.</Par>
    </Section>

    <Section title="Gather data: set up the checklist table">
      <Par>When starting the script, it helps to set up two supporting lists.</Par>
      <List sx={{ my: -1 }} itemSx={{ my: 1 }} contentSpacing={1} items={[
        <>
          <Par>The <Term>entity list</Term> contains (references to) all the entities that we want to run a checklist for. We want to run checks for each employee, so our entity list will be all the employee keys: their IDs.</Par>
          <Box><FigureExampleRAQuery query={<>all_employees ← ∏<sub>e_id</sub>(emp_data)</>} actualQuery="SELECT DISTINCT e_id FROM emp_data" tableWidth={100} /></Box>
        </>,
        <>
          <Par>The <Term>checklist</Term> contains (references to) all the checks that we need to run for said entities. We want to verify every status for every employee, so for us this is a list of all possible contract statuses.</Par>
          <Box><FigureExampleRAQuery query={<>all_statuses ← ∏<sub>status</sub>(emp_data)</>} actualQuery="SELECT DISTINCT status FROM emp_data" tableWidth={100} /></Box>
        </>,
      ]} />
      <Par>Once we know the checklist and who/what to run it for, we set up the <Term>checklist table</Term>. This is the relation that has all combinations (entity, check) that hold <Em>according to the given data</Em>. For us, that is the list of statuses that the employees have held.</Par>
      <FigureExampleRAQuery query={<>statuses_held ← ∏<sub>e_id,status</sub>(emp_data)</>} actualQuery="SELECT DISTINCT e_id, status FROM emp_data" tableWidth={200} />
      <Par>The checklist table is a relation with two columns. However, it is very helpful to imagine it differently: as a 2-dimensional table, with the entities listed vertically and the checks listed horizontally. Each field contains a checkmark if the given combination is present in our data.</Par>
      <ChecklistTable />
      <Par>Having this table in mind makes all the subsequent steps a lot easier.</Par>
    </Section>

    <Section title="Apply the conditions: combine/flip and squash the checklist table">
      <Par>Once we have the checklist table, we apply the given conditions to it. In our example case, we want to find if an employee has had <Em>all</Em> statuses. This is difficult, but we could also do the opposite: see if there is a status that each employee has <Em>not</Em> had. To do so, we flip the checklist table. This is done in two steps.</Par>
      <List sx={{ my: -1 }} itemSx={{ my: 1 }} contentSpacing={1} items={[
        <>
          <Par>Set up the <Term>Cartesian product</Term> of the entity list and the checklist. This denotes the table with <Em>all</Em> fields checked.</Par>
          <Box><ChecklistTable all={true} /></Box>
        </>,
        <>
          <Par>Remove the entries from the checklist table. This gives us the list of statuses which employees have <Em>not</Em> had.</Par>
          <Box><ChecklistTable flip={true} /></Box>
        </>,
      ]} />
      <Par>This is summarized through the following relational algebra assignment.</Par>
      <FigureExampleRAQuery query={<>statuses_not_held ← all_employees x all_statuses - statuses_held</>} actualQuery="SELECT DISTINCT e1.e_id, e2.status FROM emp_data e1 JOIN emp_data e2 EXCEPT SELECT DISTINCT e_id, status FROM emp_data" tableWidth={200} />
      <Par>Once we have applied the conditions, we <Term>squash</Term> the entity-requirement table into a list: we take the projection with respect to the entities. This gives us the employees for which there is a status they have <Em>not</Em> had.</Par>
      <FigureExampleRAQuery query={<>employees_with_missing_status ← ∏<sub>e_id</sub>(statuses_not_held)</>} actualQuery="SELECT DISTINCT e_id FROM (SELECT DISTINCT e1.e_id, e2.status FROM emp_data e1 JOIN emp_data e2 EXCEPT SELECT DISTINCT e_id, status FROM emp_data)" tableWidth={100} />
      <Par>The above result is not yet what we want. We want to find the opposite: all employees for which there is <Em>not</Em> a status they have not had. To find these employees, we once more flip the result.</Par>
      <FigureExampleRAQuery query={<>all_employees - employees_with_missing_status</>} actualQuery="SELECT DISTINCT e_id FROM emp_data EXCEPT SELECT DISTINCT e_id FROM (SELECT DISTINCT e1.e_id, e2.status FROM emp_data e1 JOIN emp_data e2 EXCEPT SELECT DISTINCT e_id, status FROM emp_data)" tableWidth={100} />
      <Info>The original request had a double negative: two not-statements. Each not-statement results in a flip (a set difference) in our final relational algebra script. It's a nice way to check if you haven't forgotten something: "Did we get the same number of flips as we have the word <Em>not</Em> in our request?"</Info>
    </Section>

    <Section title="Use the shortcut: the division operator">
      <Par>The above procedure is a lengthy one. It has resulted in the following six-step script.</Par>
      <RA>
        all_employees ← ∏<sub>e_id</sub>(emp_data)<br />
        all_statuses ← ∏<sub>status</sub>(emp_data)<br />
        statuses_held ← ∏<sub>e_id,status</sub>(emp_data)<br />
        statuses_not_held ← all_employees x all_statuses - statuses_held<br />
        employees_with_missing_status ← ∏<sub>e_id</sub>(statuses_not_held)<br />
        all_employees - employees_with_missing_status
      </RA>
      <Par>The request of "finding all entities for which a certain fixed list of checks holds" is a common use case though. Because of that, an operator has been defined to make this procedure easier: the <Term>division operator</Term> <M>\div</M>.</Par>
      <Par>The division operator is a bit tricky to grasp, so first let's demonstrate it with an example. Consider the query <IRA>statuses_held ÷ all_statuses</IRA>. We can visualize this with actual data.</Par>
      <FigureDivisionTable />
      <Par>The result of this division will be all employee IDs for which <Em>every</Em> status is present in the left relation. Or to be put it in other terms: it will be all entities from the checklist table for which all checkmarks are present.</Par>
      <Par>More generally, consider two relations <M>A</M> and <M>B</M> with corresponding relation instances <M>a</M> and <M>b</M>, respectively. We may only use the division operator if the attributes of <M>B</M> are a <Em>subset</Em> of the attributes of <M>A</M>. That is, whenever <M>B</M> has attributes <M>{`\\{B_1, \\ldots, B_m\\}`}</M>, then <M>A</M> must have attributes <M>{`\\{C_1, \\ldots, C_n, B_1, \\ldots, B_m\\}`}</M>. When this is the case, we can write</Par>
      <BM>a \div b.</BM>
      <Par>The result is a relation instance <M>c</M> having attributes <M>{`\\{C_1, \\ldots, C_n\\}`}</M>. The <Term>division</Term> is defined such that <M>c</M> consists of <Em>all</Em> the possible tuples for which we have <M>b \times c \subseteq a</M>. In other words, <M>c</M> is the set of all tuples <M>(c_1, \ldots, c_n)</M> such that <M>(c_1, \ldots, c_n, b_1, \ldots, b_m) \in a</M> for <Em>every</Em> tuple <M>(b_1, \ldots, b_m) \in b</M>.</Par>
      <Par>To find the division <M>a \div b</M>, we can use a the <Term>division formula</Term></Par>
      <BM>{`a \\div b = \\Pi_{A-B}\\left(a\\right) - \\Pi_{A-B}\\left(\\left(\\Pi_{A-B}\\left(a\\right) \\times b\\right) - a\\right).`}</BM>
      <Par>Note that the above formula is exactly the procedure that we have followed in the script above: <M>b</M> represents all statuses, and <M>{`\\Pi_{A-B}\\left(a\\right)`}</M> represents all employee IDs.</Par>
      <Par>Given this division operator, we can shorten our earlier relational algebra script. The division operator effectively replaces the last three steps.</Par>
      <FigureExampleRAQuery query={<>all_statuses ← ∏<sub>status</sub>(emp_data)<br />
        statuses_held ← ∏<sub>e_id,status</sub>(emp_data)<br />
        statuses_held ÷ all_statuses</>} actualQuery="SELECT DISTINCT e_id FROM emp_data EXCEPT SELECT DISTINCT e_id FROM (SELECT DISTINCT e1.e_id, e2.status FROM emp_data e1 JOIN emp_data e2 EXCEPT SELECT DISTINCT e_id, status FROM emp_data)" tableWidth={100} />
      <Par>We could even have solved the whole problem in the very short single-line query <IRA>∏<sub>e_id,status</sub>(emp_data) ÷ ∏<sub>status</sub>(emp_data)</IRA>. This is both a lot shorter and a lot clearer than what we had before! The division operator can hence be a <Em>very</Em> powerful short-cut in universal condition queries.</Par>
      <Warning>
        <Par sx={{ mb: 1 }}>You can only apply the division operator when the list of checks we run is a <Term>fixed set</Term>: it does not depend on the entity that is being examined. For our example that is the case: we are checking the same statuses for every employee.</Par>
        <Par>But now let's adjust our problem. What if we want to find all employees who have had all the statuses that <Em>their direct supervisor</Em> has had? In this case, the checklist (which statuses they should have had) varies per employee! Since the checklist is not a fixed set, the division operator will not work here. In such a case, we have no choice but follow the steps described above: set up the checklist table and subsequently apply the given conditions to it.</Par>
      </Warning>
    </Section>
  </Page>;
}

type RowData = {
  id: number;
  active: boolean;
  sickLeave: boolean;
  fmla: boolean;
  paidLeave: boolean;
};

const rows: RowData[] = [
  { id: 41378877, active: true, sickLeave: true, fmla: false, paidLeave: false },
  { id: 41376655, active: true, sickLeave: true, fmla: true, paidLeave: true },
  { id: 41651199, active: true, sickLeave: true, fmla: false, paidLeave: true },
  { id: 41655533, active: true, sickLeave: false, fmla: false, paidLeave: false },
  { id: 42223311, active: true, sickLeave: false, fmla: false, paidLeave: true },
];

export function ChecklistTable({ all = false, flip = false, scale = 0.8 }) {
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();
  const [tRef, tBounds] = useRefWithBounds(drawingData);
  const tableWidth = 500;
  const width = tableWidth * scale;
  const height = tBounds?.height ?? 200;

  return <Drawing ref={drawingRef} width={width} height={height} maxWidth={width}>
    <Element scale={scale} anchor={[-1, -1]}>
      <TableContainer ref={tRef} component={Paper} sx={{ width: tableWidth }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell align="center">Active</TableCell>
              <TableCell align="center">Sick Leave</TableCell>
              <TableCell align="center">FMLA</TableCell>
              <TableCell align="center">Paid Leave</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell component="th" scope="row">
                  {row.id}
                </TableCell>
                <TableCell align="center">
                  {(all || (row.active !== flip)) && <CheckIcon color="success" />}
                </TableCell>
                <TableCell align="center">
                  {(all || (row.sickLeave !== flip)) && <CheckIcon color="success" />}
                </TableCell>
                <TableCell align="center">
                  {(all || (row.fmla !== flip)) && <CheckIcon color="success" />}
                </TableCell>
                <TableCell align="center">
                  {(all || (row.paidLeave !== flip)) && <CheckIcon color="success" />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Element>
  </Drawing>;
}

function FigureDivisionTable() {
  const db = useTheorySampleDatabase();
  const d1 = useQueryResult(db?.database, 'SELECT DISTINCT e_id, status FROM emp_data;');
  const d2 = useQueryResult(db?.database, 'SELECT DISTINCT status FROM emp_data;');
  const d3 = useQueryResult(db?.database, 'SELECT DISTINCT e_id FROM emp_data EXCEPT SELECT DISTINCT e_id FROM (SELECT DISTINCT e1.e_id, e2.status FROM emp_data e1 JOIN emp_data e2 EXCEPT SELECT DISTINCT e_id, status FROM emp_data);');
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  const [t1Ref, t1Bounds] = useRefWithBounds(drawingData);
  const [t2Ref, t2Bounds] = useRefWithBounds(drawingData);
  const [t3Ref, t3Bounds] = useRefWithBounds(drawingData);
  const height = Math.max(t1Bounds?.height || 200, t2Bounds?.height || 200, t3Bounds?.height || 200);
  const w1 = 240;
  const w2 = 100;
  const w3 = 140;
  const w4 = 100;
  const w5 = 100;
  const width = w1 + w2 + w3 + w4 + w5;

  return <Drawing ref={drawingRef} width={width} height={height} maxWidth={width * 0.8}>
    <Element position={[0, 0]} anchor={[-1, -1]}>
      <Box sx={{ width: w1 }}>
        <DataTable ref={t1Ref} data={d1} showPagination={false} compact />
      </Box>
    </Element>

    <Element position={[w1 + w2 / 2, height / 2]} scale={2}><span style={{ fontWeight: 500, fontSize: '1em' }}>÷</span></Element>

    <Element position={[w1 + w2, height / 2]} anchor={[-1, 0]}>
      <Box sx={{ width: w3 }}>
        <DataTable ref={t2Ref} data={d2} showPagination={false} compact />
      </Box>
    </Element>

    <Element position={[w1 + w2 + w3 + w4 / 2, height / 2]} scale={2}><span style={{ fontWeight: 500, fontSize: '1em' }}>=</span></Element>

    <Element position={[w1 + w2 + w3 + w4, height / 2]} anchor={[-1, 0]}>
      <Box sx={{ width: w5 }}>
        <DataTable ref={t3Ref} data={d3} showPagination={false} compact />
      </Box>
    </Element>
  </Drawing>;
}