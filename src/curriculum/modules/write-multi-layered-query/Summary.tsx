import { Page, Section, ISQL, Par, Quote, Info, Term } from '@/components';

import { FigureExampleQuery } from '@/curriculum/utils/queryFigures';

export function Summary() {
  return <Page>
    <Section>
      <Par>We can use the <ISQL>WITH</ISQL> statement before the <ISQL>SELECT</ISQL> clause to create <Term>temporary tables</Term>, formally known as <Term>Common Table Expressions (CTEs)</Term>. These CTEs are very useful to structure the queries we write, preventing us from repeating ourselves or getting queries within queries within queries.</Par>
      <Quote>Find the email addresses of all users involved (as vendor or buyer) in transactions validated by employees earning less than 200,000.</Quote>
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
<Info>CTEs are forgotten again as soon as the query ends.</Info>
      <Par>Whenever writing complicated queries, it helps to set up many small and <Term>intuitive</Term> CTEs, <Term>based on keys</Term>. By building them up and <Term>testing</Term> them as we go, we keep the process of writing queries clear and free of errors.</Par>
    </Section>
  </Page>;
}
