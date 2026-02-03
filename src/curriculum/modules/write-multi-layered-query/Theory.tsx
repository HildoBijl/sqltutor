import { Page, Par, List, Section, Info, Warning, Term, Em, ISQL } from '@/components';

import { FigureExampleQuery } from '@/curriculum/utils/queryFigures';

export function Theory() {
  return <Page>
    <Section>
      <Par>We have seen a variety of ways to set up queries. Joining multiple tables together, applying advanced filters to select the right entries, processing the values, and aggregating the results. When performing all these steps, the queries may grow large, with queries inside queries inside queries. They have <Term>multiple layers</Term>. We need a way to manage this.</Par>
    </Section>

    <Section title="The problem: queries tend to grow larger">
      <Par>Let's consider an example data request involving lots of tables. Suppose that all employees whose current salary is less than 200,000 are suspect: all transactions they have validated need to be reconsidered. And all users (both vendors and buyers) involved in those transactions need to be notified: we need their email addresses. How would we go about getting those?</Par>
      <Par>First we need a list of employees (their IDs) who earn less than 200,000. That's still quite manageable.</Par>
      <FigureExampleQuery query={`
SELECT e_id
FROM employees
WHERE current_salary < 200000;`} tableScale={0.8} tableWidth={120} />
      <Par>Then we need the transactions they have validated. This results in a subquery.</Par>
      <FigureExampleQuery query={`
SELECT vendor_id, buyer_id
FROM transactions
WHERE validated_by IN (
  SELECT e_id
  FROM employees
  WHERE current_salary < 200000
);`} tableScale={0.8} tableWidth={500} />
      <Par>We want a list of all involved users, so we need to merge the two lists. We can do that using a union.</Par>
      <FigureExampleQuery query={`
SELECT vendor_id AS user_id
FROM transactions
WHERE validated_by IN (
  SELECT e_id
  FROM employees
  WHERE current_salary < 200000
)
UNION
SELECT buyer_id AS user_id
FROM transactions
WHERE validated_by IN (
  SELECT e_id
  FROM employees
  WHERE current_salary < 200000
);`} tableScale={0.8} tableWidth={500} />
      <Par>The query becomes large, and we're not even there yet! And to make it worse, we're <Em>repeating</Em> ourselves. If we later on want to change the limit of "200,000" then we need to do so in multiple places. Maybe someone changes it in one place and forgets to change it in the other place. We'd get a wrong query! We need a way to make this process easier.</Par>
    </Section>

    <Section title="Define temporary tables">
      <Par>The key to our problem lies in defining <Term>temporary tables</Term>. Before using <ISQL>SELECT</ISQL>, we may use the <ISQL>WITH</ISQL> keyword to define a temporary table, which we can then use in the rest of our query.</Par>
      <FigureExampleQuery query={`
WITH low_salary_employees AS (
  SELECT e_id
  FROM employees
  WHERE current_salary < 200000
)

SELECT vendor_id AS user_id
FROM transactions
WHERE validated_by IN low_salary_employees
UNION
SELECT buyer_id AS user_id
FROM transactions
WHERE validated_by IN low_salary_employees;`} tableScale={0.8} tableWidth={250} />
      <Par>Such temporary tables are formally called <Term>Common Table Expressions (CTEs)</Term>. They are very powerful tools at structuring queries and making them easier to read. But keep in mind that they are temporary: as soon as the query ends they are forgotten!</Par>
      <Info>Another way to see CTEs is as a table alias. When defining a CTE like <ISQL>low_salary_employees</ISQL>, SQL does not directly set up the table. Instead, whenever SQL encounters the name <ISQL>low_salary_employees</ISQL> later on in the query, it simply substitutes the given definition into the query. So the above two example queries literally do the same thing.</Info>
      <Par>Instead of just one CTE, we can create more. We only use <ISQL>WITH</ISQL> once, but we add the table definitions separated by commas.</Par>
      <FigureExampleQuery query={`
WITH low_salary_employees AS (
  SELECT e_id
  FROM employees
  WHERE current_salary < 200000
), affected_transactions AS (
  SELECT *
  FROM transactions
  WHERE validated_by IN low_salary_employees
)

SELECT vendor_id AS user_id FROM affected_transactions
UNION
SELECT buyer_id AS user_id FROM affected_transactions;`} tableScale={0.8} tableWidth={500} />
      <Warning>Later CTEs may use earlier ones, but not the other way around! Make sure you write your CTEs in a sensible order.</Warning>
      <Par>Let's continue extending our query. Now that the affected users are known, we should get their email addresses. We could do so through a nested query, but it's better to simply add yet another CTE.</Par>
      <FigureExampleQuery query={`
WITH low_salary_employees AS (
  SELECT e_id
  FROM employees
  WHERE current_salary < 200000
), affected_transactions AS (
  SELECT *
  FROM transactions
  WHERE validated_by IN low_salary_employees
), affected_users AS (
  SELECT vendor_id AS user_id FROM affected_transactions
  UNION
  SELECT buyer_id AS user_id FROM affected_transactions
)

SELECT email
FROM accounts
WHERE acct_id IN affected_users;`} tableScale={0.8} tableWidth={500} />
      <Par>This is the result we wanted. The above query is quite easy to read, given how many tables it touches. It is way easier than the alternative that we would have gotten without CTEs. Good luck making sense of the following query!</Par>
      <FigureExampleQuery query={`
SELECT email
FROM accounts
WHERE acct_id IN (
  SELECT vendor_id AS user_id
  FROM transactions
  WHERE validated_by IN (
    SELECT e_id
    FROM employees
    WHERE current_salary < 200000
  )
  UNION
  SELECT buyer_id AS user_id
  FROM transactions
  WHERE validated_by IN (
    SELECT e_id
    FROM employees
    WHERE current_salary < 200000
  )
);`} tableScale={0.8} tableWidth={500} />
    </Section>

    <Section title="Use common CTE tips and tricks">
      <Par>CTEs are a very powerful tool at structuring complex queries. When setting up the CTEs, there are a few tips and tricks that are useful to apply. We've already seen some of them applied in the example above, but it's useful to outline them all together.</Par>
      <List useNumbers items={[
        <>Start by <Term>executing the data request manually</Term>. When we do so, we often already generate lists (if only in our head) to support what we're doing. These lists are probably worthwhile to turn into CTEs.</>,
        <>Set up CTEs using <Term>keys</Term> (or combinations of keys). Keys are far easier to work with than full records. And if we have keys, we can easily include the relevant rows again through a look-up query.</>,
        <>Set up CTEs that are <Term>easy to understand</Term>. The name itself should already be clear about what exactly it represents. If this is not the case, we may want to reconsider the CTE we are setting up.</>,
        <>Work <Term>step by step</Term>. First we write a query for a CTE and <Em>test</Em> if it works as intended. Once it does, we turn it into a CTE and use it in the next query. We repeat as we work towards are final query.</>,
        <>Use <Term>small steps</Term> whenever possible. If our query is getting large, it probably means we should split it up into more CTEs. The simpler each CTE is, the better, even if we use more of them.</>,
      ]} />
      <Par>With these tips and tricks, we can not only turn every data request into a functioning query, but we keep our process clear while doing so.</Par>
    </Section>
  </Page>;
}
