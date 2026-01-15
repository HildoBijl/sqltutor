import { Box } from '@mui/material';

import { Page, Section, Par, List, Info, Term, Em, M, RA, IRA, Link } from '@/components';
import { FigureExampleRAQuery } from '../../utils';

export function Theory() {
  return <Page>
    <Section>
      <Par>By now we know how to set up queries combining multiple relations. As the requests get complexer, the queries become longer. We need a strategy to manage this.</Par>
    </Section>

    <Section title="Use the assignment operator to structure your query">
      <Par>Suppose that we want to find all department managers who earn less than 200,000 per year. We have actually done this before, when <Link to="/skill/ra-set-up-multi-condition-query">setting up multi-condition queries</Link>. Back then, we set up one large query.</Par>
      <FigureExampleRAQuery query={<>ρ<sub>manager_id→e_id</sub>(∏<sub>manager_id</sub>(departments)) ∩ ∏<sub>e_id</sub>(σ<sub>salary &lt; 200000</sub>(employees))</>} actualQuery="SELECT manager_id AS e_id FROM departments INTERSECT SELECT e_id FROM employees WHERE current_salary < 200000" tableWidth={150} />
      <Par>It is already a bit hard to read back this query and understand what it does. Imagine if queries get larger!</Par>
      <Par>The main way to create structure in a query is through the <Term>assignment operator</Term> <M>\leftarrow</M>. Through it, we can create intermediate relations, that are temporarily available for us to use further. We could for instance first make a list of all department managers and <Em>assign</Em> those to a temporary new relation.</Par>
      <RA>department_managers ← ρ<sub>manager_id→e_id</sub>(∏<sub>manager_id</sub>(departments))</RA>
      <Par>Then we make a list of low-earning employees and <Em>assign</Em> those too.</Par>
      <RA>low_earners ← ∏<sub>e_id</sub>(σ<sub>salary &lt; 200000</sub>(employees))</RA>
      <Par>Then we combine these results to find the low-earning managers.</Par>
      <RA>low_earning_managers ← department_managers ∩ low_earners</RA>
      <Par>Note that we have used the relations that we previously assigned! Optionally, we can even join in extra data for these low-earning managers (like their names and salaries) through a join.</Par>
      <RA>∏<sub>first_name,last_name,salary</sub>(low_earning_managers ⋈ employees)</RA>
      <Par>All together, the steps we have taken form a <Term>relational algebra script</Term>. Such scripts can be used to set up more complicated relational algebra queries.</Par>
      <FigureExampleRAQuery query={<>
        department_managers ← ρ<sub>manager_id→e_id</sub>(∏<sub>manager_id</sub>(departments))<br />
        low_earners ← ∏<sub>e_id</sub>(σ<sub>salary &lt; 200000</sub>(employees))<br />
        low_earning_managers ← department_managers ∩ low_earners<br />
        ∏<sub>first_name,last_name,salary</sub>(low_earning_managers ⋈ employees)
      </>} actualQuery="SELECT first_name, last_name, current_salary FROM employees NATURAL JOIN (SELECT manager_id AS e_id FROM departments INTERSECT SELECT e_id FROM employees WHERE current_salary < 200000)" tableWidth={280} tableScale={0.8} />
      <Info>Usually all lines in a relational algebra script use an assignment operator except the last one. The result of this last line is the <Term>output</Term> of the relational algebra script.</Info>
    </Section>

    <Section title="Apply tips and tricks to set up a relational algebra script">
      <Par>When tackling complicated data requests, it is often hard to see which steps need to be taken. There are a few tips and tricks that can help you here.</Par>
      <List useNumbers sx={{my: -1}} itemSx={{ my: 1 }} contentSpacing={1} items={[
        <>
          <Par sx={{ mb: 0.5 }}>First <Term>solve the query manually</Term> for the relation instances (the actual data) for a few entries. This will give you useful insights into what data from what relations you need, and which foreign keys you need to link the relations.</Par>
          <Par>If you don't have any sample data, but only a relation schema, then first create your own mock data! Only 3-8 tuples per relation is already enough to get a better feel for the data.</Par>
        </>,
        <>
          <Par>Set up assigned relations <Term>based on keys</Term>. Keys represent a tuple in its minimal form. They are far more manageable to work with than the full tuple. If needed, you can always use a natural join of the key with the full relation to get the other attributes of the relation back.</Par>
        </>,
        <>
          <Par>Set up assigned relations that are <Term>intuitive</Term>. Every relation you assign should mean something, and you should be able to explain to a colleague, ideally in a single sentence, what the relation stands for. Or even better: make the relation name you assigned self-explanatory! By making your relations intuitive, you support your own intuition too.</Par>
        </>,
        <>
          <Par>When you find the word "never" or "every" in a request, first <Term>do the opposite</Term>. Relational algebra is very good in existence checks: we just check if a tuple exists in a relation. But a "never" or "every" check is not something relational algebra can directly do.</Par>
          <Par>To show how this "do the opposite" idea works, we use an example. Suppose we want to find all the employees who have <Em>never</Em> been on sick leave. This sounds hard, but we could first do the opposite: we find the employees that <Em>have</Em> been on sick leave.</Par>
          <RA>had_sick_leave ← ∏<sub>e_id</sub>(σ<sub>status = "sick leave"</sub>(emp_data))</RA>
          <Par>The people who have <Em>never</Em> been on sick leave are all employees <Em>except</Em> the employees who had sick leave.</Par>
          <RA>all_employees ← ∏<sub>e_id</sub>(employees)<br />never_had_sick_leave ← all_employees - had_sick_leave</RA>
          <Info>Note that we could have merged the two above steps into one step too as <IRA>never_had_sick_leave ← ∏<sub>e_id</sub>(employees) - had_sick_leave</IRA>. However, using smaller steps makes everything easier to read and understand. If every step is easy to follow, it is harder to make errors and it is easier to spot any errors that do occur.</Info>
          <Par>Optionally, we can again join in extra data as output for our final result.</Par>
          <Box>
            <FigureExampleRAQuery query={<>
              had_sick_leave ← ∏<sub>e_id</sub>(σ<sub>status = "sick leave"</sub>(emp_data))<br />
              all_employees ← ∏<sub>e_id</sub>(employees)<br />
              never_had_sick_leave ← all_employees - had_sick_leave<br />
              ∏<sub>first_name,last_name,salary</sub>(never_had_sick_leave ⋈ employees)
            </>} actualQuery="SELECT first_name, last_name, current_salary FROM employees NATURAL JOIN (SELECT e_id FROM employees EXCEPT SELECT e_id FROM emp_data WHERE status = 'sick leave')" tableWidth={280} tableScale={0.8} />
          </Box>
        </>,
      ]} />
      <Par>By using the above tips and tricks, you should be able to turn most data requests into properly functioning relational algebra scripts.</Par>
    </Section>
  </Page>;
}
